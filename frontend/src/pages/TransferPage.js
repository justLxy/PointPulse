import { useState } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import TransferModal from '../components/user/TransferModal';

/**
 * TransferPage
 *
 * This page is responsible for initiating a points transfer. It is generally reached via
 *   /transfer?utorid=<recipientUtorid>
 * The component checks authentication – if the user is not logged-in, they will be redirected
 * to /login with a redirect back to this page after successful authentication.
 */
const TransferPage = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const dataParam = searchParams.get('data') || '';

  let utoridForModal = '';

  if (dataParam) {
    try {
      const decodedJson = JSON.parse(atob(decodeURIComponent(dataParam)));
      if (decodedJson && decodedJson.utorid) {
        utoridForModal = decodedJson.utorid;
      }
    } catch (e) {
      console.warn('TransferPage: failed to decode data param', e);
    }
  }

  // If data param missing or decode failed, redirect home
  if (!dataParam || !utoridForModal) {
    return <Navigate to="/" replace />;
  }

  const [modalOpen, setModalOpen] = useState(true);

  // If the user is not authenticated, redirect to login and come back after login.
  if (!isAuthenticated) {
    const currentPath = `/transfer?data=${encodeURIComponent(dataParam)}`;
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(currentPath)}`} replace />;
  }

  const handleClose = () => {
    setModalOpen(false);
    // After closing, navigate back to dashboard.
    navigate('/');
  };

  return (
    <Layout>
      <TransferModal
        isOpen={modalOpen}
        onClose={handleClose}
        prefillUtorid={utoridForModal}
        availablePoints={currentUser?.points || 0}
      />
    </Layout>
  );
};

export default TransferPage; 