import React from 'react';
import { Box } from '@mui/material';

const Logo = ({ 
  height = 40,
  width = 'auto',
  variant = 'full',
  ...props 
}) => {
  const src = variant === 'icon' ? '/lernex2.png' : '/lernex1.png';
  const alt = variant === 'icon' ? 'Lernex icon' : 'Lernex logo';

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      width={width === 'auto' ? undefined : width}
      height={height}
      sx={{
        display: 'block',
        width,
        maxWidth: '100%',
        objectFit: 'contain',
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default Logo;