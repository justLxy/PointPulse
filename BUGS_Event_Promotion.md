Bugs and Potential Improvements for Events and Promotions
Bugs:
Event update screen exits unexpectedly
 When editing an event, if the user tries to copy content from an input field, the screen exits automatically. This is likely due to loss of focus or unintended form submission.


Organizer cannot add guests (even with correct role)
 When regular41 is promoted to an event organizer, they cannot add guests to the event as expected.
 Similarly, when cashier1 is added as an organizer, they are also unable to add guests.
 ➤ Expected behavior: All organizers should be able to add guests to their assigned events.


RSVP error for manager role
 When manager1 attempts to RSVP to an event, the server returns event not found, even though the event exists and is visible to others.


Attendance always shows 0
 The event card does not correctly display the number of attendees—it always shows 0 even after successful RSVPs.


Regular users see and access promotion creation
 The "Create Promotion" button is visible to regular users, who should not have permission. Attempting to create a promotion as a regular user crashes the site with no proper error message.
Potential Improvements:
Scrollable dropdown for organizer selection
 When adding organizers while editing an event, the user should be able to scroll through a dropdown list of users, especially if there are many options.


Disable update button if event has ended
 When an event is over, the "Update" button should be disabled (grayed out) to prevent unintended modifications.


Display "Ended" label on event cards
 Event cards should clearly show a label such as "Ended" if the event has already finished.


Disable point update when value is invalid
 While updating an event, if the allocated points are modified to a negative value, the submit/update button should be disabled to prevent invalid submission.


Point Allocation not yet implemented
 Managers and event organizers should be able to award points to guests who attended the event. This feature is currently missing.