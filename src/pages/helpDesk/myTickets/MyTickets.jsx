import { Container, Box, Typography, Paper, Stack, alpha, useTheme } from '@mui/material';
import TicketsTable from './ticketsTable/TicketsTable';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

function MyTickets() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Get tickets data from state if available (assuming you have it in Redux)
  const ticketsData = useSelector(state => state.support?.tickets?.data || {});
  
  // Calculate stats
  const ticketStats = useMemo(() => {
    const tickets = ticketsData?.ticketList || [];
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      closed: tickets.filter(t => t.status === 'CLOSED').length,
      processing: tickets.filter(t => t.status === 'PROCESSING').length,
    };
  }, [ticketsData]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SupportAgentIcon 
                sx={{ 
                  color: 'primary.main',
                  fontSize: '2rem'
                }} 
              />
            </Box>
            <Box>
              <Typography 
                variant="h4" 
                fontWeight={700}
                sx={{ 
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: 'text.primary'
                }}
              >
                My Support Tickets
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                Track and manage all your support requests
              </Typography>
            </Box>
          </Stack>
          
          {/* Quick Stats */}
          <Stack direction="row" spacing={2}>
            <Paper
              sx={{
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: isDarkMode 
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                minWidth: '80px'
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Total
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main' }}>
                {ticketStats.total}
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 1.5,
                borderRadius: '10px',
                backgroundColor: isDarkMode 
                  ? alpha(theme.palette.info.main, 0.08)
                  : alpha(theme.palette.info.main, 0.04),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                minWidth: '80px'
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Open
              </Typography>
              <Typography variant="h6" fontWeight={600} sx={{ color: 'info.main' }}>
                {ticketStats.open}
              </Typography>
            </Paper>
          </Stack>
        </Stack>
      </Box>

      {/* Table Section */}
      <Paper 
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: '16px',
          backgroundColor: 'background.paper',
          border: `1px solid ${alpha(
            isDarkMode ? theme.palette.divider : theme.palette.grey[200], 
            0.5
          )}`,
          boxShadow: isDarkMode 
            ? '0 4px 24px rgba(0,0,0,0.2)' 
            : '0 2px 16px rgba(0,0,0,0.06)',
        }}
      >
        <TicketsTable />
      </Paper>
    </Container>
  )
}

export default MyTickets;