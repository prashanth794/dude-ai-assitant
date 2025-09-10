import React from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 80%, 100% { 
    transform: scale(0); 
  } 
  40% { 
    transform: scale(1.0); 
  }
`;

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Dot = ({ delay }: { delay: string }) => (
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'text.secondary',
      animation: `${bounce} 1.4s infinite ease-in-out both`,
      animationDelay: delay,
    }}
  />
);

const LoadingIndicator: React.FC = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'flex-start',
      animation: `${slideInFromLeft} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
    }}>
      <Box
        sx={{
          p: '12px 14px',
          display: 'inline-flex',
          gap: '4px',
          bgcolor: 'background.paper',
          borderRadius: '20px 20px 20px 4px',
          boxShadow: 1,
        }}
      >
        <Dot delay="-0.32s" />
        <Dot delay="-0.16s" />
        <Dot delay="0s" />
      </Box>
    </Box>
  );
};

export default LoadingIndicator;