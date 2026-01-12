import { useSelector } from 'react-redux'
import { 
    Container, 
    Typography, 
    Box, 
    Paper, 
    useTheme, 
    alpha, 
    Stack, 
    Button,
    IconButton,
    Tooltip,
    Popover
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import CryptoDepositForm from './CryptoDepositForm'
import CryptoDepositQR from './CryptoDepositQR'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import QrCodeIcon from '@mui/icons-material/QrCode';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function CryptoDeposit() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { depositQRData } = useSelector(state => state.payment);
    
    // State for popover
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState('');

    const handleBack = () => {
        navigate(-1); 
    };

    // Popover handlers
    const handleInfoClick = (event, content) => {
        setAnchorEl(event.currentTarget);
        setPopoverContent(content);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const popoverId = open ? 'crypto-deposit-info-popover' : undefined;

    // Content variables for different info sections
    const headerInfoContent = `
        • Crypto deposits are secure and irreversible
        • Funds typically appear in your account within 1-6 confirmations
        • Network fees apply and vary based on blockchain congestion
        • Always double-check the deposit address before sending
        • Contact support if your deposit doesn't appear after 30 minutes
    `;

    const depositFormInfoContent = `
        • Select the cryptocurrency you want to deposit
        • Choose the network - make sure it matches your wallet
        • Enter the amount you wish to deposit
        • Minimum deposit amounts vary by cryptocurrency
        • Maximum limits apply for security reasons
    `;

    const qrCodeInfoContent = `
        • Scan this QR code with your crypto wallet
        • The QR contains the deposit address and amount
        • Do not share this QR code with others
        • Each QR code is unique to this deposit
        • Expires after 1 hour for security
    `;

    const generalInfoContent = `
        IMPORTANT SAFETY TIPS:
        
        1. Always verify the deposit address
        2. Send a small test amount first for large deposits
        3. Keep your transaction ID for reference
        4. Deposits are processed automatically
        5. Contact support if you encounter any issues
    `;

    // Theme-based colors
    const borderColor = theme.palette.mode === 'dark' 
        ? alpha(theme.palette.divider, 0.1)
        : theme.palette.divider;

    const cardBgColor = theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.8)
        : theme.palette.background.paper;

    const infoCardBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.info.dark, 0.15)
        : alpha(theme.palette.info.light, 0.08);

    const infoCardBorder = theme.palette.mode === 'dark'
        ? alpha(theme.palette.info.main, 0.3)
        : alpha(theme.palette.info.main, 0.2);

    const helpSectionBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.grey[900], 0.5)
        : alpha(theme.palette.grey[100], 0.5);

    const emptyStateBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.3)
        : alpha(theme.palette.background.paper, 0.5);

    const emptyStateBorder = theme.palette.mode === 'dark'
        ? alpha(theme.palette.divider, 0.3)
        : theme.palette.divider;

    const qrInstructionsBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.dark, 0.1)
        : alpha(theme.palette.primary.light, 0.03);

    const qrInstructionsBorder = theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.main, 0.2)
        : alpha(theme.palette.primary.main, 0.1);

    const metricCardBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.dark, 0.1)
        : alpha(theme.palette.primary.light, 0.05);

    const metricCardHoverBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.primary.dark, 0.2)
        : alpha(theme.palette.primary.light, 0.1);

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
                        <CurrencyExchangeIcon sx={{ 
                            fontSize: '2.5rem', 
                            color: 'primary.main',
                            filter: theme.palette.mode === 'dark' ? 'brightness(1.1)' : 'none'
                        }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    fontWeight: 700,
                                    background: theme.palette.mode === 'dark'
                                        ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                                        : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: theme.palette.mode === 'dark' 
                                        ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                                        : 'none'
                                }}
                            >
                                Crypto Deposit
                            </Typography>
                            <Tooltip title="Crypto deposit information">
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleInfoClick(e, headerInfoContent)}
                                    sx={{ 
                                        color: 'primary.main',
                                        '&:hover': { 
                                            bgcolor: alpha(theme.palette.primary.main, 0.1) 
                                        }
                                    }}
                                >
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        Deposit cryptocurrency directly to your account. Secure, fast, and with minimal fees.
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
                        borderColor: theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.primary.main, 0.5)
                            : 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                            borderWidth: 2,
                            borderColor: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                    }}
                >
                    Back to Deposit Methods
                </Button>
            </Stack>

            {/* Information Popover */}
            <Popover
                id={popoverId}
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        p: 2,
                        maxWidth: 400,
                        borderRadius: 2,
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0,0,0,0.4)'
                            : '0 8px 32px rgba(0,0,0,0.1)',
                        border: `1px solid ${borderColor}`,
                        bgcolor: theme.palette.mode === 'dark'
                            ? theme.palette.background.paper
                            : 'background.paper',
                        backgroundImage: theme.palette.mode === 'dark'
                            ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
                            : 'none',
                    }
                }}
            >
                <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary">
                        Crypto Deposit Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                        {popoverContent}
                    </Typography>
                </Stack>
            </Popover>

            {/* General Information Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 4,
                    borderRadius: 2,
                    bgcolor: infoCardBg,
                    border: `1px solid ${infoCardBorder}`,
                    backgroundImage: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(theme.palette.info.dark, 0.1)} 0%, ${alpha(theme.palette.info.dark, 0.05)} 100%)`
                        : 'none',
                }}
            >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                    <InfoIcon color="info" sx={{ mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" fontWeight={500} color={theme.palette.mode === 'dark' ? 'info.light' : 'text.primary'}>
                                Important Crypto Deposit Guidelines
                            </Typography>
                            <Tooltip title="Click for detailed safety tips">
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleInfoClick(e, generalInfoContent)}
                                    sx={{ 
                                        p: 0.5,
                                        color: 'info.main',
                                        '&:hover': { 
                                            bgcolor: alpha(theme.palette.info.main, 0.1) 
                                        }
                                    }}
                                >
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Typography variant="caption" color={theme.palette.mode === 'dark' ? 'text.secondary' : 'text.secondary'}>
                            • Verify addresses carefully • Send test amounts first • Keep transaction IDs • Network fees apply • Contact support for help
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

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
                            border: `1px solid ${borderColor}`,
                            backgroundColor: cardBgColor,
                            boxShadow: theme.palette.mode === 'dark'
                                ? '0 4px 20px rgba(0,0,0,0.2)'
                                : '0 4px 20px rgba(0,0,0,0.05)',
                            backgroundImage: theme.palette.mode === 'dark'
                                ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.6)} 100%)`
                                : 'none',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 8px 32px rgba(0,0,0,0.3)'
                                    : '0 8px 32px rgba(0,0,0,0.1)',
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                                Deposit Form
                            </Typography>
                            <Tooltip title="Form instructions">
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleInfoClick(e, depositFormInfoContent)}
                                    sx={{ 
                                        color: 'primary.main',
                                        '&:hover': { 
                                            bgcolor: alpha(theme.palette.primary.main, 0.1) 
                                        }
                                    }}
                                >
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <CryptoDepositForm />
                    </Paper>
                </Grid>

                {/* QR Code Section */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    {depositQRData ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                height: '100%',
                                borderRadius: 2,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: cardBgColor,
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 4px 20px rgba(0,0,0,0.2)'
                                    : '0 4px 20px rgba(0,0,0,0.05)',
                                backgroundImage: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.6)} 100%)`
                                    : 'none',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 8px 32px rgba(0,0,0,0.3)'
                                        : '0 8px 32px rgba(0,0,0,0.1)',
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <QrCodeIcon color="primary" />
                                    <Typography variant="h6" fontWeight={600} color="text.primary">
                                        Deposit QR Code
                                    </Typography>
                                </Stack>
                                <Tooltip title="QR code instructions">
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => handleInfoClick(e, qrCodeInfoContent)}
                                        sx={{ 
                                            color: 'primary.main',
                                            '&:hover': { 
                                                bgcolor: alpha(theme.palette.primary.main, 0.1) 
                                            }
                                        }}
                                    >
                                        <InfoIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <CryptoDepositQR />
                            
                            {/* QR Code Instructions */}
                            <Paper
                                elevation={0}
                                sx={{
                                    mt: 3,
                                    p: 2,
                                    borderRadius: 1,
                                    bgcolor: qrInstructionsBg,
                                    border: `1px solid ${qrInstructionsBorder}`,
                                    backgroundImage: theme.palette.mode === 'dark'
                                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`
                                        : 'none',
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <InfoIcon color="primary" fontSize="small" />
                                    <Typography variant="caption" color={theme.palette.mode === 'dark' ? 'primary.light' : 'text.secondary'}>
                                        Scan this QR code with your crypto wallet app to make the deposit
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Paper>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                height: '100%',
                                borderRadius: 2,
                                border: `1px dashed ${emptyStateBorder}`,
                                backgroundColor: emptyStateBg,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                minHeight: 400,
                                position: 'relative',
                                backgroundImage: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.3)} 0%, ${alpha(theme.palette.background.default, 0.2)} 100%)`
                                    : 'none',
                            }}
                        >
                            <QrCodeIcon sx={{ 
                                fontSize: 64, 
                                color: theme.palette.mode === 'dark' ? 'grey.600' : 'text.disabled', 
                                mb: 2 
                            }} />
                            <Typography variant="h6" color={theme.palette.mode === 'dark' ? 'text.secondary' : 'text.secondary'} gutterBottom>
                                QR Code Will Appear Here
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'text.secondary' : 'text.secondary'} sx={{ mb: 3 }}>
                                Fill out the deposit form on the left to generate a QR code for your deposit.
                            </Typography>
                            
                            {/* Info button for empty state */}
                            <Tooltip title="How to generate QR code">
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleInfoClick(e, "Complete the deposit form to generate a QR code. The QR code will contain:\n• Deposit address\n• Deposit amount\n• Network information\n• Expiry timestamp")}
                                    sx={{ 
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        color: theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary',
                                        '&:hover': { 
                                            bgcolor: alpha(theme.palette.primary.main, 0.1) 
                                        }
                                    }}
                                >
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            {/* Additional Information Section */}
            <Paper
                elevation={0}
                sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 2,
                    bgcolor: helpSectionBg,
                    border: `1px solid ${borderColor}`,
                    backgroundImage: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${alpha(theme.palette.grey[900], 0.5)} 0%, ${alpha(theme.palette.grey[800], 0.3)} 100%)`
                        : 'none',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                        Need Help with Crypto Deposits?
                    </Typography>
                    <Tooltip title="Get assistance with crypto deposits">
                        <IconButton 
                            size="small" 
                            onClick={(e) => handleInfoClick(e, "Our support team can help with:\n• Deposit issues\n• Address verification\n• Transaction troubleshooting\n• Network fee explanations\n• Security concerns")}
                            sx={{ 
                                color: 'primary.main',
                                '&:hover': { 
                                    bgcolor: alpha(theme.palette.primary.main, 0.1) 
                                }
                            }}
                        >
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: metricCardBg,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                transition: 'all 0.3s ease',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                    bgcolor: metricCardHoverBg,
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                                        : `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                                }
                            }}
                        >
                            <SpeedIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" fontWeight={600} color="primary" gutterBottom>
                                Fast Processing
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                1-6 confirmations typically
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: metricCardBg,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                transition: 'all 0.3s ease',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                    bgcolor: metricCardHoverBg,
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                                        : `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                                }
                            }}
                        >
                            <AttachMoneyIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" fontWeight={600} color="primary" gutterBottom>
                                Low Fees
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Network fees only
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: metricCardBg,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                transition: 'all 0.3s ease',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                    bgcolor: metricCardHoverBg,
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                                        : `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                                }
                            }}
                        >
                            <SecurityIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" fontWeight={600} color="primary" gutterBottom>
                                Secure
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Blockchain security
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: metricCardBg,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                transition: 'all 0.3s ease',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                    bgcolor: metricCardHoverBg,
                                    transform: 'translateY(-2px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                                        : `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                                }
                            }}
                        >
                            <SupportAgentIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" fontWeight={600} color="primary" gutterBottom>
                                24/7 Support
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Always available
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button 
                        variant="outlined" 
                        sx={{ 
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            borderColor: theme.palette.mode === 'dark' 
                                ? alpha(theme.palette.primary.main, 0.5)
                                : 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                        }}
                        onClick={() => navigate('/support/crypto-deposit-help')}
                    >
                        Contact Support for Crypto Deposit Help
                    </Button>
                </Box>
            </Paper>
        </Container>
    )
}

export default CryptoDeposit;