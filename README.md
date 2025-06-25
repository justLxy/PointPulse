# PointPulse Loyalty Program

## Overview

PointPulse is a user-friendly loyalty rewards platform that lets users earn, redeem, and transfer points through everyday activities like purchases, events, and promotions. Designed with both users and administrators in mind, it offers easy-to-navigate interfaces for different roles such as Regular Users, Cashiers, Managers, Event Organizers, and Superusers. The system ensures that everyone has the right level of access and functionality based on their role, much like popular programs such as Tim Hortons Rewards and PC Optimum.

## Features

- **Comprehensive Point System**: Users can earn, redeem, and transfer points. A tier-based status system rewards loyal users with benefits that last for the current and following year.
- **Universal QR Code System**: A single QR code per user for various actions:
    - **Event Check-in**: Seamless, scan-based attendance tracking with live feedback.
    - **Transactions**: Quick processing of purchases and redemptions.
    - **Point Transfers**: Easy peer-to-peer point sharing.
    - A floating scan button is available throughout the app for convenience.
- **Product Catalog**:
    - Browse products from the integrated Square catalog.
    - Filter by category, stock status, payment type (cash/points), and affordability.
    - View real-time stock levels for different item variations.
- **Event & Promotion Management**:
    - Create and manage events, including setting a budget of points to be awarded.
    - Users can RSVP and view event details. Organizers can manage guests and award points.
    - Create and manage promotions to enhance point earnings.
- **Role-Based Access Control**:
    - Tailored interfaces for Regular Users, Cashiers, Managers, Event Organizers, and Superusers.
    - Clear permissions for user management, transaction auditing, and system administration.
- **Robust Testing and CI/CD**:
    - An extensive suite of unit and integration tests for both frontend and backend.
    - Automated testing pipeline with GitHub Actions to ensure code quality on every push and pull request.

## Technology Stack

-   **Frontend**:
    -   **Framework**: React
    -   **State Management**: React Query (for server state) & React Context (for global UI state)
    -   **Routing**: React Router
    -   **Styling**: Emotion (CSS-in-JS), Framer Motion (for animations)
    -   **HTTP Client**: Axios
    -   **Build Tool**: Create React App (react-scripts)

-   **Backend**:
    -   **Framework**: Node.js, Express
    -   **Database ORM**: Prisma
    -   **Authentication**: JSON Web Tokens (JWT)
    -   **Real-time Communication**: Socket.IO
    -   **Schema Validation**: Zod

-   **Database**:
    -   **Production/Staging**: PostgreSQL
    -   **Development**: SQLite

-   **API Integrations**:
    -   **Payments & Products**: Square API

-   **Testing & Quality Assurance**:
    -   **Backend**: Jest (testing framework), Supertest (for API endpoint testing)
    -   **Frontend**: React Testing Library, Jest DOM
    -   **CI/CD**: GitHub Actions for automated testing and coverage analysis

-   **Deployment**:
    -   **Frontend**: Vercel
    -   **Backend**: Railway

## User Roles

- **Regular Users**: Can earn, redeem, and transfer points, view transactions, and attend events
- **Cashiers**: Process purchases and redemptions, register new users
- **Managers**: Verify users, manage transactions, create events and promotions
- **Event Organizers**: Manage specific events and award points to attendees
- **Superusers**: Have full access to all system features and can promote users to any role
