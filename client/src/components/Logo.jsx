// /client/src/components/Logo.jsx
// Scholar's Path Logo Component - Inline SVG for reliability

import React from 'react';
import { Box } from '@mui/material';

const Logo = ({ 
  height = 100, 
  width = 'auto',
  white = false, // Set to true for white version
  ...props 
}) => {
  return (
    <Box
      component="svg"
      width={width === 'auto' ? (height * 4) : width}
      height={height}
      viewBox="0 0 400 100"
      xmlns="http://www.w3.org/2000/svg"
      sx={{
        filter: white 
          ? 'brightness(0) invert(1) drop-shadow(0 8px 32px rgba(255, 255, 255, 0.3))'
          : 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.2))',
        ...props.sx,
      }}
      {...props}
    >
      <defs>
        <linearGradient id="iconGradA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="textGradA" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#1E40AF', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="capGradA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Icon Section */}
      <g transform="translate(50, 50)">
        {/* Circular background with subtle glow */}
        <circle cx="0" cy="0" r="38" fill="url(#iconGradA)" opacity="0.1"/>
        <circle cx="0" cy="0" r="36" fill="url(#iconGradA)" opacity="0.08"/>
        
        {/* Book with Path */}
        <g transform="translate(-15, -5)">
          {/* Open Book */}
          <path d="M 0 15 Q 7.5 10, 15 15 L 15 0 Q 7.5 -2, 0 0 Z" fill="url(#iconGradA)"/>
          <path d="M 15 15 Q 22.5 10, 30 15 L 30 0 Q 22.5 -2, 15 0 Z" fill="url(#iconGradA)" opacity="0.8"/>
          <line x1="15" y1="3" x2="15" y2="14" stroke="white" strokeWidth="0.5" opacity="0.4"/>
          {/* Page details */}
          <line x1="7.5" y1="5" x2="7.5" y2="12" stroke="white" strokeWidth="0.3" opacity="0.3"/>
          <line x1="22.5" y1="5" x2="22.5" y2="12" stroke="white" strokeWidth="0.3" opacity="0.3"/>
        </g>
        
        {/* Graduation Cap */}
        <g transform="translate(-10, -22)">
          <rect x="0" y="0" width="20" height="2" fill="url(#iconGradA)" rx="0.5"/>
          <path d="M 10 -5 L 16 -2.5 L 10 0 L 4 -2.5 Z" fill="url(#capGradA)"/>
          <line x1="10" y1="-5" x2="13" y2="-8" stroke="url(#capGradA)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="13" cy="-8" r="1.5" fill="url(#capGradA)"/>
        </g>
        
        {/* Rising Path with dots */}
        <g transform="translate(8, 10)">
          <path 
            d="M 0 0 Q 5 -10, 10 -18" 
            stroke="url(#iconGradA)" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
            opacity="0.5"
          />
          <circle cx="0" cy="0" r="2" fill="url(#iconGradA)" opacity="0.7"/>
          <circle cx="5" cy="-5" r="2" fill="url(#iconGradA)" opacity="0.7"/>
          <circle cx="8" cy="-12" r="1.5" fill="url(#iconGradA)" opacity="0.6"/>
        </g>
      </g>
      
      {/* Text Section */}
      <g transform="translate(110, 50)">
        {/* Main Text */}
        <text 
          x="0" 
          y="0" 
          fontFamily="'Inter', 'Segoe UI', 'Arial', sans-serif" 
          fontSize="34" 
          fontWeight="800" 
          fill="url(#textGradA)"
          letterSpacing="-1"
        >
          Scholar's Path
        </text>
        
        {/* Tagline */}
        <text 
          x="2" 
          y="20" 
          fontFamily="'Inter', 'Segoe UI', 'Arial', sans-serif" 
          fontSize="11" 
          fontWeight="600" 
          fill="#64748B"
          letterSpacing="1"
        >
          EMPOWERING EDUCATION
        </text>
      </g>
    </Box>
  );
};

export default Logo;
