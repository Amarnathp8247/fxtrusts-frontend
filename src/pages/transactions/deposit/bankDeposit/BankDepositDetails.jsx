import {
    Stack,
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    Chip,
    useTheme,
    alpha,
    IconButton,
    Snackbar,
    Alert,
    Button
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MailIcon from '@mui/icons-material/Mail';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SecurityIcon from '@mui/icons-material/Security';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';

const BRAND_EMAIL = import.meta.env.VITE_BRAND_EMAIL;

function BankDepositDetails() {
    const theme = useTheme();
    const [copyAlert, setCopyAlert] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const instructions = [
        {
            text: "Deposit funds into the provided account and upload the deposit proof. MUST mention the Transaction ID.",
            icon: <CheckCircleIcon />,
            color: "success"
        },
        {
            text: `In case if you need support please mail to: ${BRAND_EMAIL}`,
            icon: <MailIcon />,
            color: "info"
        },
        {
            text: "Note: 1 USD = 3.67 AED",
            icon: <CurrencyExchangeIcon />,
            color: "warning"
        },
        {
            text: "Do not use Cash Deposit in this bank account. Violation will not get verified.",
            icon: <WarningIcon />,
            color: "error"
        },
        {
            text: "Deposit Confirmation time is 30 Minutes in Working Hours.",
            icon: <ScheduleIcon />,
            color: "info"
        }
    ];

    const bankDetails = [
        { 
            label: "Account Name", 
            value: "FLEXY COMMERCIAL BROKER LLC",
            copyable: true 
        },
        { 
            label: "Account No.", 
            value: "019101640913",
            copyable: true 
        },
        { 
            label: "IBAN Number", 
            value: "AE780330000019101640913",
            copyable: true 
        },
        { 
            label: "SWIFT Code", 
            value: "BOMLAEAD",
            copyable: true 
        },
        { 
            label: "Bank Name", 
            value: "Mashreq Bank",
            copyable: true 
        },
        { 
            label: "Bank Address", 
            value: "Mashreq Bank PSC, P.O.Box 1250, Dubai, UAE",
            copyable: true 
        }
    ];

    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyAlert({
                open: true,
                message: `${label} copied to clipboard!`,
                severity: 'success'
            });
        }).catch(err => {
            setCopyAlert({
                open: true,
                message: 'Failed to copy. Please try again.',
                severity: 'error'
            });
        });
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(BRAND_EMAIL).then(() => {
            setCopyAlert({
                open: true,
                message: 'Email copied to clipboard!',
                severity: 'success'
            });
        });
    };

    const handleCloseAlert = () => {
        setCopyAlert({ ...copyAlert, open: false });
    };

    return (
        <Stack spacing={2}>
            {/* Copy Success Alert */}
            <Snackbar 
                open={copyAlert.open} 
                autoHideDuration={3000} 
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseAlert} 
                    severity={copyAlert.severity}
                    sx={{ width: '100%' }}
                >
                    {copyAlert.message}
                </Alert>
            </Snackbar>

            {/* Important Instructions */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <SecurityIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={600}>
                        Important Instructions
                    </Typography>
                </Stack>
                
                <List disablePadding>
                    {instructions.map((item, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                px: 0,
                                py: 1,
                                borderBottom: index !== instructions.length - 1 ? 
                                    `1px dashed ${alpha(theme.palette.divider, 0.5)}` : 'none',
                                alignItems: 'flex-start'
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                                <Box sx={{ 
                                    color: `${item.color}.main`,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {item.icon}
                                </Box>
                            </ListItemIcon>
                            <Typography variant="body2" fontSize="0.875rem">
                                {item.text}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {/* Bank Details - COMPACT */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <AccountBalanceIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={600}>
                        AED Bank Details
                    </Typography>
                    <Chip 
                        label="UAE Account" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ height: 24 }}
                    />
                </Stack>

                <Grid container spacing={1}>
                    {bankDetails.map((detail, index) => (
                        <Grid key={index} size={{ xs: 12 }}>
                            <Box sx={{ 
                                p: 1,
                                borderRadius: 0.5,
                                backgroundColor: index % 2 === 0 ? 
                                    alpha(theme.palette.primary.main, 0.02) : 
                                    'transparent',
                            }}>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary"
                                            sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                                        >
                                            {detail.label}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <Box sx={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    color: theme.palette.primary.dark,
                                                    wordBreak: 'break-all',
                                                    fontSize: '0.8125rem',
                                                    lineHeight: 1.3
                                                }}
                                            >
                                                {detail.value}
                                            </Typography>
                                            {detail.copyable && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCopy(detail.value, detail.label)}
                                                    sx={{
                                                        color: 'primary.main',
                                                        padding: 0.5,
                                                        '&:hover': {
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                        },
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Copy All Button */}
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => {
                            const allDetails = bankDetails
                                .map(detail => `${detail.label}: ${detail.value}`)
                                .join('\n');
                            handleCopy(allDetails, 'All bank details');
                        }}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 0.5,
                            py: 0.5,
                            px: 1.5,
                            fontSize: '0.75rem'
                        }}
                    >
                        Copy All Details
                    </Button>
                </Box>

                {/* Important Note */}
                <Box
                    sx={{
                        mt: 1.5,
                        p: 1,
                        borderRadius: 0.5,
                        backgroundColor: alpha(theme.palette.warning.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                    }}
                >
                    <Stack direction="row" spacing={0.5} alignItems="flex-start">
                        <WarningIcon color="warning" sx={{ fontSize: '0.875rem', mt: 0.125 }} />
                        <Box>
                            <Typography variant="caption" fontWeight={500} color="warning.dark">
                                Important:
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Clients from India, please deposit to the specific Indian bank account provided separately.
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </Paper>

            {/* Contact Support */}
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.info.main}`,
                    backgroundColor: alpha(theme.palette.info.main, 0.05)
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <MailIcon color="info" fontSize="small" />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Need Support?
                        </Typography>
                        <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            <Box sx={{ 
                                p: 1,
                                borderRadius: 0.5,
                                backgroundColor: 'white',
                                border: `1px solid ${theme.palette.divider}`,
                                flexGrow: 1
                            }}>
                                <Typography 
                                    variant="body2" 
                                    fontWeight={500}
                                    sx={{ 
                                        color: theme.palette.info.dark,
                                        wordBreak: 'break-all',
                                        fontSize: '0.8125rem'
                                    }}
                                >
                                    {BRAND_EMAIL}
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={handleCopyEmail}
                                sx={{
                                    color: 'info.main',
                                    padding: 0.5,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.info.main, 0.1)
                                    }
                                }}
                            >
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Stack>
            </Paper>
        </Stack>
    );
}

export default BankDepositDetails;