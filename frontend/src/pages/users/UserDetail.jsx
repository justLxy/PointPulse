import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import QRCode from '../../components/common/QRCode';
import theme from '../../styles/theme';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; 
import { FaExclamationTriangle } from 'react-icons/fa';
import { API_URL } from '../../services/api';

const PageWrapper = styled(motion.div)`
  padding: ${theme.spacing.xl};
  max-width: 900px;
  margin: 0 auto;
`;

const PageTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${theme.radius.full};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${theme.spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const InfoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${theme.typography.fontSize.md};
`;

const Label = styled.span`
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.primary};
`;

const Value = styled.div`
  color: ${theme.colors.text.secondary};
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: normal;
`;

const Badge = styled.span`
  display: inline-block;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.xs};
  background-color: ${({ verified }) =>
    verified ? theme.colors.success.main : theme.colors.warning.main};
  color: white;
  font-weight: ${theme.typography.fontWeights.medium};
  margin-left: ${theme.spacing.sm};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border.light};
  margin: ${theme.spacing.xl} 0;
`;

const Centered = styled.div`
  text-align: center;
`;

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeRole, currentUser } = useAuth();
  const { getUser } = useUsers();
  const { data: user, isLoading, error } = getUser(id);

  const [showContent, setShowContent] = useState(true);

  // Permission control: Only self or other superuser can view a superuser
  useEffect(() => {
    if (
      user &&
      user.role === 'superuser' &&
      activeRole !== 'superuser' &&
      user.id !== currentUser?.id
    ) {
      toast.error('Cannot access superuser');
      setShowContent(false);
      navigate('/events');
    }
  }, [user, activeRole, currentUser, navigate]);

  if (!['manager', 'superuser'].includes(activeRole)) {
    return (
      <PageWrapper>
        <Card>
          <Card.Body style={{ textAlign: 'center', padding: theme.spacing.xl }}>
            <FaExclamationTriangle size={40} color={theme.colors.warning.main} style={{ marginBottom: theme.spacing.md }} />
            <h2 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
              Access Denied
            </h2>
            <p style={{ color: theme.colors.text.secondary }}>
              You do not have permission to view this page.
            </p>
          </Card.Body>
        </Card>
      </PageWrapper>
    );
  }

  if (isLoading) return <LoadingSpinner text="Loading user..." />;

  if (error || (!user && !isLoading)) {
    return (
      <PageWrapper>
        <Card>
          <Card.Body style={{ textAlign: 'center', padding: theme.spacing.xl }}>
            <FaExclamationTriangle size={40} color={theme.colors.warning.main} style={{ marginBottom: theme.spacing.md }} />
            <h2 style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.sm }}>
              Oops! Something went wrong
            </h2>
            <p style={{ color: theme.colors.text.secondary }}>
              Failed to load user details.
            </p>
          </Card.Body>
        </Card>
      </PageWrapper>
    );
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <AnimatePresence>
      {showContent && (
        <PageWrapper
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <PageTitleRow>
            <PageTitle>User Details</PageTitle>
            <Link to="/events">
              <Button variant="outlined">← Back to Events</Button>
            </Link>
          </PageTitleRow>

          <Card>
            <Card.Body>
              <CardContent>
                <Avatar>
                  {user.avatarUrl ? (
                    (() => {
                      const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(user.avatarUrl);
                      // Fix for double slashes by ensuring avatarUrl doesn't have a leading slash when concatenated
                      const avatarPath = user.avatarUrl.startsWith('/') ? user.avatarUrl : `/${user.avatarUrl}`;
                      const baseSrc = isAbsolute ? user.avatarUrl : `${API_URL}${avatarPath}`;
                      return <img src={baseSrc} alt={user.name} />;
                    })()
                  ) : (
                    getInitials(user.name)
                  )}
                </Avatar>

                <InfoSection>
                  <InfoItem>
                    <Label>Name:</Label>
                    <Value>{user.name}</Value>
                  </InfoItem>

                  <InfoItem>
                    <Label>Email:</Label>
                    <Value>{user.email}</Value>
                  </InfoItem>

                  <InfoItem>
                    <Label>UTORid:</Label>
                    <Value>{user.utorid}</Value>
                  </InfoItem>

                  <InfoItem>
                    <Label>Role:</Label>
                    <Value>{user.role}</Value>
                  </InfoItem>

                  <InfoItem>
                    <Label>Status:</Label>
                    <Value>
                      {user.verified ? 'Verified' : 'Not Verified'}
                      <Badge verified={user.verified}>
                        {user.verified ? '✔' : 'Pending'}
                      </Badge>
                    </Value>
                  </InfoItem>

                  <InfoItem>
                    <Label>Birthday:</Label>
                    <Value>
                      {user.birthday
                        ? new Date(user.birthday).toLocaleDateString()
                        : 'Not set'}
                    </Value>
                  </InfoItem>

                  <InfoItem>
                    <Label>Points:</Label>
                    <Value>{user.points}</Value>
                  </InfoItem>
                </InfoSection>
              </CardContent>
            </Card.Body>
          </Card>

          <Divider />

          <Card>
            <Card.Header>
              <Card.Title>User QR Code</Card.Title>
            </Card.Header>
            <Card.Body>
              <Centered>
                <QRCode value={user.utorid || ''} size={200} level="H" />
              </Centered>
            </Card.Body>
          </Card>
        </PageWrapper>
      )}
    </AnimatePresence>
  );
};

export default UserDetail;
