import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, reset } from '../features/auth/authSlice';
import { Button, TextField, Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // Don't show an error if the login is successful
    if (isError && !isSuccess) {
      // The alert is now handled by the Alert component
    }

    if (isSuccess || user) {
      navigate('/');
    }
    
    // We want to reset only when the component unmounts
    return () => {
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password };
    dispatch(login(userData));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center',
            backgroundColor: 'white', padding: '20px 40px', borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <Typography component="h1" variant="h5" sx={{fontWeight: '600'}}>
            Sign In
          </Typography>
          
          <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            {isError && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
            
            <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email"
              autoComplete="email" autoFocus value={email} onChange={onChange} />
            <TextField margin="normal" required fullWidth name="password" label="Password" type="password"
              id="password" autoComplete="current-password" value={password} onChange={onChange} />
            
            <Button type="submit" fullWidth variant="contained" disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
        </Box>
      </Container>
    </motion.div>
  );
}

export default Login;