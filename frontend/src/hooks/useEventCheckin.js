import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import EventService from '../services/event.service';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Hook to check if a user has been checked in to an event
 * Will poll for check-in status and show a notification when check-in is detected
 */
export const useEventCheckin = (eventId) => {
  const { currentUser } = useAuth();
  const { showSuccessNotification } = useNotification();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkedInTime, setCheckedInTime] = useState(null);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  // Fetch event details to check if user is checked in
  const { data: eventData, isLoading, refetch } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => EventService.getEvent(eventId),
    refetchInterval: isCheckedIn ? false : 5000, // Poll every 5 seconds until checked in
    enabled: !!eventId && !!currentUser?.id,
    onSuccess: (data) => {
      // If we're the organizer, we need to check the guests array
      if (data.isOrganizer && data.guests) {
        const currentUserGuest = data.guests.find(
          (guest) => guest.id === currentUser?.id
        );
        
        if (currentUserGuest?.checkedIn && !isCheckedIn) {
          setIsCheckedIn(true);
          setCheckedInTime(currentUserGuest.checkedInAt || new Date().toISOString());
          
          // Show notification if we haven't shown it yet
          if (!hasShownNotification) {
            showSuccessNotification(
              'Check-in Successful', 
              `You have been checked in to ${data.name}`,
              8000
            );
            setHasShownNotification(true);
          }
        }
      } 
      // For regular users, we rely on isAttending and need to check attendance separately
      else if (data.isAttending) {
        checkAttendanceStatus();
      }
    }
  });

  // Separate function to check attendance status for regular users
  const checkAttendanceStatus = async () => {
    try {
      const attendanceData = await EventService.getAttendanceStatus(eventId);
      if (attendanceData.checkedIn && !isCheckedIn) {
        setIsCheckedIn(true);
        setCheckedInTime(attendanceData.checkedInAt || new Date().toISOString());
        
        // Show notification if we haven't shown it yet
        if (!hasShownNotification && eventData) {
          showSuccessNotification(
            'Check-in Successful', 
            `You have been checked in to ${eventData.name}`,
            8000
          );
          setHasShownNotification(true);
        }
      }
    } catch (error) {
      console.error('Error checking attendance status:', error);
    }
  };

  // Poll for attendance status separately for regular users
  useEffect(() => {
    if (!eventId || !currentUser?.id || isCheckedIn) return;
    
    const interval = setInterval(() => {
      checkAttendanceStatus();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [eventId, currentUser?.id, isCheckedIn]);

  return {
    isCheckedIn,
    checkedInTime,
    eventData,
    isLoading,
    refetch
  };
}; 