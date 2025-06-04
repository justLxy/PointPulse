import { useState, useEffect, useMemo, useRef } from 'react';
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
import { useTierStatus } from '../hooks/useTierStatus';
import { 
  TIER_CONFIG, 
  getNextTierInfo, 
  getPointsToNextTier,
  formatTierExpiryDate,
  getTierBenefits 
} from '../utils/tierUtils';
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
  FaHistory,
  FaGem
} from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

const PointsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const PointsMainContent = styled.div`
  flex: 1;
`;

const TierBadgeCompact = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${theme.radius.lg};
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  h3 {
    font-size: ${theme.typography.fontSize.md};
    font-weight: ${theme.typography.fontWeights.semiBold};
    color: white;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const TierIconCompact = styled.div`
  font-size: 20px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
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

// New tier-related styles for integrated display
const TierSection = styled.div`
  margin: ${theme.spacing.md} 0;
  padding: 0;
  position: relative;
  z-index: 1;
`;

const TierHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const TierInfo = styled.div`
  flex: 1;
`;

const TierBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
  
  h3 {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.semiBold};
    color: white;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const TierIcon = styled.div`
  font-size: 28px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const TierSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${theme.typography.fontSize.sm};
  margin: 0;
`;

const ExpiryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: rgba(255, 255, 255, 0.8);
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.xs};
  
  svg {
    font-size: 14px;
  }
`;

const ProgressSection = styled.div`
  margin-top: ${theme.spacing.md};
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
  color: white;
  font-size: ${theme.typography.fontSize.sm};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
  border-radius: 4px;
  position: relative;
  width: ${props => props.width || '0%'};
  transition: width 0.8s ease-in-out;
`;

const PointsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing.xs};
  color: rgba(255, 255, 255, 0.8);
  font-size: ${theme.typography.fontSize.xs};
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

const TierCardsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.md};
  gap: ${theme.spacing.sm};
  overflow-x: auto;
`;

const TierCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 80px;
  min-height: 90px;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.radius.md};
  color: white;
  text-align: center;
  border: 2px solid ${props => props.isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const TierCardIcon = styled.div`
  font-size: 20px;
  margin-bottom: ${theme.spacing.xs};
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
`;

const TierCardName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-bottom: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const TierCardPoints = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  opacity: 0.9;
  font-weight: ${theme.typography.fontWeights.medium};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
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
    return 'Error';
  }
};

// Add benefits modal styles after the existing styled components
const BenefitsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.xl};
`;

const BenefitsContent = styled.div`
  background: white;
  border-radius: 24px;
  padding: ${theme.spacing['2xl']};
  max-width: 500px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const BenefitsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeights.bold};
    margin: 0;
  }
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
  
  svg {
    color: ${props => props.color || theme.colors.primary.main};
    font-size: 20px;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  span {
    color: ${theme.colors.text.primary};
    line-height: 1.5;
  }
`;

const CloseButton = styled.button`
  margin-top: ${theme.spacing.xl};
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  
  &:hover {
    background: ${theme.colors.primary.dark};
  }
`;

// Time Simulator Styles
const TimeSimulator = styled.div`
  position: fixed;
  top: 80px;
  right: 80px;
  background: ${theme.colors.background.paper};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.radius.md};
  padding: ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
  z-index: 999;
  min-width: 260px;
  max-width: 300px;
`;

const TimeSimulatorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
  
  h4 {
    margin: 0;
    color: ${theme.colors.text.primary};
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeights.normal};
  }
`;

const TimeSimulatorToggle = styled.button`
  position: fixed;
  top: 80px;
  right: 80px;
  background: ${theme.colors.background.default};
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.radius.sm};
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 998;
  font-size: 14px;
`;

const DateInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.xs};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.radius.sm};
  font-size: ${theme.typography.fontSize.xs};
  margin-bottom: ${theme.spacing.sm};
  background: ${theme.colors.background.default};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.text.primary};
  }
`;

