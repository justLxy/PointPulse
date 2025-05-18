import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import styled from '@emotion/styled';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import GlobalStyles from './styles/GlobalStyles';
import Layout from './components/layout/Layout';
import theme from './styles/theme';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useState, useEffect } from 'react';

// Import authentication pages
import Login from './pages/auth/Login';
import PasswordReset from './pages/auth/PasswordReset';
import AccountActivation from './pages/auth/AccountActivation';

// Import user pages
import Profile from './pages/users/Profile';
import Dashboard from './pages/Dashboard';
import Users from './pages/users/Users';
import CreateUser from './pages/users/CreateUser';
import UserTransactions from './pages/users/UserTransactions';
import UserDetail from './pages/users/UserDetail.jsx';

// Import transaction pages
import CreateTransaction from './pages/transactions/CreateTransaction';
import ProcessRedemption from './pages/transactions/ProcessRedemption';
import Transactions from './pages/transactions/Transactions';
import CreateAdjustment from './pages/transactions/CreateAdjustment';

// Import other pages
import Promotions from './pages/promotions/Promotions';
import Events from './pages/events/Events';
import EventDetail from './pages/events/EventDetail';
import EventCheckinDisplay from './pages/events/EventCheckinDisplay';
import EventCheckinAttend from './pages/events/EventCheckinAttend';

// New pages for universal scanning and transfer
import TransferPage from './pages/TransferPage';

// Create a QueryClientProvider with logout reset capability
const AppQueryClientProvider = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const { isAuthenticated } = useAuth();

  // Reset query cache on logout
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Styled components for loading screen
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${theme.colors.background.default};
`;

const ProtectedRoute = ({ children, allowedRoles = ['regular', 'cashier', 'manager', 'superuser'] }) => {
  const { isAuthenticated, activeRole, loading } = useAuth();
  const location = useLocation();
  
  // If we're still loading auth status, display a loading spinner
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner text="Loading..." />
      </LoadingContainer>
    );
  }
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!allowedRoles.includes(activeRole)) {
    console.log('Role not allowed:', activeRole, 'allowed:', allowedRoles);
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppQueryClientProvider>
          <GlobalStyles />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '8px',
                background: '#fff',
                padding: '16px',
                color: '#333',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/account-activation" element={<AccountActivation />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-transactions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserTransactions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/promotions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Promotions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Events />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EventDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:eventId/checkin-display"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EventCheckinDisplay />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:eventId/attend"
              element={
                <Layout>
                  <EventCheckinAttend />
                </Layout>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['manager', 'superuser']}>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions/create"
              element={
                <ProtectedRoute allowedRoles={['cashier', 'manager', 'superuser']}>
                  <Layout>
                    <CreateTransaction />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions/process"
              element={
                <ProtectedRoute allowedRoles={['cashier', 'manager', 'superuser']}>
                  <Layout>
                    <ProcessRedemption />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions/adjustment"
              element={
                <ProtectedRoute allowedRoles={['manager', 'superuser']}>
                  <Layout>
                    <CreateAdjustment />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute allowedRoles={['manager', 'superuser']}>
                  <Layout>
                    <Transactions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/create"
              element={
                <ProtectedRoute allowedRoles={['cashier', 'manager', 'superuser']}>
                  <Layout>
                    <CreateUser />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/users/:id" element={<UserDetail />} />

            {/* Transfer page (protected) */}
            <Route
              path="/transfer"
              element={
                <ProtectedRoute>
                  <TransferPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppQueryClientProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
