import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { useAuth } from '../contexts/AuthContext';
import useUserProfile from '../hooks/useUserProfile';
import useUserTransactions from '../hooks/useUserTransactions';
import useEvents from '../hooks/useEvents';
import { usePromotions } from '../hooks/usePromotions';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import QRCode from '../components/common/QRCode';
import UniversalQRCode from '../components/common/UniversalQRCode';
import RedemptionModal from '../components/user/RedemptionModal';
import TransferModal from '../components/user/TransferModal';
import theme from '../styles/theme';
import {
  FaQrcode,
  FaExchangeAlt,
  FaGift,
  FaCalendarAlt,
  FaTags,
  FaChevronRight,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaArrowLeft,
  FaUser,
  FaStar,
  FaAward,
  FaCrown,
  FaMedal,
  FaTrophy,
  FaChevronUp,
  FaInfoCircle,
  FaCalendarDay,
  FaPercentage,
  FaCoins,
  FaClock,
  FaLock,
  FaMapMarkerAlt,
  FaCheckCircle
} from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useEventCheckin } from '../hooks/useEventCheckin';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.xl};
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const ShortcutsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const ShortcutCard = styled(({ as, ...rest }) => {
  const Component = as || Link;
  return <Component {...rest} />;
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.md};
  transition: transform ${theme.transitions.default}, box-shadow ${theme.transitions.default};
  color: ${theme.colors.text.primary};
  border: none;
  text-decoration: none;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.xl};
    text-decoration: none;
  }
  
  svg {
    font-size: 2rem;
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.primary.main};
  }
  
  span {
    font-weight: ${theme.typography.fontWeights.medium};
  }
`;

const PointsOverview = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.primary.main};
  border-radius: ${theme.radius.xl};
  color: ${theme.colors.primary.contrastText};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.lg};
  position: relative;
  overflow: hidden;
  width: 100%;
  
  &::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    border-radius: ${theme.radius.full};
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -70px;
    left: -70px;
    width: 250px;
    height: 250px;
    border-radius: ${theme.radius.full};
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const PointsTitle = styled.h2`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-bottom: ${theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const PointsAmount = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  margin-bottom: ${theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const PointsActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.sm};
  position: relative;
  z-index: 1;
  
  .redeem-button {
    background-color: ${theme.colors.accent.main};
    &:hover {
      background-color: ${theme.colors.accent.dark};
    }
  }
  
  .transfer-button {
    background-color: ${theme.colors.secondary.main};
    color: ${theme.colors.secondary.contrastText};
    &:hover {
      background-color: ${theme.colors.secondary.dark};
    }
  }
  
  button {
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.xs};
    height: auto;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ViewAllLink = styled(Link)`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    font-size: 14px;
  }
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-of-type {
    border-bottom: none;
  }
`;

const TransactionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing.md};
  
  ${({ type }) => {
    switch (type) {
      case 'purchase':
        return css`
          background-color: ${theme.colors.secondary.light};
          color: ${theme.colors.secondary.dark};
        `;
      case 'redemption':
        return css`
          background-color: ${theme.colors.accent.light};
          color: ${theme.colors.accent.dark};
        `;
      case 'transfer':
        return css`
          background-color: ${theme.colors.primary.light};
          color: ${theme.colors.primary.dark};
        `;
      case 'adjustment':
        return css`
          background-color: ${theme.colors.info.light};
          color: ${theme.colors.info.dark};
        `;
      case 'event':
        return css`
          background-color: ${theme.colors.success.light};
          color: ${theme.colors.success.dark};
        `;
      default:
        return css`
          background-color: ${theme.colors.border.light};
          color: ${theme.colors.text.secondary};
        `;
    }
  }}
