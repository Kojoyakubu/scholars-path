// /client/src/components/Logo.jsx
// Scholar's Path Logo Component - Inline SVG for reliability

import React from 'react';
import { Box } from '@mui/material';

const Logo = ({ 
  height = 120, 
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
        display: 'block',
        ...props.sx,
      }}
      {...props}
    >
      {/* Icon Section */}
      <g transform="translate(50, 50)">
        {/* Circular background with subtle glow */}
        <circle cx="0" cy="0" r="38" fill="#6F889D" opacity="0.1"/>
        <circle cx="0" cy="0" r="36" fill="#6F889D" opacity="0.08"/>
        
        {/* Book with Path */}
        <g transform="translate(-15, -5)">
          {/* Open Book */}
          <path d="M 0 15 Q 7.5 10, 15 15 L 15 0 Q 7.5 -2, 0 0 Z" fill="#6F889D"/>
          <path d="M 15 15 Q 22.5 10, 30 15 L 30 0 Q 22.5 -2, 15 0 Z" fill="#6F889D" opacity="0.8"/>
          <line x1="15" y1="3" x2="15" y2="14" stroke="white" strokeWidth="0.5" opacity="0.4"/>
          {/* Page details */}
          <line x1="7.5" y1="5" x2="7.5" y2="12" stroke="white" strokeWidth="0.3" opacity="0.3"/>
          <line x1="22.5" y1="5" x2="22.5" y2="12" stroke="white" strokeWidth="0.3" opacity="0.3"/>
        </g>
        
        {/* Graduation Cap */}
        <g transform="translate(-10, -22)">
          <rect x="0" y="0" width="20" height="2" fill="#6F889D" rx="0.5"/>
          <path d="M 10 -5 L 16 -2.5 L 10 0 L 4 -2.5 Z" fill="#B78552"/>
          <line x1="10" y1="-5" x2="13" y2="-8" stroke="#B78552" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="13" cy="-8" r="1.5" fill="#B78552"/>
        </g>
        
        {/* Rising Path with dots */}
        <g transform="translate(8, 10)">
          <path 
            d="M 0 0 Q 5 -10, 10 -18" 
            stroke="#6F889D"
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
            opacity="0.5"
          />
          <circle cx="0" cy="0" r="2" fill="#6F889D" opacity="0.7"/>
          <circle cx="5" cy="-5" r="2" fill="#6F889D" opacity="0.7"/>
          <circle cx="8" cy="-12" r="1.5" fill="#6F889D" opacity="0.6"/>
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
          fill="#1E40AF"
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
          fill={white ? "#FFFFFF" : "#9AA6B2"}
          letterSpacing="1"
          opacity={white ? "0.9" : "1"}
        >
          EMPOWERING EDUCATION
        </text>
      </g>
    </Box>
  );
};

export default Logo;