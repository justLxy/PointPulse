import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { hasRouteConflict } from '../constants/routes';
import styled from '@emotion/styled';
import LoadingSpinner from '../components/common/LoadingSpinner';
import theme from '../styles/theme';
import NotFound from './NotFound';
import api, { API_URL } from '../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const Message = styled.div`
  margin-top: ${theme.spacing.lg};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
`;

const ErrorMessage = styled.div`
  margin-top: ${theme.spacing.lg};
  color: ${theme.colors.error.main};
  font-size: ${theme.typography.fontSize.lg};
`;

const ShortlinkRedirect = () => {
  const { slug } = useParams();
  const [isValidating, setIsValidating] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!slug) {
        setNotFound(true);
        return;
      }

      // Validate slug format (alphanumeric + hyphen/underscore)
      const isValidSlugFormat = /^[a-zA-Z0-9_-]+$/.test(slug);
      if (!isValidSlugFormat || hasRouteConflict(slug)) {
        setNotFound(true);
        return;
      }

      try {
        // Check existence via new endpoint (no auth required)
        const { data } = await api.get(`/shortlinks/exists/${slug}`);
        if (data.exists) {
          // Do the actual redirect via backend so it logs analytics / etc.
          const redirectUrl = `${API_URL}/shortlinks/redirect/${slug}`;
          window.location.replace(redirectUrl);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setIsValidating(false);
      }
    };

    checkAndRedirect();
  }, [slug]);

  if (notFound) {
    return <NotFound />;
  }

  if (!slug) {
    return <NotFound />;
  }

  return (
    <Container>
      <LoadingSpinner />
      <Message>
        Redirecting to destination...
      </Message>
    </Container>
  );
};

export default ShortlinkRedirect; 