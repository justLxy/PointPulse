import styled from '@emotion/styled';
import { FaLink, FaExternalLinkAlt, FaCopy, FaEdit, FaTrash, FaCalendarAlt, FaUser, FaPlus } from 'react-icons/fa';
import theme from '../../styles/theme';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';
import ShortlinkService from '../../services/shortlink.service';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    gap: ${theme.spacing.sm};
  }
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  flex: 1;
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-shrink: 0;
  }
`;

const ShortlinkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ShortlinkCard = styled(Card)`
  transition: transform ${theme.transitions.default}, box-shadow ${theme.transitions.default};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.xl};
  }
`;

const ShortlinkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const ShortlinkInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ShortlinkSlug = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  word-break: break-word;
`;

const ShortlinkUrl = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary.main};
  margin-bottom: ${theme.spacing.sm};
  word-break: break-all;
  
  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
      color: ${theme.colors.primary.dark};
    }
  }
`;

const ShortlinkActions = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-shrink: 0;
`;

const TargetUrl = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
  word-break: break-all;
  
  a {
    color: ${theme.colors.text.secondary};
    text-decoration: none;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
      color: ${theme.colors.primary.main};
    }
  }
`;

const ShortlinkMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const ShortlinkFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.light};
`;

const CopyButton = styled(Button)`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xs};
  min-width: auto;
`;

const ActionButton = styled(Button)`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xs};
  min-width: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
  
  h3 {
    font-size: ${theme.typography.fontSize.lg};
    margin-bottom: ${theme.spacing.md};
    color: ${theme.colors.text.primary};
  }
  
  p {
    margin-bottom: ${theme.spacing.lg};
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;



/**
 * ShortlinkList component for displaying and managing shortlinks
 */
const ShortlinkList = ({
  shortlinks = [],
  isLoading = false,
  total = 0,
  page = 1,
  totalPages = 0,
  onPageChange,
  onEdit,
  onDelete,
  onCreate,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  title = 'Shortlinks',
}) => {
  const { currentUser } = useAuth();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const canEditShortlink = (shortlink) => {
    if (!canEdit) return false;
    // User can edit if they're the creator or have manager permissions
    return shortlink.createdBy?.id === currentUser?.id || ['manager', 'superuser'].includes(currentUser?.role);
  };

  const canDeleteShortlink = (shortlink) => {
    if (!canDelete) return false;
    // User can delete if they're the creator or have manager permissions
    return shortlink.createdBy?.id === currentUser?.id || ['manager', 'superuser'].includes(currentUser?.role);
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingState>
          <div>Loading shortlinks...</div>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        <Actions>
          {canCreate && (
            <Button onClick={onCreate}>
              <FaPlus size={14} />
              Create Shortlink
            </Button>
          )}
        </Actions>
      </Header>

      {shortlinks.length === 0 ? (
        <EmptyState>
          <h3>No shortlinks found</h3>
          <p>Create your first shortlink to get started.</p>
        </EmptyState>
      ) : (
        <>
          <ShortlinkGrid>
            {shortlinks.map((shortlink) => {
              const shortlinkUrl = ShortlinkService.getShortlinkUrl(shortlink.slug);
              
              return (
                <ShortlinkCard key={shortlink.id}>
                  <Card.Body>
                    <ShortlinkHeader>
                      <ShortlinkInfo>
                        <ShortlinkSlug>{shortlink.slug}</ShortlinkSlug>
                        <ShortlinkUrl>
                          <FaLink size={12} />
                          <a href={shortlinkUrl} target="_blank" rel="noopener noreferrer">
                            {shortlinkUrl}
                          </a>
                        </ShortlinkUrl>
                      </ShortlinkInfo>
                      <ShortlinkActions>
                        <CopyButton
                          variant="outlined"
                          size="small"
                          onClick={() => copyToClipboard(shortlinkUrl)}
                          title="Copy shortlink"
                        >
                          <FaCopy size={12} />
                        </CopyButton>
                        {canEditShortlink(shortlink) && (
                          <ActionButton
                            variant="outlined"
                            size="small"
                            onClick={() => onEdit(shortlink)}
                            title="Edit shortlink"
                          >
                            <FaEdit size={12} />
                          </ActionButton>
                        )}
                        {canDeleteShortlink(shortlink) && (
                          <ActionButton
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => onDelete(shortlink)}
                            title="Delete shortlink"
                          >
                            <FaTrash size={12} />
                          </ActionButton>
                        )}
                      </ShortlinkActions>
                    </ShortlinkHeader>

                    <TargetUrl>
                      <FaExternalLinkAlt size={12} />
                      <a href={shortlink.targetUrl} target="_blank" rel="noopener noreferrer">
                        {shortlink.targetUrl}
                      </a>
                    </TargetUrl>

                    <ShortlinkMeta>
                      <MetaItem>
                        <FaUser size={10} />
                        <span>By {shortlink.createdBy?.name || 'Unknown'}</span>
                      </MetaItem>
                      
                      {shortlink.event && (
                        <MetaItem>
                          <FaCalendarAlt size={10} />
                          <span>{shortlink.event.name}</span>
                        </MetaItem>
                      )}
                      
                      <MetaItem>
                        <span>Created {formatDate(shortlink.createdAt)}</span>
                      </MetaItem>
                    </ShortlinkMeta>

                    <ShortlinkFooter>
                      <div>
                        {shortlink.event && (
                          <Badge variant="info" size="small">
                            Event Link
                          </Badge>
                        )}
                      </div>
                      
                      <CopyButton
                        variant="primary"
                        size="small"
                        onClick={() => copyToClipboard(shortlinkUrl)}
                      >
                        <FaCopy size={12} />
                        Copy Link
                      </CopyButton>
                    </ShortlinkFooter>
                  </Card.Body>
                </ShortlinkCard>
              );
            })}
          </ShortlinkGrid>

          {totalPages > 1 && (
            <Pagination>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'primary' : 'outlined'}
                    size="small"
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default ShortlinkList; 