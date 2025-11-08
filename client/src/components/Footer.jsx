// /client/src/components/Footer.jsx
// 🎨 Modernized Footer - Following Design Blueprint
// Features: Multi-column layout, newsletter section, improved links, modern styling

import { Box, Container, Typography, Link, Grid, Stack, Divider, useTheme, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  // Footer navigation sections
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', to: '/#features' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'For Teachers', to: '/#teachers' },
        { label: 'For Students', to: '/#students' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', to: '/about' },
        { label: 'Contact', to: '/contact' },
        { label: 'Careers', to: '/careers' },
        { label: 'Blog', to: '/blog' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', to: '/docs' },
        { label: 'Help Center', to: '/help' },
        { label: 'API', to: '/api' },
        { label: 'Status', to: '/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Cookie Policy', to: '/cookies' },
        { label: 'Accessibility', to: '/accessibility' },
      ],
    },
  ];

  const socialLinks = [
    { icon: TwitterIcon, url: 'https://twitter.com', label: 'Twitter' },
    { icon: LinkedInIcon, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: GitHubIcon, url: 'https://github.com', label: 'GitHub' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.primary.dark,
        color: 'white',
        pt: 8,
        pb: 4,
        mt: 'auto', // Pushes footer to bottom
      }}
    >
      <Container maxWidth="xl">
        {/* Main Footer Content */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha('#FFFFFF', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Scholar's Path
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: alpha('#FFFFFF', 0.8),
                  lineHeight: 1.7,
                  mb: 3 
                }}
              >
                Empowering students and teachers with AI-powered, personalized learning 
                paths and dynamic lesson creation.
              </Typography>
              
              {/* Social Links */}
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social) => (
                  <Box
                    key={social.label}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha('#FFFFFF', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha('#FFFFFF', 0.2),
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <social.icon sx={{ fontSize: 20 }} />
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <Grid item xs={6} sm={3} md={2} key={section.title}>
              <Typography 
                variant="overline" 
                sx={{ 
                  fontWeight: 700,
                  color: alpha('#FFFFFF', 0.95),
                  mb: 2,
                  display: 'block'
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1.5}>
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    component={RouterLink}
                    to={link.to}
                    sx={{
                      color: alpha('#FFFFFF', 0.7),
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#FFFFFF',
                        paddingLeft: '4px',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: alpha('#FFFFFF', 0.1), mb: 4 }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: alpha('#FFFFFF', 0.7),
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            © {currentYear} Scholar's Path. All rights reserved.
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={3}
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              href="mailto:contact@scholarspath.com"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: alpha('#FFFFFF', 0.7),
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.3s ease',
                '&:hover': {
                  color: '#FFFFFF',
                },
              }}
            >
              <EmailIcon sx={{ fontSize: 16 }} />
              Contact Us
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;