`;

const TransactionInfo = styled.div`
  flex: 1;
  
  .transaction-type {
    font-weight: ${theme.typography.fontWeights.medium};
    font-size: ${theme.typography.fontSize.md};
  }
  
  .transaction-date {
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const TransactionAmount = styled.div`
  font-weight: ${theme.typography.fontWeights.medium};
  font-size: ${theme.typography.fontSize.md};
  
  ${({ positive }) =>
    positive
      ? css`
          color: ${theme.colors.success.main};
        `
      : css`
          color: ${theme.colors.error.main};
        `}
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.md};
`;

const PromotionSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const PromotionTypeHeader = styled.div`
  background-color: ${({ type }) => 
    type === 'automatic' 
      ? theme.colors.accent.main 
      : theme.colors.primary.light};
  color: ${({ type }) => 
    type === 'automatic' 
      ? theme.colors.accent.contrastText 
      : 'white'};
  font-weight: ${theme.typography.fontWeights.semiBold};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  border-radius: ${theme.radius.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const PromotionCard = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  margin-bottom: ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.light};
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.md};
    text-decoration: none;
    color: inherit;
    background-color: ${theme.colors.background.hover};
  }
`;

const PromotionContent = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  flex: 1;
  display: flex;
  flex-direction: column;
  
  h3 {
    margin: 0 0 ${theme.spacing.xs} 0;
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.semiBold};
    color: ${theme.colors.text.primary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  p {
    margin: 0 0 ${theme.spacing.sm} 0;
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.md};
    line-height: 1.5;
    max-height: 3em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

const PromotionDetails = styled.div`
  margin-top: auto;
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.light};
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.xs};
`;

const PromotionDetail = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  
  svg {
    color: ${({ type }) => 
      type === "automatic" ? theme.colors.accent.main : theme.colors.primary.main};
    font-size: 16px;
    flex-shrink: 0;
  }
  
  strong {
    color: ${theme.colors.text.primary};
    font-weight: ${theme.typography.fontWeights.medium};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const EventPreview = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.light};
  height: 115px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease-in-out;
  position: relative;
  
  &:last-of-type {
    border-bottom: none;
  }
  
  &:not(:last-of-type) {
    margin-bottom: ${theme.spacing.md};
  }
  
  &:hover {
    background-color: ${theme.colors.background.hover};
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-decoration: none;
    color: inherit;
  }
  
  &:hover::after {
    content: '';
    position: absolute;
    right: ${theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233498db'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.7;
  }
`;

const EventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.md};
  margin-right: ${theme.spacing.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .month {
    font-size: ${theme.typography.fontSize.sm};
    text-transform: uppercase;
    color: ${theme.colors.primary.main};
    font-weight: ${theme.typography.fontWeights.semiBold};
    margin-bottom: -2px;
  }
  
  .day {
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeights.bold};
  }
`;

const EventInfo = styled.div`
  flex: 1;
  
  h3 {
    margin: 0 0 ${theme.spacing.sm} 0;
    font-size: ${theme.typography.fontSize.lg};
    font-weight: ${theme.typography.fontWeights.semiBold};
  }
  
  p {
    margin: 0;
    margin-bottom: ${theme.spacing.xs};
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.sm};
    display: flex;
    align-items: center;
  }
`;

const TransactionModalInput = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const RedemptionModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const RedemptionOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const RedemptionOption = styled.button`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.default};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.radius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.quick};
  
  span:first-of-type {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.primary.main};
  }
  
  span:last-of-type {
    font-size: ${theme.typography.fontSize.xs};
    color: ${theme.colors.text.secondary};
  }
  
  ${({ active }) =>
    active &&
    css`
      border-color: ${theme.colors.primary.main};
      background-color: rgba(52, 152, 219, 0.1);
    `}
  
  &:hover {
    border-color: ${theme.colors.primary.main};
  }
`;

// Add new points bar style component
const PointsProgressContainer = styled.div`
  margin-top: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const ProgressBar = styled.div`
  height: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.radius.full};
  overflow: visible;
  margin-bottom: ${theme.spacing.xs};
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: ${theme.radius.full};
  transition: width 0.5s ease;
`;

const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.xs};
  color: rgba(255, 255, 255, 0.8);
`;

const MilestoneMarkers = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  z-index: 2;
`;

const Milestone = styled.div`
  position: absolute;
  left: ${props => props.position}%;
  top: 0;
  transform: translateX(-50%);
  width: 3px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.9);
`;

const LevelInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${theme.spacing.md};
  position: relative;
  z-index: 1;
`;

const LevelBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: ${theme.radius.full};
  font-weight: ${theme.typography.fontWeights.semiBold};
  font-size: ${theme.typography.fontSize.sm};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NextLevelInfo = styled.div`
  text-align: right;
  font-size: ${theme.typography.fontSize.sm};
  opacity: 0.9;
`;

const LevelIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFD700;
  font-size: 20px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
`;

// Tier cards for showing the points tiers
const TierSection = styled.div`
  display: flex;
  overflow-x: auto;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} 0;
  margin-bottom: ${theme.spacing.sm};
  position: relative;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: ${theme.radius.full};
  }
`;

const TierCard = styled.div`
  min-width: 85px;
  flex: 1;
  padding: ${theme.spacing.xs} ${theme.spacing.xs};
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${theme.radius.md};
  text-align: center;
  border: 2px solid ${props => props.active ? 'rgba(255, 255, 255, 0.9)' : 'transparent'};
  
  .tier-name {
    font-weight: ${theme.typography.fontWeights.semiBold};
    margin-bottom: ${theme.spacing.xs};
    font-size: ${theme.typography.fontSize.xs};
  }
  
  .tier-points {
    font-size: ${theme.typography.fontSize.xs};
    opacity: 0.8;
  }
  
  .tier-icon {
    margin-bottom: ${theme.spacing.xs};
    font-size: 18px;
    ${props => props.active ? 'color: #FFD700;' : 'opacity: 0.7;'}
  }
`;

const CheckinStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  background-color: ${theme.colors.success.light};
  color: ${theme.colors.success.dark};
  margin-top: ${theme.spacing.xs};
  
  svg {
    font-size: 1.1em;
  }
`;

const formatDisplayDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    // Directly handle ISO format date strings
    // For dates in format "2023-12-15T00:00:00.000Z", need to ensure UTC timezone is used
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Invalid Date';
    }
    
    // Use UTC timezone to ensure correct date display
    // This method works correctly with UTC dates across different browsers and operating systems
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Key is to use UTC timezone
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date Error';
  }
};

