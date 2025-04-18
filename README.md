# PointPulse Loyalty Program

## Overview

PointPulse is a comprehensive, points-based loyalty rewards web application designed to engage users and provide robust management tools for administrators. Inspired by popular programs like Tim Hortons Rewards and PC Optimum, this platform enables users to earn, redeem, and transfer loyalty points through various interactions, including purchases, event participation, and promotions. The system features distinct interfaces tailored to different user roles, ensuring appropriate access control and functionality for Regular Users, Cashiers, Managers, Event Organizers, and Superusers.

## Key Features

*   **User Management:** Secure registration, activation, login, and profile management (including password updates and avatar uploads).
*   **Points System:** Users can earn points through purchases and events, redeem points for discounts, and transfer points to other users.
*   **Transaction Management:** Detailed logging of all transaction types (Purchase, Adjustment, Redemption, Transfer, Event Rewards). Transactions are immutable for auditability. Managers can review all transactions and flag suspicious activities.
*   **Role-Based Access Control:** Tailored dashboards and functionalities for Regular Users, Cashiers, Managers, Event Organizers, and Superusers, ensuring users only access relevant features.
*   **Events Module:** Managers can create events with allocated points. Organizers manage event details and award points to attendees. Users can RSVP to events.
*   **Promotions Engine:** Managers can set up time-based or one-time promotional offers to incentivize user spending and engagement.
*   **QR Code Integration:** Displays QR codes for user identification and processing redemption requests (scanning functionality not implemented).
*   **Responsive UI/UX:** A modern, visually appealing, and responsive user interface built with a focus on usability, accessibility, and a polished user experience across devices.

## Technology Stack

*   **Frontend:**
    *   **Framework:** React
    *   **State Management/Data Fetching:** TanStack React Query
    *   **HTTP Client:** Axios
    *   **Routing:** React Router
    *   **UI:** Built with a focus on modern UI principles, potentially leveraging a component library for consistency and responsiveness.
*   **Backend:**
    *   **Architecture:** RESTful API
    *   **Authentication:** JWT (JSON Web Tokens) for secure session management.

## Design Philosophy

The front-end prioritizes a clean, intuitive, and high-fidelity user experience. Key considerations include:

*   **Aesthetics:** Consistent styling, readable typography, and a well-structured layout.
*   **Functionality:** Robust core features, smooth navigation, and effective data presentation (including filtering, sorting, and pagination for lists).
*   **Error Handling:** Graceful handling of user input errors and API request failures.
*   **Responsiveness:** Fluid layouts adapting seamlessly to various screen sizes.
*   **Accessibility:** Adherence to WCAG guidelines for inclusive design.