const SimulatorButton = styled.button`
  padding: 4px 8px;
  margin: 1px;
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.radius.sm};
  cursor: pointer;
  font-size: 10px;
  font-weight: ${theme.typography.fontWeights.normal};
  flex: 1;
  min-width: 0;
  background: ${theme.colors.background.default};
  color: ${theme.colors.text.secondary};
  
  ${({ variant }) => {
    if (variant === 'danger') {
      return `
        background: ${theme.colors.background.default};
        color: ${theme.colors.error.main};
        border-color: ${theme.colors.error.light};
      `;
    }
    return '';
  }}
`;

const PointsBreakdown = styled.div`
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  position: relative;
  z-index: 1;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Dashboard = () => {
  const { activeRole } = useAuth();
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  
  // Memoize the parameters to prevent repeated API calls
  const transactionParams = useMemo(() => ({ limit: 5 }), []);
  const { transactions, isLoading: isTransactionsLoading } = useUserTransactions(transactionParams);
  
  // Memoize events parameters to prevent repeated API calls
  const eventsParams = useMemo(() => ({ limit: 3, started: false, ended: false }), []);
  const { events, isLoading: isEventsLoading } = useEvents(eventsParams);
  
  const isManager = ['manager', 'superuser'].includes(activeRole);
  
  // Memoize promotion parameters to prevent repeated API calls
  const promotionParams = useMemo(() => ({ started: true, ended: false }), []); // Active promotions for all users on dashboard
    
  const { promotions, isLoading: isPromotionsLoading } = usePromotions(promotionParams);
  const { tierStatus, refreshTierStatus } = useTierStatus();
  
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showTierExplanation, setShowTierExplanation] = useState(false);
  
  // Time simulation for testing
  const [showTimeSimulator, setShowTimeSimulator] = useState(false);
  const [simulatedDate, setSimulatedDate] = useState(null);
  
  // Check if we're in development mode (you can change this condition)
  const isDevelopmentMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  
  // Track previous points to avoid unnecessary API calls
  const prevPointsRef = useRef(null);
  
  // Time simulation functions
  const getSimulatedDate = () => {
    const saved = localStorage.getItem('simulatedDate');
    return saved ? new Date(saved) : null;
  };
  
  const setSimulatedDateTime = (date) => {
    if (date) {
      localStorage.setItem('simulatedDate', date.toISOString());
      setSimulatedDate(date);
    } else {
      localStorage.removeItem('simulatedDate');
      setSimulatedDate(null);
    }
    // Force immediate refresh of tier status
    setTimeout(() => {
      if (refreshTierStatus) {
        refreshTierStatus();
      }
    }, 100);
  };
  
  // Load simulated date on component mount
  useEffect(() => {
    const savedDate = getSimulatedDate();
    if (savedDate) {
      setSimulatedDate(savedDate);
    }
  }, []);
  
  // Get current effective date (simulated or real)
  const getCurrentDate = () => {
    return simulatedDate || new Date();
  };
  
  // 监听积分变化，自动刷新等级状态 - only when points actually change
  useEffect(() => {
    const currentPoints = profile?.points;
    if (currentPoints !== undefined && currentPoints !== prevPointsRef.current && refreshTierStatus) {
      prevPointsRef.current = currentPoints;
      refreshTierStatus();
    }
  }, [profile?.points, refreshTierStatus]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
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
  
  // Tier helper functions
  const getTierIcon = (tier) => {
    switch (tier) {
      case 'DIAMOND': return <FaGem />;
      case 'PLATINUM': return <FaCrown />;
      case 'GOLD': return <FaTrophy />;
      case 'SILVER': return <FaStar />;
      default: return <FaMedal />;
    }
  };
  
  if (isProfileLoading || isTransactionsLoading || isPromotionsLoading || isEventsLoading) {
    return <LoadingSpinner text="Loading dashboard information..." />;
  }
  
  return (
    <div>
      <PageTitle>Welcome, {profile?.name || 'User'}!</PageTitle>
      
      <PointsOverview>
        <PointsHeader>
          <PointsMainContent>
            <PointsTitle>Your Points Balance</PointsTitle>
            <PointsAmount>{profile?.points || 0}</PointsAmount>
          </PointsMainContent>
          {tierStatus && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <TierBadgeCompact onClick={() => setShowBenefits(true)}>
                <TierIconCompact>{getTierIcon(tierStatus.activeTier)}</TierIconCompact>
                <h3>{TIER_CONFIG[tierStatus.activeTier].name} Member</h3>
              </TierBadgeCompact>
              <ExpiryInfo style={{ fontSize: '11px', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaInfoCircle 
                  style={{ cursor: 'pointer', opacity: 0.8 }} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTierExplanation(true);
                  }}
                />
                <span>Member benefits active until {formatTierExpiryDate(tierStatus.expiryDate)}</span>
                {tierStatus.tierSource === 'previous' && (
                  <span style={{ 
                    fontSize: '10px', 
                    opacity: 0.7,
                    fontStyle: 'italic',
                    marginLeft: '4px'
                  }}>
                    (carried over)
                  </span>
                )}
              </ExpiryInfo>
            </div>
          )}
        </PointsHeader>
        
        {/* Integrated Tier Status */}
        {tierStatus && (
          <TierSection>
            {(() => {
              const nextTier = getNextTierInfo(tierStatus.activeTier);
              const currentEarnedPoints = tierStatus.currentCycleEarnedPoints || 0; // 使用当前周期获得的积分
              const pointsToNext = getPointsToNextTier(currentEarnedPoints, tierStatus.activeTier);
              const tierConfig = TIER_CONFIG[tierStatus.activeTier];
              const progress = nextTier 
                ? ((currentEarnedPoints - tierConfig.threshold) / (nextTier.threshold - tierConfig.threshold)) * 100
                : 100;

              return nextTier ? (
                <ProgressSection>
                  <ProgressHeader>
                    <span>Progress to {nextTier.name}</span>
                    <span>{pointsToNext} points needed</span>
                  </ProgressHeader>
                  <ProgressBar>
                    <ProgressFill width={`${Math.min(progress, 100)}%`} />
                  </ProgressBar>
                  <PointsInfo>
                    <span>{currentEarnedPoints} points earned this cycle</span>
                    <span>{nextTier.threshold} points required</span>
                  </PointsInfo>
                </ProgressSection>
              ) : null;
            })()}
            
            {/* Integrated Tier Cards */}
            <TierCardsContainer>
              <TierCard isActive={tierStatus.activeTier === 'BRONZE'}>
                <TierCardIcon>{getTierIcon('BRONZE')}</TierCardIcon>
                <TierCardName>Bronze</TierCardName>
                <TierCardPoints>0+ pts</TierCardPoints>
              </TierCard>
              
              <TierCard isActive={tierStatus.activeTier === 'SILVER'}>
                <TierCardIcon>{getTierIcon('SILVER')}</TierCardIcon>
                <TierCardName>Silver</TierCardName>
                <TierCardPoints>1000+ pts</TierCardPoints>
              </TierCard>
              
              <TierCard isActive={tierStatus.activeTier === 'GOLD'}>
                <TierCardIcon>{getTierIcon('GOLD')}</TierCardIcon>
                <TierCardName>Gold</TierCardName>
                <TierCardPoints>5000+ pts</TierCardPoints>
              </TierCard>
              
              <TierCard isActive={tierStatus.activeTier === 'PLATINUM'}>
                <TierCardIcon>{getTierIcon('PLATINUM')}</TierCardIcon>
                <TierCardName>Platinum</TierCardName>
                <TierCardPoints>10000+ pts</TierCardPoints>
              </TierCard>
              
              <TierCard isActive={tierStatus.activeTier === 'DIAMOND'}>
                <TierCardIcon>{getTierIcon('DIAMOND')}</TierCardIcon>
                <TierCardName>Diamond</TierCardName>
                <TierCardPoints>20000+ pts</TierCardPoints>
              </TierCard>
            </TierCardsContainer>
          </TierSection>
        )}
        
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

      {/* Benefits Modal */}
      {showBenefits && tierStatus && (
        <BenefitsModal onClick={() => setShowBenefits(false)}>
          <BenefitsContent onClick={(e) => e.stopPropagation()}>
            <BenefitsHeader>
              {getTierIcon(tierStatus.activeTier)}
              <h3>{TIER_CONFIG[tierStatus.activeTier].name} Benefits</h3>
            </BenefitsHeader>
            
            <BenefitsList>
              {getTierBenefits(tierStatus.activeTier).map((benefit, index) => (
                <BenefitItem
                  key={index}
                  color={TIER_CONFIG[tierStatus.activeTier].color}
                >
                  <FaStar />
                  <span>{benefit}</span>
                </BenefitItem>
              ))}
            </BenefitsList>
            
            <CloseButton onClick={() => setShowBenefits(false)}>
              Close
            </CloseButton>
          </BenefitsContent>
        </BenefitsModal>
      )}

      {/* Tier Explanation Modal */}
      {showTierExplanation && (
        <BenefitsModal onClick={() => setShowTierExplanation(false)}>
          <BenefitsContent onClick={(e) => e.stopPropagation()}>
            <BenefitsHeader>
              <FaInfoCircle />
              <h3>How Tier Status Works</h3>
            </BenefitsHeader>
            
            <div style={{ marginBottom: theme.spacing.lg }}>
              <h4 style={{ 
                fontSize: theme.typography.fontSize.lg, 
                fontWeight: theme.typography.fontWeights.semiBold,
                marginBottom: theme.spacing.md,
                color: theme.colors.text.primary
              }}>
                Tier Cycle System
              </h4>
              
              <BenefitsList>
                <BenefitItem>
                  <FaCalendarAlt />
                  <span>Each tier cycle runs from <strong>September 1st to August 31st</strong> of the following year</span>
                </BenefitItem>
                
                <BenefitItem>
                  <FaCoins />
                  <span>Points earned during a cycle determine your tier status for that cycle and the next year</span>
                </BenefitItem>
                
                <BenefitItem>
                  <FaClock />
                  <span>Once you qualify for a tier, you keep it for the <strong>remainder of the current cycle plus the entire next cycle</strong></span>
                </BenefitItem>
                
                <BenefitItem>
                  <FaTrophy />
                  <span>Maximum tier duration is almost 2 years (depending on when you earned it)</span>
                </BenefitItem>
              </BenefitsList>
            </div>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <h4 style={{ 
                fontSize: theme.typography.fontSize.lg, 
                fontWeight: theme.typography.fontWeights.semiBold,
                marginBottom: theme.spacing.md,
                color: theme.colors.text.primary
              }}>
                Example Scenarios
              </h4>
              
              <div style={{ 
                background: theme.colors.background.default, 
                padding: theme.spacing.md, 
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing.md
              }}>
                <p style={{ fontWeight: theme.typography.fontWeights.semiBold, marginBottom: theme.spacing.xs }}>
                  Use Case A:
                </p>
                <p style={{ fontSize: theme.typography.fontSize.sm, lineHeight: 1.5, margin: 0 }}>
                  2025: User reaches Diamond in May → keeps Diamond for the rest of 2025 + all of 2026.<br/>
                  2026: Only earns enough points for Gold, which is two levels below Diamond.<br/>
                  → In 2027, user is downgraded two levels, from Diamond to Gold.
                </p>
              </div>
              
              <div style={{ 
                background: theme.colors.background.default, 
                padding: theme.spacing.md, 
                borderRadius: theme.radius.md
              }}>
                <p style={{ fontWeight: theme.typography.fontWeights.semiBold, marginBottom: theme.spacing.xs }}>
                  Use Case B:
                </p>
                <p style={{ fontSize: theme.typography.fontSize.sm, lineHeight: 1.5, margin: 0 }}>
                  2025: No tier reached.<br/>
                  2026: Reaches Diamond in December → keeps Diamond through 2027.<br/>
                  2027: Only qualifies for Silver based on points.<br/>
                  → In 2028, user is downgraded from Diamond to Silver.
                </p>
              </div>
            </div>
            
            <CloseButton onClick={() => setShowTierExplanation(false)}>
              Got it!
            </CloseButton>
          </BenefitsContent>
        </BenefitsModal>
      )}
      
      {/* Time Simulator (Development Only) */}
      {isDevelopmentMode && (
        <>
          {!showTimeSimulator ? (
            <TimeSimulatorToggle onClick={() => setShowTimeSimulator(true)}>
              <FaClock />
            </TimeSimulatorToggle>
          ) : (
            <TimeSimulator>
              <TimeSimulatorHeader>
                <h4>Time Simulator</h4>
                <button 
                  onClick={() => setShowTimeSimulator(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '18px', 
                    cursor: 'pointer',
                    color: theme.colors.text.secondary
                  }}
                >
                  ✕
                </button>
              </TimeSimulatorHeader>
              
              <div style={{ marginBottom: theme.spacing.md }}>
                <div style={{ marginBottom: theme.spacing.sm }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: theme.spacing.xs,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeights.normal,
                    color: theme.colors.text.secondary
                  }}>
                    Current: {getCurrentDate().toLocaleDateString()}
                  </label>
                  {simulatedDate && (
                    <div style={{ 
                      padding: theme.spacing.xs,
                      background: theme.colors.primary.light,
                      color: theme.colors.primary.dark,
                      borderRadius: theme.radius.sm,
                      fontSize: theme.typography.fontSize.xs,
                      marginBottom: theme.spacing.xs
                    }}>
                      🕐 Simulation active
                    </div>
                  )}
                </div>
              </div>
              
              <DateInput
                type="date"
                value={simulatedDate ? simulatedDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setSimulatedDateTime(new Date(e.target.value + 'T12:00:00'));
                  }
                }}
                placeholder="Select simulation date"
              />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                <SimulatorButton 
                  onClick={() => {
                    const aug31_2025 = new Date('2025-08-31T12:00:00');
                    setSimulatedDateTime(aug31_2025);
                  }}
                >
                  Aug 31, 2025
                </SimulatorButton>
                
                <SimulatorButton 
                  onClick={() => {
                    const sept1_2025 = new Date('2025-09-01T12:00:00');
                    setSimulatedDateTime(sept1_2025);
                  }}
                >
                  Sept 1, 2025
                </SimulatorButton>
                
                <SimulatorButton 
                  onClick={() => {
                    const aug31_2026 = new Date('2026-08-31T12:00:00');
                    setSimulatedDateTime(aug31_2026);
                  }}
                >
                  Aug 31, 2026
                </SimulatorButton>
                
                <SimulatorButton 
                  onClick={() => {
                    const sept1_2026 = new Date('2026-09-01T12:00:00');
                    setSimulatedDateTime(sept1_2026);
                  }}
                >
                  Sept 1, 2026
                </SimulatorButton>
                
                <SimulatorButton 
                  variant="danger"
                  onClick={() => setSimulatedDateTime(null)}
                >
                  Reset
                </SimulatorButton>
              </div>
              
              <div style={{ 
                marginTop: theme.spacing.md,
                padding: theme.spacing.sm,
                background: theme.colors.background.default,
                borderRadius: theme.radius.sm,
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary
              }}>
                {tierStatus && (
                  <div style={{ marginTop: theme.spacing.sm, fontSize: '11px' }}>
                    <strong>Debug Info:</strong><br/>
                    Current Date: {getCurrentDate().toLocaleDateString()}<br/>
                    Current Cycle: {tierStatus.currentCycleYear}-{tierStatus.currentCycleYear + 1}<br/>
                    Current Points: {tierStatus.currentCycleEarnedPoints || 0}<br/>
                    {tierStatus.previousCycleEarnedPoints !== undefined && (
                      <>
                        Previous Cycle: {tierStatus.previousCycleYear}-{tierStatus.previousCycleYear + 1}<br/>
                        Previous Points: {tierStatus.previousCycleEarnedPoints}<br/>
                      </>
                    )}
                    Active Tier: {tierStatus.activeTier} ({tierStatus.tierSource})<br/>
                    Expires: {tierStatus.expiryDate ? new Date(tierStatus.expiryDate).toLocaleDateString() : 'N/A'}
                  </div>
                )}
              </div>
            </TimeSimulator>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard; 