const Dashboard = () => {
  const { activeRole } = useAuth();
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const { transactions, isLoading: isTransactionsLoading } = useUserTransactions({ limit: 3 });
  const { promotions, isLoading: isPromotionsLoading } = usePromotions({ started: true, ended: false, limit: 4 });
  const { events, isLoading: isEventsLoading } = useEvents({ started: false, ended: false, limit: 4 });
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [upcomingEventId, setUpcomingEventId] = useState(null);
  const { isCheckedIn } = useEventCheckin(upcomingEventId || '');
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <FaPlus />;
      case 'redemption':
        return <FaMinus />;
      case 'transfer':
        return <FaExchangeAlt />;
      case 'adjustment':
        return <FaExchangeAlt />;
      case 'event':
        return <FaCalendarAlt />;
      default:
        return <FaExchangeAlt />;
    }
  };
  
  const getTransactionLabel = (transaction) => {
    switch (transaction.type) {
      case 'purchase':
        return `Purchase - $${transaction.spent?.toFixed(2) || '0.00'}`;
      case 'redemption':
        if (transaction.processedBy) {
          return `Redemption - Completed`;
        }
        return `Redemption - Pending`;
      case 'transfer':
        if (transaction.amount > 0) {
          if (transaction.senderName && transaction.sender) {
            return `Transfer from ${transaction.senderName} (${transaction.sender})`;
          }
          return `Transfer from ${transaction.sender || transaction.senderName || 'user'}`;
        }
        if (transaction.recipientName && transaction.recipient) {
          return `Transfer to ${transaction.recipientName} (${transaction.recipient})`;
        }
        return `Transfer to ${transaction.recipient || transaction.recipientName || 'user'}`;
      case 'adjustment':
        return `Adjustment from ${transaction.createdBy || 'manager'}`;
      case 'event':
        return `Event Reward - ${transaction.relatedId || 'Event'}`;
      default:
        return 'Transaction';
    }
  };
  
  const isPositiveTransaction = (transaction) => {
    return transaction.amount > 0;
  };
  
  const formatAmount = (amount) => {
    return `${amount > 0 ? '+' : ''}${amount} pts`;
  };
  
  // Calculate level and progress based on current points
  const calculateLevel = (points) => {
    // Use current balance to determine level
    const actualPoints = points; // Use current points balance
    
    const levels = [
      { name: "Bronze", min: 0, max: 1000, icon: <FaMedal /> },
      { name: "Silver", min: 1000, max: 5000, icon: <FaStar /> },
      { name: "Gold", min: 5000, max: 10000, icon: <FaAward /> },
      { name: "Platinum", min: 10000, max: 20000, icon: <FaTrophy /> },
      { name: "Diamond", min: 20000, max: Infinity, icon: <FaCrown /> }
    ];
    
    for (let i = 0; i < levels.length; i++) {
      if (actualPoints < levels[i].max) {
        const current = levels[i];
        const nextLevel = i < levels.length - 1 ? levels[i + 1] : null;
        
        // Calculate progress percentage within current level
        const progress = nextLevel 
          ? Math.min(((actualPoints - current.min) / (nextLevel.min - current.min)) * 100, 100)
          : 100;
          
        const pointsToNext = nextLevel 
          ? nextLevel.min - actualPoints 
          : 0;
        
        // Log outputs for debugging
        console.log('Level calculation:', { 
          actualPoints,
          currentLevel: current.name,
          currentMin: current.min,
          nextLevelMin: nextLevel?.min,
          progressCalc: ((actualPoints - current.min) / (nextLevel?.min - current.min)) * 100,
          finalProgress: progress
        });
          
        return {
          current,
          nextLevel,
          progress, // Ensure it doesn't exceed 100%
          pointsToNext,
          allLevels: levels,
          totalEarnedPoints: actualPoints
        };
      }
    }
    
    // Default fallback
    return {
      current: levels[levels.length - 1],
      nextLevel: null,
      progress: 100,
      pointsToNext: 0,
      allLevels: levels,
      totalEarnedPoints: actualPoints
    };
  };
  
  // Add console log for debugging
  useEffect(() => {
    console.log('Dashboard - Events data:', events);
  }, [events]);
  
  // Since we're already filtering on the API with started: false, ended: false,
  // We don't need to filter again, but we'll keep these helper functions for reference
  const isUpcoming = (startTime) => {
    const now = new Date();
    const eventDate = new Date(startTime);
    return eventDate > now;
  };

  const isOngoing = (startTime, endTime) => {
    const now = new Date();
    const eventStartDate = new Date(startTime);
    const eventEndDate = endTime ? new Date(endTime) : null;
    
    return eventStartDate <= now && (!eventEndDate || eventEndDate >= now);
  };
  
  // Add this useEffect to find the closest event the user is attending
  useEffect(() => {
    if (events?.length > 0) {
      // Find the first upcoming event or ongoing event the user is attending
      const now = new Date();
      const closestEvent = events.find(event => {
        const endTime = new Date(event.endTime);
        return endTime > now && event.isAttending;
      });
      
      if (closestEvent) {
        setUpcomingEventId(closestEvent.id);
      }
    }
  }, [events]);
  
  if (isProfileLoading || isTransactionsLoading || isPromotionsLoading || isEventsLoading) {
    return <LoadingSpinner text="Loading dashboard information..." />;
  }
  
  // Add this to the JSX where you render upcoming events
  const renderEventCheckinStatus = (event) => {
    if (event.id === upcomingEventId && isCheckedIn) {
      return (
        <CheckinStatusBadge>
          <FaCheckCircle /> Checked In
        </CheckinStatusBadge>
      );
    }
    return null;
  };
  
  return (
    <div>
      <PageTitle>Welcome, {profile?.name || 'User'}!</PageTitle>
      
      <PointsOverview>
        <PointsTitle>Your Points Balance</PointsTitle>
        <PointsAmount>{profile?.points || 0}</PointsAmount>
        
        {/* Member tier information */}
        {(() => {
          const levelData = calculateLevel(profile?.points || 0);
          return (
            <>
              <LevelInfo>
                <LevelBadge>
                  <LevelIcon>{levelData.current.icon}</LevelIcon>
                  {levelData.current.name} Level
                </LevelBadge>
                {levelData.nextLevel && (
                  <NextLevelInfo>
                    {levelData.pointsToNext} points to {levelData.nextLevel.name}
                  </NextLevelInfo>
                )}
              </LevelInfo>
              
              <PointsProgressContainer>
                <ProgressBar>
                  <ProgressFill percentage={levelData.progress} />
                  <MilestoneMarkers>
                    {levelData.allLevels.map((level, i) => {
                      if (i === 0 || !levelData.nextLevel) return null;
                      const position = ((level.min - levelData.current.min) / 
                                      (levelData.nextLevel.min - levelData.current.min)) * 100;
                      if (position <= 100 && position > 0) {
                        return <Milestone key={i} position={position} />;
                      }
                      return null;
                    })}
                  </MilestoneMarkers>
                </ProgressBar>
                <ProgressLabels>
                  <span>{levelData.current.min} pts</span>
                  <span>{levelData.nextLevel ? levelData.nextLevel.min : levelData.current.max} pts</span>
                </ProgressLabels>
              </PointsProgressContainer>
              
              <TierSection>
                {levelData.allLevels.map((level, i) => (
                  <TierCard key={i} active={levelData.current.name === level.name}>
                    <div className="tier-icon">{level.icon}</div>
                    <div className="tier-name">{level.name}</div>
                    <div className="tier-points">{level.min}+ pts</div>
                  </TierCard>
                ))}
              </TierSection>
            </>
          );
        })()}
        
        <PointsActions>
          <Button className="redeem-button" onClick={() => setIsRedeemModalOpen(true)} size="small">
            <FaGift /> Redeem Points
          </Button>
          <Button 
            className="transfer-button" 
            onClick={() => setIsTransferModalOpen(true)} 
            size="small"
          >
            <FaExchangeAlt /> Transfer
          </Button>
        </PointsActions>
      </PointsOverview>
      
      <ShortcutsSection>
        {activeRole === 'regular' && (
          <>
            <ShortcutCard to="/user-transactions">
              <FaExchangeAlt />
              <span>My Transactions</span>
            </ShortcutCard>
            <ShortcutCard as="button" onClick={() => setIsTransferModalOpen(true)}>
              <FaExchangeAlt style={{ color: theme.colors.secondary.main }} />
              <span>Transfer Points</span>
            </ShortcutCard>
            <ShortcutCard to="/promotions">
              <FaTags />
              <span>Promotions</span>
            </ShortcutCard>
            <ShortcutCard to="/events">
              <FaCalendarAlt />
              <span>Events</span>
            </ShortcutCard>
          </>
        )}
        
        {/* Cashier specific shortcuts */}
        {activeRole === 'cashier' && (
          <>
            <ShortcutCard to="/users/create">
              <FaUser />
              <span>Create User</span>
            </ShortcutCard>
            <ShortcutCard to="/transactions/process">
              <FaGift />
              <span>Process Redemption</span>
            </ShortcutCard>
            <ShortcutCard to="/transactions/create">
              <FaQrcode />
              <span>Create Transaction</span>
            </ShortcutCard>
            <ShortcutCard to="/events">
              <FaCalendarAlt />
              <span>Events</span>
            </ShortcutCard>
          </>
        )}
        
        {/* Manager and higher role shortcuts */}
        {(activeRole === 'manager' || activeRole === 'superuser') && (
          <>
            <ShortcutCard to="/promotions">
              <FaTags />
              <span>Promotions</span>
            </ShortcutCard>
            <ShortcutCard to="/events">
              <FaCalendarAlt />
              <span>Events</span>
            </ShortcutCard>
            <ShortcutCard to="/transactions/create">
              <FaQrcode />
              <span>Create Transaction</span>
            </ShortcutCard>
            <ShortcutCard to="/users">
              <FaUser />
              <span>Users</span>
            </ShortcutCard>
          </>
        )}
      </ShortcutsSection>
      
      <DashboardContainer>
        <div>
          <SectionTitle>
            Recent Transactions
            <ViewAllLink to="/user-transactions">
              View All <FaChevronRight size={12} />
            </ViewAllLink>
          </SectionTitle>
          
          <Card>
            <Card.Body>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TransactionItem key={transaction.id}>
                    <TransactionIcon type={transaction.type}>
                      {getTransactionIcon(transaction.type)}
                    </TransactionIcon>
                    <TransactionInfo>
                      <div className="transaction-type">{getTransactionLabel(transaction)}</div>
                      {transaction.remark && (
                        <div className="transaction-date">
                          {transaction.remark}
                        </div>
                      )}
                      {transaction.createdAt && (
                        <div className="transaction-date">
                          {formatDate(transaction.createdAt)}
                        </div>
                      )}
                    </TransactionInfo>
                    <TransactionAmount positive={isPositiveTransaction(transaction)}>
                      {formatAmount(transaction.amount)}
                    </TransactionAmount>
                  </TransactionItem>
                ))
              ) : (
                <EmptyState>
                  <p>No transactions found</p>
                </EmptyState>
              )}
            </Card.Body>
          </Card>
          
          <SectionTitle style={{ marginTop: theme.spacing.xl }}>
            Active Promotions
            <ViewAllLink to="/promotions">
              View All <FaChevronRight size={12} />
            </ViewAllLink>
          </SectionTitle>
          
          {promotions && promotions.length > 0 ? (
            <>
              {/* Group promotions by type */}
              {['automatic', 'one-time'].map(type => {
                const typePromotions = promotions.filter(p => 
                  p.type === type
                );
                
                if (typePromotions.length === 0) return null;
                
                return (
                  <PromotionSection key={type}>
                    <PromotionTypeHeader type={type}>
                      {type === 'automatic' ? 'Automatic' : 'One-time'}
                      <FaChevronRight size={12} />
                    </PromotionTypeHeader>
                    
                    {typePromotions.map(promotion => (
                      <PromotionCard key={promotion.id}>
                        <PromotionContent>
                          <h3>{promotion.name}</h3>
                          <p>{promotion.description || 'Earn points with this special promotion!'}</p>
                          
                          <PromotionDetails>
                            {promotion.points && !promotion.pointRule && (
                              <PromotionDetail type={promotion.type}>
                                <FaCoins />
                                <span>Points: <strong>{promotion.points}</strong></span>
                              </PromotionDetail>
                            )}
                            
                            {promotion.rate && !promotion.multiplier && (
                              <PromotionDetail type={promotion.type}>
                                <FaPercentage />
                                <span>Rate: <strong>{promotion.rate}x</strong></span>
                              </PromotionDetail>
                            )}
                            
                            {promotion.minSpending && !promotion.minimumPurchase && (
                              <PromotionDetail type={promotion.type}>
                                <FaTags />
                                <span>Min: <strong>${parseFloat(promotion.minSpending).toFixed(2)}</strong></span>
                              </PromotionDetail>
                            )}
                            
                            {promotion.startDate && (
                              <PromotionDetail type={promotion.type}>
                                <FaCalendarDay />
                                <span>Start: <strong>{formatDisplayDate(promotion.startDate)}</strong></span>
                              </PromotionDetail>
                            )}
                          </PromotionDetails>
                        </PromotionContent>
                      </PromotionCard>
                    ))}
                  </PromotionSection>
                );
              })}
            </>
          ) : (
            <Card>
              <Card.Body>
                <EmptyState>
                  <FaTags size={24} style={{ opacity: 0.3, marginBottom: theme.spacing.md }} />
                  <p>No active promotions found</p>
                  <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                    Check back later for new promotions and offers!
                  </p>
                </EmptyState>
              </Card.Body>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <Card.Header>
              <Card.Title>Your Universal QR Code</Card.Title>
            </Card.Header>
            <Card.Body>
              <UniversalQRCode 
                size={180}
                level="H"
                description="Use this QR code for transfers, purchases, redemptions and event check-ins."
              />
            </Card.Body>
          </Card>
          
          <SectionTitle style={{ marginTop: theme.spacing.xl }}>
            Upcoming Events
            <ViewAllLink to="/events">
              View All <FaChevronRight size={12} />
            </ViewAllLink>
          </SectionTitle>
          
          <Card>
            <Card.Body className="events-card-body">
              {events && events.length > 0 ? (
                events.map((event) => {
                  const date = new Date(event.startTime);
                  const month = date.toLocaleString('default', { month: 'short' });
                  const day = date.getDate();
                  
                  // Format start and end time for display
                  const startTime = date.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const endTime = event.endTime ? new Date(event.endTime).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '';
                  
                  const isManagerOrAbove = ['manager', 'superuser'].includes(activeRole);
                  
                  return (
                    <EventPreview key={event.id} as={Link} to={`/events/${event.id}`}>
                      <EventDate>
                        <span className="month">{month}</span>
                        <span className="day">{day}</span>
                      </EventDate>
                      <EventInfo>
                        <h3>{event.name}</h3>
                        <p>
                          <FaMapMarkerAlt size={14} style={{ marginRight: theme.spacing.xs, color: theme.colors.text.secondary }} />
                          {event.location}
                        </p>
                        <p>
                          {isManagerOrAbove ? (
                            <>
                              <FaCoins size={14} style={{ marginRight: theme.spacing.xs, color: theme.colors.text.secondary }} />
                              {event.pointsRemain || event.points || 0} points available
                            </>
                          ) : (
                            <>
                              <FaClock size={14} style={{ marginRight: theme.spacing.xs, color: theme.colors.text.secondary }} />
                              {startTime} {endTime ? `- ${endTime}` : ''}
                            </>
                          )}
                        </p>
                      </EventInfo>
                      {renderEventCheckinStatus(event)}
                    </EventPreview>
                  );
                })
              ) : (
                <EmptyState>
                  <FaCalendarAlt size={24} style={{ opacity: 0.3, marginBottom: theme.spacing.md }} />
                  <p>No upcoming events found</p>
                  <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                    Check back later for new events!
                  </p>
                </EmptyState>
              )}
            </Card.Body>
          </Card>
        </div>
      </DashboardContainer>
      
      {/* Modals */}
      <RedemptionModal 
        isOpen={isRedeemModalOpen} 
        onClose={() => setIsRedeemModalOpen(false)} 
        availablePoints={profile?.points || 0}
      />
      
      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        availablePoints={profile?.points || 0}
      />
    </div>
  );
};

export default Dashboard; 