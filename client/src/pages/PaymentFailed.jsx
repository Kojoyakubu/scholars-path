import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Container, Button } from '@mui/material';

function PaymentFailed() {
  return (
    <Container>
      <Box textAlign="center" my={10}>
        <Typography variant="h4" color="error" gutterBottom>Payment Failed</Typography>
        <Typography variant="h6" color="text.secondary">There was a problem with your payment. Please try again.</Typography>
        <Button component={RouterLink} to="/pricing" variant="contained" sx={{mt: 4}}>Try Again</Button>
      </Box>
    </Container>
  );
}

export default PaymentFailed;