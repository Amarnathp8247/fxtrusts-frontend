import Grid from '@mui/material/Grid2'
import { footerData, footerLinkData } from './footerData';
import { Container, Stack, Typography, Box, Divider, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

const FULL_BRAND_NAME = import.meta.env.VITE_FULL_BRAND_NAME;

function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        borderTop: `1px solid ${theme.palette.divider}`,
        py: { xs: 4, sm: 6 },
        color: 'text.secondary'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, sm: 6 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Box mb={3}>
              <Typography 
                variant="h6" 
                color="text.primary" 
                fontWeight="600"
                gutterBottom
              >
                {FULL_BRAND_NAME}
              </Typography>
              <Stack spacing={1}>
                {footerData.map((item, i) => (
                  <Typography 
                    key={i} 
                    variant="body2" 
                    lineHeight={1.6}
                    maxWidth="70ch"
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography 
              variant="subtitle1" 
              color="text.primary" 
              fontWeight="600"
              gutterBottom
            >
              Quick Links
            </Typography>
            <Stack spacing={1.5}>
              {footerLinkData.map((linkItem, i) => (
                <Typography
                  key={i}
                  component={Link}
                  to={linkItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  sx={{
                    textDecoration: 'none',
                    color: 'primary.main',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: 'primary.dark',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {linkItem.name}
                </Typography>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Section */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          {/* Copyright */}
          <Typography variant="body2">
            © {currentYear} {FULL_BRAND_NAME}. All rights reserved.
          </Typography>

        

          {/* Optional Social Links or Additional Info */}
          <Stack direction="row" spacing={3}>
            <Typography 
              component="a" 
              href="#" 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Privacy Policy
            </Typography>
            <Typography 
              component="a" 
              href="#" 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Terms of Service
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;