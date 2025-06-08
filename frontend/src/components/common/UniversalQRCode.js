/**
 * Universal QR Code Component
 * 
 * This component generates a single QR code that can be used for multiple purposes:
 * - User identification for transfers
 * - User identification for purchase transactions
 * - Redemption processing
 * - Event check-in
 * 
 * The QR code contains structured data that indicates its purpose and relevant information.
 */
import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styled from '@emotion/styled';
import theme from '../../styles/theme';
import Button from './Button';
import { BsDownload } from 'react-icons/bs';
import { useAuth } from '../../contexts/AuthContext';

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.md};
`;

const StyledQRCode = styled.div`
  padding: ${theme.spacing.md};
  background-color: white;
  border-radius: ${theme.radius.md};
  border: 1px solid ${theme.colors.border.light};
  
  canvas {
    display: block;
  }
`;

const QRCodeLabel = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const QRCodeDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  max-width: 250px;
  margin-top: ${theme.spacing.xs};
`;

const UniversalQRCode = ({ 
  size = 200, 
  level = 'H', 
  includeMargin = true,
  label = "",
  description,
  eventId = null,
  redemptionId = null
}) => {
  const qrRef = useRef();
  const { currentUser } = useAuth();
  
  // Construct the QR code data based on available information
  const generateQRData = () => {
    // 获取当前域名作为基础URL
    const baseUrl = window.location.origin;
    
    // 构建基础数据对象
    const baseData = {
      type: 'pointpulse',
      version: '1.0',
      utorid: currentUser?.utorid || ''
    };
    
    let scanUrl = "";

    // ---- 新的统一规范 ----
    // 1. 统一使用  ?data=<base64url>  作为承载结构化信息的查询参数
    // 2. data 内为 JSON.stringify(baseData) 的标准 Base64 编码，再通过 encodeURIComponent 进行 URL 安全转义
    // --------------------------------

    if (eventId) {
      baseData.context = 'event';
      baseData.eventId = eventId;
      const encodedData = encodeURIComponent(btoa(JSON.stringify(baseData)));
      scanUrl = `${baseUrl}/events/${eventId}/attend?data=${encodedData}`;
    } else if (redemptionId) {
      baseData.context = 'redemption';
      baseData.redemptionId = redemptionId;
      const encodedData = encodeURIComponent(btoa(JSON.stringify(baseData)));
      scanUrl = `${baseUrl}/transactions/process?data=${encodedData}`;
    } else {
      baseData.context = 'user';
      const encodedData = encodeURIComponent(btoa(JSON.stringify(baseData)));
      scanUrl = `${baseUrl}/transfer?data=${encodedData}`;
    }

    // 返回单一 URL（无需再附加裸 JSON），既可被系统解析，也方便手机浏览器直接访问
    return scanUrl;
  };
  
  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'pointpulse_qrcode.png';
    link.href = url;
    link.click();
  };
  
  return (
    <QRCodeContainer>
      {label && <QRCodeLabel>{label}</QRCodeLabel>}
      
      <StyledQRCode ref={qrRef}>
        <QRCodeCanvas
          value={generateQRData()}
          size={size}
          level={level}
          includeMargin={includeMargin}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </StyledQRCode>
      
      {description && <QRCodeDescription>{description}</QRCodeDescription>}
      
      <Button
        variant="outlined"
        size="small"
        onClick={downloadQRCode}
        fullWidth={false}
      >
        <BsDownload /> Download
      </Button>
    </QRCodeContainer>
  );
};

export default UniversalQRCode;