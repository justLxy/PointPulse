import { useState, useEffect } from 'react';
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

  // First check URL for utorid parameter
  const rawUtoridQueryParam = searchParams.get('utorid') || '';
  
  // Initialize with the full raw string from URL or check sessionStorage for saved utorid
  let utoridForModal = rawUtoridQueryParam;
  
  // Check sessionStorage for pending transfer (for post-login redirect case)
  useEffect(() => {
    const pendingUtorid = sessionStorage.getItem('pendingTransferUtorid');
    
    // If we have a pending transfer in sessionStorage and no utorid in URL, use the stored one
    if (pendingUtorid && !rawUtoridQueryParam && isAuthenticated) {
      // Clear storage after use
      sessionStorage.removeItem('pendingTransferUtorid');
      
      // Navigate to the same page but with utorid parameter
      navigate(`/transfer?utorid=${encodeURIComponent(pendingUtorid)}`, { replace: true });
    }
  }, [isAuthenticated, rawUtoridQueryParam, navigate]);

  if (rawUtoridQueryParam) {
    const jsonStartIndex = rawUtoridQueryParam.indexOf('{');

    if (jsonStartIndex > 0) {
      // Case 1: String is like "actual_utorid{json_data}"
      // The part before '{' is likely the utorid we want for the modal.
      utoridForModal = rawUtoridQueryParam.substring(0, jsonStartIndex);
      const jsonPart = rawUtoridQueryParam.substring(jsonStartIndex);
      try {
        // Attempt to parse the JSON part for validation/logging, though its content isn't used to override utoridForModal here.
        JSON.parse(jsonPart); 
        console.log("TransferPage: Detected prefix and valid JSON structure. Prefilling with prefix:", utoridForModal);
      } catch (e) {
        console.warn("TransferPage: Detected prefix, but suffix is not valid JSON. Using prefix:", utoridForModal);
      }
    } else if (jsonStartIndex === 0) {
      // Case 2: String starts with '{', so it might be a pure JSON string.
      try {
        const jsonData = JSON.parse(rawUtoridQueryParam);
        if (jsonData && jsonData.type === 'pointpulse' && jsonData.utorid) {
          utoridForModal = jsonData.utorid; // Extracted utorid from the JSON
        }
        // If it's JSON but not our type, or no utorid, utoridForModal remains the raw JSON string (which is fine for the modal to potentially reject).
      } catch (e) {
        // Not JSON, utoridForModal remains the raw string (which starts with '{' but isn't JSON).
      }
    }
    // Case 3: No '{' found (jsonStartIndex === -1).
    // utoridForModal remains rawUtoridQueryParam, which is assumed to be a plain utorid.
  }
  
  const [modalOpen, setModalOpen] = useState(true);

  // If the user is not authenticated, redirect to login and come back after login.
  if (!isAuthenticated) {
    // Compose redirect target (encoded) so that Login can navigate back after auth.
    // Use the rawUtoridQueryParam for the redirect URL to preserve the full QR content in case of login.
    const currentPath = `/transfer${rawUtoridQueryParam ? `?utorid=${encodeURIComponent(rawUtoridQueryParam)}` : ''}`;
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