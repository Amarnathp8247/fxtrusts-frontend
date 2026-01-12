import { 
    Button, 
    Stack, 
    Typography, 
    TextField, 
    InputLabel, 
    Box, 
    Paper, 
    useTheme,
    alpha,
    CircularProgress,
    Alert,
    Divider,
    Container,
    Grid,
    Card,
    Chip,
    IconButton,
    Tooltip,
    Popover,
    useMediaQuery
} from '@mui/material'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { setNotification } from '../../../../globalState/notificationState/notificationStateSlice';
import { useBankWithdrawMutation } from '../../../../globalState/userState/userStateApis';
import { getWithdrawalSchema } from './bankWithdrawalFormSchema';
import { useGetUserDataQuery } from '../../../../globalState/userState/userStateApis';
import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NotesIcon from '@mui/icons-material/Notes';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import GppGoodIcon from '@mui/icons-material/GppGood';

function BankWithdrawalForm() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isMobile = useMediaQuery('(max-width:600px)');
    
    // State for popover
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState('');

    const amountParam = searchParams.get("amount");
    const remarkParam = searchParams.get("remark");
    const isAmountAndRemarkSubmittedParam = searchParams.get("isAmountAndRemarkSubmitted") || false;

    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const { refetch, data } = useGetUserDataQuery(undefined, {
        skip: !token,
        refetchOnMountOrArgChange: true,
    });

    const securityMethod = data?.data?.userData?.securityMethods;

    const schema = useMemo(
        () => getWithdrawalSchema({ securityMethod, isAmountAndRemarkSubmittedParam }),
        [securityMethod, isAmountAndRemarkSubmittedParam]
    );

    const defaultValues = {
        amount: amountParam || "",
        code: "",
        remark: remarkParam || ""
    };

    const { 
        register, 
        handleSubmit, 
        reset, 
        watch, 
        formState: { errors, isValid } 
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues,
        mode: 'onChange'
    });

    const [bankWithdraw, { isLoading, isError, error }] = useBankWithdrawMutation();

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

    // Content for info popups
    const headerInfoContent = `• Bank withdrawals are processed within 1-3 business days
• Security verification required for all withdrawals
• Ensure your bank account details are up-to-date
• Minimum withdrawal amount may apply`;

    const amountInfoContent = `• Enter the amount you wish to withdraw
• Amount should be in USD
• Check available balance before withdrawal
• Processing time: 1-3 business days`;

    const remarkInfoContent = `• Add any notes for the withdrawal
• Purpose of withdrawal
• Bank account reference
• Any special instructions`;

    const codeInfoContent = securityMethod === "GOOGLE-AUTH" 
        ? `• Enter the 6-digit code from Google Authenticator
• Code refreshes every 30 seconds
• Ensure your device time is synchronized
• For enhanced security`
        : `• Enter the verification code sent to you
• Check your email or SMS
• Code is valid for 10 minutes
• Required for security verification`;

    const summaryInfoContent = `• Amount: ${watch("amount") || amountParam || "0.00"} USD
• Processing: 1-3 business days
• Security: ${securityMethod === "GOOGLE-AUTH" ? "Google Authenticator" : "Verification Code"}
• Status: Pending verification`;

    const handleBack = () => {
        navigate(-1);
    };

    const onSubmit = async (data) => {
        try {
            const finalData = !isAmountAndRemarkSubmittedParam ? data : { 
                amount: amountParam, 
                remark: remarkParam, 
                code: data?.code 
            };

            const response = await bankWithdraw(finalData).unwrap();
            if (response?.status) {
                if (!isAmountAndRemarkSubmittedParam && securityMethod !== "GOOGLE-AUTH") {
                    setSearchParams({ 
                        amount: data?.amount, 
                        remark: data?.remark, 
                        isAmountAndRemarkSubmitted: true 
                    });
                } else {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete("amount");
                    newParams.delete("remark");
                    newParams.delete("isAmountAndRemarkSubmitted");
                    setSearchParams(newParams);
                }
                dispatch(setNotification({ 
                    open: true, 
                    message: "Withdrawal request submitted successfully!", 
                    severity: "success" 
                }));
                reset(defaultValues);
                refetch();
            }
        } catch (error) {
            if (!error?.data?.status) {
                dispatch(setNotification({ 
                    open: true, 
                    message: error?.data?.message || "Failed to submit. Please try again.", 
                    severity: "error" 
                }));
            }
        }
    };

    const amount = watch("amount") || amountParam;
    const formattedAmount = amount ? parseFloat(amount).toFixed(2) : "0.00";

    // Theme-aware colors
    const borderColor = theme.palette.mode === 'dark' 
        ? alpha(theme.palette.divider, 0.08)
        : alpha(theme.palette.divider, 0.2);

    const cardBgColor = theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.98)
        : theme.palette.background.paper;

    const infoCardBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.info.dark, 0.15)
        : alpha(theme.palette.info.light, 0.08);

    const infoCardBorder = theme.palette.mode === 'dark'
        ? alpha(theme.palette.info.main, 0.2)
        : alpha(theme.palette.info.main, 0.15);

    const chipBgColor = theme.palette.mode === 'dark'
        ? alpha(theme.palette.success.main, 0.12)
        : alpha(theme.palette.success.main, 0.08);

    const chipBorderColor = theme.palette.mode === 'dark'
        ? alpha(theme.palette.success.main, 0.3)
        : alpha(theme.palette.success.main, 0.2);

    const warningCardBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.warning.dark, 0.1)
        : alpha(theme.palette.warning.light, 0.08);

    const warningCardBorder = theme.palette.mode === 'dark'
        ? alpha(theme.palette.warning.main, 0.2)
        : alpha(theme.palette.warning.main, 0.15);

    return (
        <Container maxWidth="lg" sx={{ 
            py: isMobile ? 1.5 : 3, 
            height: '100vh', 
            overflow: 'hidden',
            backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.background.default 
                : '#f8fafc',
            px: isMobile ? 1.5 : 3
        }}>
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
                        maxWidth: 300,
                        borderRadius: 2,
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0,0,0,0.6)'
                            : '0 8px 32px rgba(0,0,0,0.15)',
                        border: `1px solid ${borderColor}`,
                        bgcolor: theme.palette.background.paper,
                    }
                }}
            >
                <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                        Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', fontSize: '0.8rem' }}>
                        {popoverContent}
                    </Typography>
                </Stack>
            </Popover>

            {/* Main Layout */}
            <Box sx={{ 
                height: 'calc(100vh - 40px)', 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1.5 
            }}>
                {/* Header Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: isMobile ? 1.2 : 2,
                        borderRadius: 1.5,
                        border: `1px solid ${borderColor}`,
                        backgroundColor: cardBgColor,
                        boxShadow: 'none',
                        flexShrink: 0,
                    }}
                >
                    <Grid container alignItems="center" spacing={1.5}>
                        <Grid item xs={8} sm={9}>
                            <Stack direction="row" alignItems="center" spacing={1.2}>
                                <Box sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    borderRadius: 1.5, 
                                    bgcolor: theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.primary.main, 0.15)
                                        : alpha(theme.palette.primary.main, 0.08),
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    <AccountBalanceIcon sx={{ 
                                        color: theme.palette.primary.main,
                                        fontSize: isMobile ? '1.2rem' : '1.5rem'
                                    }} />
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography 
                                            variant={isMobile ? "h6" : "h5"} 
                                            fontWeight={600}
                                            color="text.primary"
                                        >
                                            Bank Withdrawal
                                        </Typography>
                                        <Tooltip title="Withdrawal information">
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handleInfoClick(e, headerInfoContent)}
                                                sx={{ 
                                                    color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
                                                    p: 0.3,
                                                    '&:hover': { 
                                                        bgcolor: theme.palette.mode === 'dark'
                                                            ? alpha(theme.palette.primary.main, 0.15)
                                                            : alpha(theme.palette.primary.main, 0.08)
                                                    }
                                                }}
                                            >
                                                <InfoIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Withdraw funds securely to your bank account
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={4} sm={3} sx={{ textAlign: 'right' }}>
                            <Button
                                variant="outlined"
                                size={isMobile ? "small" : "medium"}
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBack}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 1.2,
                                    px: isMobile ? 1.2 : 2,
                                    borderColor: borderColor,
                                    color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.secondary',
                                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        color: theme.palette.primary.main,
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.primary.main, 0.08)
                                            : 'transparent'
                                    }
                                }}
                            >
                                {isMobile ? '' : 'Back'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Security Method Info */}
                {securityMethod && (
                    <Alert 
                        severity={securityMethod === "GOOGLE-AUTH" ? "success" : "info"}
                        sx={{ 
                            borderRadius: 1.2,
                            border: `1px solid ${securityMethod === "GOOGLE-AUTH" 
                                ? alpha(theme.palette.success.main, 0.2)
                                : alpha(theme.palette.info.main, 0.2)
                            }`,
                            backgroundColor: securityMethod === "GOOGLE-AUTH"
                                ? alpha(theme.palette.success.main, 0.08)
                                : alpha(theme.palette.info.main, 0.08),
                            flexShrink: 0,
                        }}
                        icon={securityMethod === "GOOGLE-AUTH" ? <GppGoodIcon /> : <SecurityIcon />}
                    >
                        <Typography variant="caption">
                            {securityMethod === "GOOGLE-AUTH" 
                                ? "Using Google Authenticator for enhanced security. Please enter the 6-digit code from your authenticator app."
                                : "Verification code required for security. Check your email or SMS for the code."
                            }
                        </Typography>
                    </Alert>
                )}

                {/* Main Content Area */}
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 1.5,
                    overflow: 'hidden'
                }}>
                    {/* Left Panel - Form */}
                    <Paper
                        elevation={0}
                        sx={{
                            flex: isMobile ? 1 : 2,
                            p: isMobile ? 1.2 : 2,
                            borderRadius: 1.5,
                            border: `1px solid ${borderColor}`,
                            backgroundColor: cardBgColor,
                            boxShadow: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            minHeight: isMobile ? '400px' : 'auto',
                        }}
                    >
                        {/* Header with Chips */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 2,
                            pb: 1.2,
                            borderBottom: `1px solid ${borderColor}`,
                            flexShrink: 0,
                        }}>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                                Withdrawal Details
                            </Typography>
                            <Stack direction="row" spacing={0.5}>
                                <Chip
                                    label={securityMethod === "GOOGLE-AUTH" ? "Google Auth" : "Code Required"}
                                    size="small"
                                    variant="outlined"
                                    color={securityMethod === "GOOGLE-AUTH" ? "success" : "warning"}
                                    icon={<SecurityIcon fontSize="small" />}
                                    sx={{ 
                                        fontSize: '0.65rem',
                                        height: 22,
                                        borderColor: securityMethod === "GOOGLE-AUTH" 
                                            ? chipBorderColor
                                            : alpha(theme.palette.warning.main, 0.3),
                                        color: securityMethod === "GOOGLE-AUTH" 
                                            ? (theme.palette.mode === 'dark' ? 'success.light' : 'success.dark')
                                            : (theme.palette.mode === 'dark' ? 'warning.light' : 'warning.dark'),
                                        backgroundColor: securityMethod === "GOOGLE-AUTH" 
                                            ? chipBgColor
                                            : alpha(theme.palette.warning.main, 0.08),
                                        '& .MuiChip-icon': {
                                            color: securityMethod === "GOOGLE-AUTH" 
                                                ? (theme.palette.mode === 'dark' ? 'success.light' : 'success.main')
                                                : (theme.palette.mode === 'dark' ? 'warning.light' : 'warning.main')
                                        }
                                    }}
                                />
                                <Chip
                                    label="1-3 days"
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                    icon={<AccessTimeIcon fontSize="small" />}
                                    sx={{ 
                                        fontSize: '0.65rem',
                                        height: 22,
                                        borderColor: alpha(theme.palette.info.main, 0.3),
                                        color: theme.palette.mode === 'dark' ? 'info.light' : 'info.dark',
                                        backgroundColor: alpha(theme.palette.info.main, 0.08),
                                        '& .MuiChip-icon': {
                                            color: theme.palette.mode === 'dark' ? 'info.light' : 'info.main'
                                        }
                                    }}
                                />
                            </Stack>
                        </Box>

                        {/* Scrollable Form Content */}
                        <Box sx={{ 
                            flex: 1,
                            overflow: 'auto',
                            pr: isMobile ? 0.5 : 0,
                            '&::-webkit-scrollbar': {
                                width: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: borderColor,
                                borderRadius: '2px',
                            }
                        }}>
                            {/* Error Alert */}
                            {isError && error?.data?.message && (
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        mb: 1.5,
                                        borderRadius: 1.2,
                                        '& .MuiAlert-icon': { alignItems: 'center' },
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                        color: theme.palette.mode === 'dark' ? 'error.light' : 'error.dark',
                                        fontSize: isMobile ? '0.8rem' : '0.875rem'
                                    }}
                                    icon={<ErrorOutlineIcon fontSize="small" />}
                                >
                                    {error.data.message}
                                </Alert>
                            )}

                            <Stack
                                component={"form"}
                                onSubmit={handleSubmit(onSubmit)}
                                spacing={2}
                                sx={{ pb: 1 }}
                            >
                                {/* Amount Field */}
                                {(securityMethod === "GOOGLE-AUTH" || !isAmountAndRemarkSubmittedParam) && (
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                                            <InputLabel 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    color: 'text.primary',
                                                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                                                    m: 0
                                                }}
                                            >
                                                Amount (USD) *
                                            </InputLabel>
                                            <Tooltip title="Amount information">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={(e) => handleInfoClick(e, amountInfoContent)}
                                                    sx={{ 
                                                        color: theme.palette.mode === 'dark' ? 'info.light' : 'info.main',
                                                        p: 0.3,
                                                        '&:hover': { 
                                                            bgcolor: theme.palette.mode === 'dark'
                                                                ? alpha(theme.palette.info.main, 0.15)
                                                                : alpha(theme.palette.info.main, 0.08)
                                                        }
                                                    }}
                                                >
                                                    <InfoIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <TextField 
                                            {...register("amount")}
                                            size='small' 
                                            fullWidth 
                                            placeholder="Enter withdrawal amount" 
                                            variant="outlined"
                                            type="number"
                                            inputProps={{ 
                                                min: 0,
                                                step: "0.01"
                                            }}
                                            sx={{
                                                borderRadius: 1.2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1.2,
                                                }
                                            }}
                                            error={!!errors.amount}
                                            helperText={errors.amount?.message}
                                        />
                                    </Box>
                                )}

                                {/* Remark Field */}
                                {(securityMethod === "GOOGLE-AUTH" || !isAmountAndRemarkSubmittedParam) && (
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                                            <InputLabel 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    color: 'text.primary',
                                                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                                                    m: 0
                                                }}
                                            >
                                                Remarks *
                                            </InputLabel>
                                            <Tooltip title="Remarks information">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={(e) => handleInfoClick(e, remarkInfoContent)}
                                                    sx={{ 
                                                        color: theme.palette.mode === 'dark' ? 'info.light' : 'info.main',
                                                        p: 0.3,
                                                        '&:hover': { 
                                                            bgcolor: theme.palette.mode === 'dark'
                                                                ? alpha(theme.palette.info.main, 0.15)
                                                                : alpha(theme.palette.info.main, 0.08)
                                                        }
                                                    }}
                                                >
                                                    <InfoIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <TextField
                                            {...register("remark")}
                                            size='small' 
                                            multiline 
                                            rows={isMobile ? 2 : 3}
                                            fullWidth 
                                            placeholder="Enter any notes or remarks about this withdrawal..."
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 1.2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1.2,
                                                }
                                            }}
                                            error={!!errors.remark}
                                            helperText={errors.remark?.message}
                                        />
                                    </Box>
                                )}

                                {/* Code Field */}
                                {(securityMethod === "GOOGLE-AUTH" || isAmountAndRemarkSubmittedParam) && (
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                                            <InputLabel 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    color: 'text.primary',
                                                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                                                    m: 0
                                                }}
                                            >
                                                {securityMethod === "GOOGLE-AUTH" ? "Google Authenticator Code" : "Verification Code"} *
                                            </InputLabel>
                                            <Tooltip title="Code information">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={(e) => handleInfoClick(e, codeInfoContent)}
                                                    sx={{ 
                                                        color: theme.palette.mode === 'dark' ? 'info.light' : 'info.main',
                                                        p: 0.3,
                                                        '&:hover': { 
                                                            bgcolor: theme.palette.mode === 'dark'
                                                                ? alpha(theme.palette.info.main, 0.15)
                                                                : alpha(theme.palette.info.main, 0.08)
                                                        }
                                                    }}
                                                >
                                                    <InfoIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                        <TextField 
                                            {...register("code")}
                                            size='small' 
                                            fullWidth 
                                            placeholder={`Enter ${securityMethod === "GOOGLE-AUTH" ? "6-digit Google Authenticator code" : "verification code"}`} 
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 1.2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1.2,
                                                }
                                            }}
                                            error={!!errors.code}
                                            helperText={errors.code?.message}
                                        />
                                    </Box>
                                )}

                                {/* Submit Button */}
                                <Box sx={{ mt: 0.5, flexShrink: 0 }}>
                                    <Button
                                        type='submit'
                                        variant='contained'
                                        disabled={isLoading || !isValid}
                                        fullWidth
                                        size={isMobile ? "medium" : "large"}
                                        startIcon={isLoading ? <CircularProgress size={isMobile ? 16 : 20} color="inherit" /> : <CheckCircleIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 1.2,
                                            py: isMobile ? 0.8 : 1.2,
                                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                                            fontWeight: 600,
                                            backgroundColor: theme.palette.mode === 'dark'
                                                ? theme.palette.primary.dark
                                                : theme.palette.primary.main,
                                            boxShadow: theme.palette.mode === 'dark'
                                                ? '0 2px 12px rgba(0,0,0,0.3)'
                                                : '0 1px 6px rgba(0,0,0,0.1)',
                                            '&:hover': {
                                                backgroundColor: theme.palette.mode === 'dark'
                                                    ? theme.palette.primary.main
                                                    : theme.palette.primary.dark,
                                                boxShadow: theme.palette.mode === 'dark'
                                                    ? '0 4px 16px rgba(0,0,0,0.4)'
                                                    : '0 2px 8px rgba(0,0,0,0.15)',
                                            },
                                            '&:disabled': {
                                                opacity: 0.6,
                                                backgroundColor: theme.palette.mode === 'dark'
                                                    ? alpha(theme.palette.primary.main, 0.3)
                                                    : alpha(theme.palette.primary.main, 0.5)
                                            }
                                        }}
                                    >
                                        {isLoading ? 'Processing...' : 'Submit Withdrawal Request'}
                                    </Button>
                                </Box>
                            </Stack>
                        </Box>
                    </Paper>

                    {/* Right Panel - Summary */}
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            p: isMobile ? 1.2 : 2,
                            borderRadius: 1.5,
                            border: `1px solid ${borderColor}`,
                            backgroundColor: cardBgColor,
                            boxShadow: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            minHeight: isMobile ? '300px' : 'auto',
                        }}
                    >
                        {/* Summary Header */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: 1.5,
                            pb: 1.2,
                            borderBottom: `1px solid ${borderColor}`,
                            flexShrink: 0,
                        }}>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                                Withdrawal Summary
                            </Typography>
                            <Tooltip title="Summary information">
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleInfoClick(e, summaryInfoContent)}
                                    sx={{ 
                                        color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
                                        p: 0.3,
                                        '&:hover': { 
                                            bgcolor: theme.palette.mode === 'dark'
                                                ? alpha(theme.palette.primary.main, 0.15)
                                                : alpha(theme.palette.primary.main, 0.08)
                                        }
                                    }}
                                >
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Scrollable Summary Content */}
                        <Box sx={{ 
                            flex: 1,
                            overflow: 'auto',
                            pr: isMobile ? 0.5 : 0,
                            '&::-webkit-scrollbar': {
                                width: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: borderColor,
                                borderRadius: '2px',
                            }
                        }}>
                            {/* Amount Display */}
                            <Box sx={{ 
                                mb: 1.5,
                                p: 1.2,
                                borderRadius: 1.2,
                                bgcolor: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.primary.dark, 0.08)
                                    : alpha(theme.palette.primary.light, 0.05),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                textAlign: 'center'
                            }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3, display: 'block', fontSize: isMobile ? '0.75rem' : '0.8rem' }}>
                                    Withdrawal Amount
                                </Typography>
                                <Typography variant={isMobile ? "h4" : "h3"} fontWeight={700} color="primary.main">
                                    ${formattedAmount}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}>
                                    {amount ? "USD" : "Enter amount"}
                                </Typography>
                            </Box>

                            {/* Withdrawal Details */}
                            <Box sx={{ mb: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.2, fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                                    Details
                                </Typography>
                                <Stack spacing={1.2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                                            Security Method:
                                        </Typography>
                                        <Chip
                                            label={securityMethod === "GOOGLE-AUTH" ? "Google Auth" : "Email/SMS"}
                                            size="small"
                                            color={securityMethod === "GOOGLE-AUTH" ? "success" : "info"}
                                            sx={{ 
                                                fontSize: '0.65rem',
                                                height: 22,
                                                backgroundColor: securityMethod === "GOOGLE-AUTH" 
                                                    ? chipBgColor
                                                    : alpha(theme.palette.info.main, 0.08),
                                                border: `1px solid ${securityMethod === "GOOGLE-AUTH" 
                                                    ? chipBorderColor
                                                    : alpha(theme.palette.info.main, 0.3)
                                                }`,
                                                color: securityMethod === "GOOGLE-AUTH" 
                                                    ? (theme.palette.mode === 'dark' ? 'success.light' : 'success.dark')
                                                    : (theme.palette.mode === 'dark' ? 'info.light' : 'info.dark'),
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                                            Remarks:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ 
                                            textAlign: 'right', 
                                            maxWidth: '60%',
                                            fontSize: isMobile ? '0.8rem' : '0.85rem',
                                            wordBreak: 'break-word'
                                        }}>
                                            {watch("remark") || remarkParam || 'Not provided'}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ borderColor: borderColor }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                                            Processing:
                                        </Typography>
                                        <Chip
                                            label="1-3 days"
                                            size="small"
                                            color="info"
                                            sx={{ 
                                                fontSize: '0.65rem',
                                                height: 22,
                                                backgroundColor: alpha(theme.palette.info.main, 0.08),
                                                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                                color: theme.palette.mode === 'dark' ? 'info.light' : 'info.dark',
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                                            Status:
                                        </Typography>
                                        <Chip
                                            label="Pending"
                                            size="small"
                                            color="warning"
                                            sx={{ 
                                                fontSize: '0.65rem',
                                                height: 22,
                                                backgroundColor: alpha(theme.palette.warning.main, 0.08),
                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                                color: theme.palette.mode === 'dark' ? 'warning.light' : 'warning.dark',
                                            }}
                                        />
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Information Card */}
                            <Card
                                sx={{
                                    p: 1,
                                    borderRadius: 1.2,
                                    backgroundColor: infoCardBg,
                                    border: `1px solid ${infoCardBorder}`,
                                    mb: 1.5,
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'flex-start' }}>
                                    <i 
                                        style={{ 
                                            fontSize: isMobile ? '0.85rem' : '0.9rem', 
                                            color: theme.palette.mode === 'dark' ? 'info.light' : 'info.main',
                                            fontWeight: 'bold',
                                            flexShrink: 0,
                                            marginTop: '2px'
                                        }}
                                    >
                                        ⓘ
                                    </i>
                                    <Box>
                                        <Typography variant="caption" fontWeight={500} color="text.primary" sx={{ 
                                            mb: 0.2, 
                                            display: 'block',
                                            fontSize: isMobile ? '0.75rem' : '0.8rem'
                                        }}>
                                            Important Information
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ 
                                            fontSize: isMobile ? '0.7rem' : '0.75rem', 
                                            lineHeight: 1.2 
                                        }}>
                                            Funds will be processed within 1-3 business days after verification. Make sure your bank account details are correct.
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>

                            {/* Security Note */}
                            <Card
                                sx={{
                                    p: 1,
                                    borderRadius: 1.2,
                                    backgroundColor: warningCardBg,
                                    border: `1px solid ${warningCardBorder}`,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                    fontSize: isMobile ? '0.7rem' : '0.75rem', 
                                    lineHeight: 1.2 
                                }}>
                                    <i style={{ 
                                        marginRight: '4px',
                                        color: theme.palette.mode === 'dark' ? 'warning.light' : 'warning.main'
                                    }}>
                                        ⚠️
                                    </i>
                                    By submitting, you confirm this withdrawal request to your registered bank account. Ensure all details are accurate.
                                </Typography>
                            </Card>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
}

export default BankWithdrawalForm;