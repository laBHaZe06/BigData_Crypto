import React from 'react';
import { Typography, Container, Box } from '@mui/material';

const NotFound = () => {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1">
          The page you are looking for does not exist.
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFound;