import { 
    Card, 
    Stack, 
    Typography, 
    useMediaQuery, 
    Box, 
    Chip, 
    Alert, 
    Paper, 
    Button, 
    alpha, 
    IconButton, 
    Tooltip, 
    Popover 
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { withdrawalMethodsData } from './withdrawalMethodsData'
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SecurityIcon from '@mui/icons-material/Security';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetUserDataQuery } from '../../../../globalState/userState/userStateApis';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

function WithdrawalMethods() {
    const theme = useTheme();
    const { token } = useSelector((state) => state.auth);
    const { data, isLoading } = useGetUserDataQuery(undefined, {
        skip: !token,
        refetchOnMountOrArgChange: true,
    })

    const isKycVerified = !isLoading && data?.data?.userData?.isKycVerified;
    const isBankVerified = !isLoading && data?.data?.userData?.isBankVerified;

    const isDesktop = useMediaQuery('(min-width:768px)');
    const isTablet = useMediaQuery('(min-width:600px)');
    
    // State for popover
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState('');

    // Filter methods based on verification status
    const getAvailableMethods = () => {
        return withdrawalMethodsData.filter(method => {
            if (method.requiresKYC && !isKycVerified) return false;
            if (method.requiresBankVerification && !isBankVerified) return false;
            return true;
        });
    };

    const availableMethods = getAvailableMethods();
    const unavailableMethods = withdrawalMethodsData.filter(m => !availableMethods.includes(m));

    // Get verification progress
    const verificationProgress = () => {
        let completed = 0;
        let total = 2; // KYC + Bank Verification
        
        if (isKycVerified) completed++;
        if (isBankVerified) completed++;
        
        return { completed, total, percentage: (completed / total) * 100 };
    };

    const progress = verificationProgress();

    // Popover handlers
    const handleInfoClick = (event, content) => {
        setAnchorEl(event.currentTarget);
        setPopoverContent(content);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const popoverId = open ? 'withdrawal-info-popover' : undefined;

    // Content for header info popup
    const headerInfoContent = `
        • All withdrawal methods are secure and encrypted
        • Withdrawals are processed within 1-5 business days
        • Contact support if you experience any delays
        • Some methods may have processing fees
    `;

    // Content for verification info
    const verificationInfoContent = `
        Complete KYC and Bank verification to unlock all withdrawal methods. 
        This process helps us ensure account security and compliance with regulations.
        
        KYC Verification: Verify your identity with government-issued ID
        Bank Verification: Add and verify your withdrawal bank account details
    `;

    // Content for available methods info
    const availableMethodsInfoContent = `
        These methods are available based on your current verification level. 
        Complete verification to unlock more options.
        
        • Basic verification unlocks standard methods
        • Full verification unlocks all withdrawal methods
        • Some methods have higher withdrawal limits
    `;

    // Content for unavailable methods info
    const unavailableMethodsInfoContent = `
        These methods require additional verification. 
        Complete KYC and/or Bank verification to access them.
        
        • KYC Verification unlocks more withdrawal options
        • Bank Verification enables bank transfer methods
        • Complete both for full access
    `;

    // Content for withdrawal info chips
    const withdrawalInfoContent = `
        • Minimum withdrawal amount varies by method
        • Processing time: 1-5 business days
        • Some methods may require additional verification
        • Fees may apply depending on the method
        • Contact support for any issues
    `;

    // Theme-aware colors
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

    const unavailableBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.grey[900], 0.3)
        : alpha('#000', 0.02);

    const gradientBg = theme.palette.mode === 'dark'
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.secondary.dark, 0.1)} 100%)`
        : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`;

    return (
        <Stack spacing={3}>
            {/* Welcome Header with Info Icon */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant='h4' fontWeight={700} color="text.primary">
                            Withdraw Funds
                        </Typography>
                        <Tooltip title="More information about withdrawals">
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
                    <Typography variant='body1' color="text.secondary">
                        Choose your preferred withdrawal method. Your funds will be processed securely.
                    </Typography>
                </Box>
            </Box>

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
                        bgcolor: theme.palette.background.paper,
                        backgroundImage: theme.palette.mode === 'dark'
                            ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
                            : 'none',
                    }
                }}
            >
                <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary">
                        Withdrawal Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                        {popoverContent}
                    </Typography>
                </Stack>
            </Popover>

            {/* Verification Status Banner */}
            {progress.percentage < 100 && (
                <Alert 
                    severity="warning" 
                    icon={<WarningIcon />}
                    sx={{ 
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                        '& .MuiAlert-message': { width: '100%' },
                        bgcolor: alpha(theme.palette.warning.main, 0.05),
                    }}
                >
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} color={theme.palette.mode === 'dark' ? 'warning.light' : 'warning.dark'}>
                                Complete Verification to Access All Withdrawal Methods
                            </Typography>
                            <Tooltip title="Verification helps secure your account">
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleInfoClick(e, verificationInfoContent)}
                                    sx={{ 
                                        p: 0.5,
                                        color: 'warning.main',
                                        '&:hover': { 
                                            bgcolor: alpha(theme.palette.warning.main, 0.1) 
                                        }
                                    }}
                                >
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        
                        {/* Progress Bar */}
                        <Box sx={{ width: '100%', mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color={theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary'}>
                                    Verification Progress
                                </Typography>
                                <Typography variant="caption" fontWeight={600} color="warning.main">
                                    {progress.completed}/{progress.total} Complete
                                </Typography>
                            </Box>
                            <Box sx={{ 
                                width: '100%', 
                                height: 8, 
                                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200', 
                                borderRadius: 4,
                                overflow: 'hidden'
                            }}>
                                <Box sx={{ 
                                    width: `${progress.percentage}%`, 
                                    height: '100%', 
                                    bgcolor: progress.percentage === 100 ? 'success.main' : 'warning.main',
                                    transition: 'width 0.5s ease'
                                }} />
                            </Box>
                        </Box>

                        {/* Verification Items */}
                        <Stack spacing={1} sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isKycVerified ? (
                                    <CheckCircleIcon color="success" fontSize="small" />
                                ) : (
                                    <LockIcon color="warning" fontSize="small" />
                                )}
                                <Typography variant="body2" color="text.primary">
                                    KYC Verification: {isKycVerified ? 'Verified' : 'Pending'}
                                </Typography>
                                {!isKycVerified && (
                                    <Button 
                                        size="small" 
                                        variant="text" 
                                        component={Link}
                                        to="/verification/kyc"
                                        sx={{ 
                                            ml: 'auto', 
                                            fontSize: '0.75rem',
                                            color: 'warning.main',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.warning.main, 0.1)
                                            }
                                        }}
                                    >
                                        Complete Now
                                    </Button>
                                )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isBankVerified ? (
                                    <CheckCircleIcon color="success" fontSize="small" />
                                ) : (
                                    <LockIcon color="warning" fontSize="small" />
                                )}
                                <Typography variant="body2" color="text.primary">
                                    Bank Verification: {isBankVerified ? 'Verified' : 'Pending'}
                                </Typography>
                                {!isBankVerified && (
                                    <Button 
                                        size="small" 
                                        variant="text" 
                                        component={Link}
                                        to="/verification/bank"
                                        sx={{ 
                                            ml: 'auto', 
                                            fontSize: '0.75rem',
                                            color: 'warning.main',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.warning.main, 0.1)
                                            }
                                        }}
                                    >
                                        Complete Now
                                    </Button>
                                )}
                            </Box>
                        </Stack>
                    </Stack>
                </Alert>
            )}

            {/* Important Information - Compact Chips */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        Important Information
                    </Typography>
                    <Tooltip title="Click for detailed information">
                        <IconButton 
                            size="small" 
                            onClick={(e) => handleInfoClick(e, withdrawalInfoContent)}
                            sx={{ 
                                color: 'info.main',
                                p: 0.5,
                                '&:hover': { 
                                    bgcolor: alpha(theme.palette.info.main, 0.1) 
                                }
                            }}
                        >
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                        icon={<AttachMoneyIcon fontSize="small" />}
                        label="Min withdrawal varies"
                        size="small"
                        variant="outlined"
                        color="info"
                        sx={{ 
                            fontSize: '0.75rem',
                            borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.3) : undefined,
                            color: theme.palette.mode === 'dark' ? 'info.light' : undefined,
                        }}
                        onClick={(e) => handleInfoClick(e, "Minimum withdrawal amount varies by method. Check each method for specific limits.")}
                    />
                    <Chip
                        icon={<ScheduleIcon fontSize="small" />}
                        label="1-5 business days"
                        size="small"
                        variant="outlined"
                        color="warning"
                        sx={{ 
                            fontSize: '0.75rem',
                            borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.3) : undefined,
                            color: theme.palette.mode === 'dark' ? 'warning.light' : undefined,
                        }}
                        onClick={(e) => handleInfoClick(e, "Withdrawals are processed within 1-5 business days. Some methods may take longer.")}
                    />
                    <Chip
                        icon={<LockIcon fontSize="small" />}
                        label="Verification needed"
                        size="small"
                        variant="outlined"
                        color="warning"
                        sx={{ 
                            fontSize: '0.75rem',
                            borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.3) : undefined,
                            color: theme.palette.mode === 'dark' ? 'warning.light' : undefined,
                        }}
                        onClick={(e) => handleInfoClick(e, "Some methods require additional verification. Complete KYC for full access.")}
                    />
                    <Chip
                        icon={<MoneyOffIcon fontSize="small" />}
                        label="Fees may apply"
                        size="small"
                        variant="outlined"
                        color="info"
                        sx={{ 
                            fontSize: '0.75rem',
                            borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.3) : undefined,
                            color: theme.palette.mode === 'dark' ? 'info.light' : undefined,
                        }}
                        onClick={(e) => handleInfoClick(e, "Some withdrawal methods may have processing fees. Check each method for details.")}
                    />
                    <Chip
                        icon={<SecurityIcon fontSize="small" />}
                        label="Secure processing"
                        size="small"
                        variant="outlined"
                        color="success"
                        sx={{ 
                            fontSize: '0.75rem',
                            borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.3) : undefined,
                            color: theme.palette.mode === 'dark' ? 'success.light' : undefined,
                        }}
                        onClick={(e) => handleInfoClick(e, "All withdrawals are processed securely with multiple verification steps.")}
                    />
                </Stack>
            </Box>

            {/* Available Methods */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
                        Available Withdrawal Methods ({availableMethods.length})
                    </Typography>
                    <Tooltip title="Methods available based on your verification status">
                        <IconButton 
                            size="small" 
                            onClick={(e) => handleInfoClick(e, availableMethodsInfoContent)}
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
                <Grid container spacing={3}>
                    {availableMethods.map((item, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card
                                component={Link}
                                to={item.to}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    border: `1px solid ${borderColor}`,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backgroundColor: cardBgColor,
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 4px 20px rgba(0,0,0,0.2)'
                                        : '0 4px 20px rgba(0,0,0,0.05)',
                                    '&:hover': {
                                        boxShadow: theme.palette.mode === 'dark'
                                            ? '0 8px 32px rgba(0,0,0,0.3)'
                                            : '0 8px 32px rgba(0,0,0,0.1)',
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-4px)',
                                        '& .arrow-icon': {
                                            transform: 'translateX(4px)',
                                        }
                                    }
                                }}
                            >
                                {/* Method Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 2,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                                            }}
                                        >
                                            <img 
                                                src={item.img} 
                                                alt={item.methodName} 
                                                style={{ width: 32, height: 32, objectFit: 'contain' }}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography fontWeight={700} variant="h6" color="text.primary">
                                                {item.methodName}
                                            </Typography>
                                            {item.specification && (
                                                <Chip
                                                    label={item.specification}
                                                    size="small"
                                                    color="primary"
                                                    variant="filled"
                                                    sx={{ 
                                                        mt: 0.5, 
                                                        fontSize: '0.7rem', 
                                                        height: 20,
                                                        bgcolor: theme.palette.mode === 'dark' 
                                                            ? alpha(theme.palette.primary.main, 0.2)
                                                            : undefined
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Stack>
                                    
                                    <ArrowForwardIcon 
                                        className="arrow-icon"
                                        color="primary"
                                        sx={{ 
                                            transition: 'transform 0.3s ease',
                                            opacity: 0.7 
                                        }}
                                    />
                                </Box>

                                {/* Method Details */}
                                <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                                    {Object.entries(item?.details).map(([key, value], idx) => (
                                        <Box 
                                            key={idx} 
                                            sx={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                py: 0.5
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                {key}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="primary.main">
                                                {value}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>

                                {/* Additional Info */}
                                {item.additionalInfo && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1,
                                            borderRadius: 1,
                                            bgcolor: alpha(theme.palette.info.main, 0.08),
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary">
                                            {item.additionalInfo}
                                        </Typography>
                                    </Paper>
                                )}

                                {/* Action Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{ 
                                        mt: 2, 
                                        borderRadius: 1,
                                        bgcolor: theme.palette.mode === 'dark' 
                                            ? alpha(theme.palette.primary.main, 0.9)
                                            : undefined,
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark' 
                                                ? alpha(theme.palette.primary.main, 1)
                                                : undefined,
                                        }
                                    }}
                                >
                                    Withdraw via {item.methodName}
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Unavailable Methods */}
            {unavailableMethods.length > 0 && (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="h6" fontWeight={600} color="text.secondary">
                            Unavailable Methods ({unavailableMethods.length})
                        </Typography>
                        <Tooltip title="Complete verification to unlock these methods">
                            <IconButton 
                                size="small" 
                                onClick={(e) => handleInfoClick(e, unavailableMethodsInfoContent)}
                                sx={{ 
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
                    <Alert 
                        severity="info"
                        sx={{ 
                            borderRadius: 2,
                            bgcolor: infoCardBg,
                            border: `1px solid ${infoCardBorder}`,
                            color: theme.palette.mode === 'dark' ? 'info.light' : 'info.dark',
                        }}
                    >
                        Complete verification to unlock these withdrawal methods
                    </Alert>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {unavailableMethods.map((item, i) => (
                            <Grid key={i} size={{ xs: 12, sm: 6 }}>
                                <Paper 
                                    sx={{ 
                                        p: 2, 
                                        borderRadius: 2,
                                        border: `1px solid ${borderColor}`,
                                        bgcolor: unavailableBg,
                                        opacity: 0.7,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            opacity: 0.9,
                                            borderColor: theme.palette.divider,
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 1,
                                            bgcolor: theme.palette.mode === 'dark'
                                                ? alpha(theme.palette.grey[800], 0.5)
                                                : alpha('#000', 0.05)
                                        }}
                                    >
                                        <img 
                                            src={item.img} 
                                            alt={item.methodName} 
                                            style={{ width: 24, height: 24, objectFit: 'contain' }}
                                        />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography fontWeight={600} color="text.secondary">
                                            {item.methodName}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                            <LockIcon fontSize="small" color="action" />
                                            <Typography variant="caption" color="text.secondary">
                                                {item.requiresKYC && !isKycVerified ? 'Requires KYC Verification' : ''}
                                                {item.requiresBankVerification && !isBankVerified ? 'Requires Bank Verification' : ''}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <IconButton 
                                        size="small" 
                                        component={Link}
                                        to={item.requiresKYC && !isKycVerified ? "/verification/kyc" : "/verification/bank"}
                                        sx={{ 
                                            color: 'primary.main',
                                            '&:hover': { 
                                                bgcolor: alpha(theme.palette.primary.main, 0.1) 
                                            }
                                        }}
                                    >
                                        <ArrowForwardIcon fontSize="small" />
                                    </IconButton>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Need Help Section */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: helpSectionBg,
                    border: `1px solid ${borderColor}`,
                    textAlign: 'center'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body1" fontWeight={500} color="text.primary">
                        Need help with withdrawals?
                    </Typography>
                    <Tooltip title="Get assistance with withdrawal methods">
                        <IconButton 
                            size="small" 
                            onClick={(e) => handleInfoClick(e, "Contact our 24/7 support team for help with:\n• Choosing the right withdrawal method\n• Troubleshooting withdrawal issues\n• Understanding withdrawal limits\n• Verification assistance\n• Processing time inquiries")}
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Our support team is available 24/7 to assist you with withdrawal-related queries
                </Typography>
                <Button 
                    variant="outlined" 
                    component={Link}
                    to="/client/helpDesk/newTicket"
                    sx={{
                        borderColor: theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.primary.main, 0.5)
                            : 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                    }}
                >
                    Get Withdrawal Support
                </Button>
            </Paper>

            {/* Withdrawal Stats Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    backgroundImage: theme.palette.mode === 'dark' ? gradientBg : 'none',
                }}
            >
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                {availableMethods.length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Available Methods
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                {isKycVerified ? '✓' : '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                KYC Verified
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                {isBankVerified ? '✓' : '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Bank Verified
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                                {progress.percentage}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Verification Complete
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Stack>
    )
}

export default WithdrawalMethods;