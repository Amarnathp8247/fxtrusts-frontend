import { Container, Typography, Box, Paper, useTheme, alpha, Stack, Button } from '@mui/material'
import Grid from '@mui/material/Grid2'
import BankDepositForm from './BankDepositForm'
import BankDepositDetails from './BankDepositDetails'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

function BankDeposit() {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); 
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section with Back Button */}
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 4 }}
            >
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <AccountBalanceIcon sx={{ 
                            fontSize: '2.5rem', 
                            color: 'primary.main' 
                        }} />
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 700,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            Bank Deposit
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        Securely deposit funds directly from your bank account. All transactions are encrypted and protected.
                    </Typography>
                </Box>
                
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                        borderWidth: 2,
                        '&:hover': {
                            borderWidth: 2,
                        }
                    }}
                >
                    Back to Deposit Methods
                </Button>
            </Stack>

            {/* Main Content Grid */}
            <Grid container spacing={4}>
                {/* Form Section */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 3 },
                            height: '100%',
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                            Deposit Form
                        </Typography>
                        <BankDepositForm />
                    </Paper>
                </Grid>

                {/* Details Section */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 3 },
                            height: '100%',
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                            Bank Details & Instructions
                        </Typography>
                        <BankDepositDetails />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}

export default BankDeposit;