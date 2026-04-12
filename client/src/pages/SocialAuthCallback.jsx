import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Container, Paper, Typography } from '@mui/material';
import api from '../api/axios';
import { consumeSocialOAuthState } from '../utils/socialOAuth';

const SocialAuthCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Completing social sign-in...');

  useEffect(() => {
    const completeAuth = async () => {
      const error = params.get('error');
      const code = params.get('code');
      const state = params.get('state');

      if (error) {
        setMessage('Social sign-in was cancelled or denied. Redirecting...');
        setTimeout(() => navigate('/login', { replace: true }), 1400);
        return;
      }

      if (!code || !state) {
        setMessage('Invalid social callback payload. Redirecting...');
        setTimeout(() => navigate('/login', { replace: true }), 1400);
        return;
      }

      const oauthState = consumeSocialOAuthState(state);
      if (!oauthState?.provider || !oauthState?.redirectUri) {
        setMessage('OAuth session expired. Please try again. Redirecting...');
        setTimeout(() => navigate('/login', { replace: true }), 1600);
        return;
      }

      try {
        const response = await api.post('/api/users/social-auth/exchange', {
          provider: oauthState.provider,
          code,
          role: oauthState.role || 'student',
          mode: oauthState.mode || 'login',
          redirectUri: oauthState.redirectUri,
          codeVerifier: oauthState.codeVerifier,
        });

        const payload = response.data || {};
        const user = payload.user;
        const accessToken = payload.accessToken || user?.token;

        if (!user || !accessToken) {
          const infoMessage = payload.message || 'Authentication completed. Please continue to login.';
          navigate('/login', { replace: true, state: { message: infoMessage } });
          return;
        }

        const normalizedUser = {
          ...user,
          token: accessToken,
          accessToken,
          refreshToken: payload.refreshToken || user?.refreshToken,
        };

        localStorage.setItem('user', JSON.stringify(normalizedUser));

        if (user.role === 'student') {
          navigate('/student/select-class', { replace: true });
        } else if (user.role === 'teacher' || user.role === 'school_admin') {
          navigate('/teacher/dashboard', { replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (authError) {
        const apiMessage = authError.response?.data?.message || 'Social authentication failed. Redirecting...';
        navigate('/login', { replace: true, state: { message: apiMessage } });
      }
    };

    completeAuth();
  }, [navigate, params]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F4F1EA' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }} elevation={1}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            Social Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SocialAuthCallback;
