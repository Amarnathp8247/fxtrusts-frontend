import { 
    Button, 
    Stack, 
    Typography, 
    InputAdornment, 
    InputLabel, 
    OutlinedInput, 
    TextField, 
    Box, 
    Skeleton,
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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Selector from '../../../../components/Selector';
import { transferFormSchema } from './transferFormSchema';
import { useGetUserDataQuery, useMetaDepositMutation, useMetaWithdrawMutation } from '../../../../globalState/userState/userStateApis';
import { setNotification } from '../../../../globalState/notificationState/notificationStateSlice';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { useState } from 'react';

function TransferForm() {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width:600px)');

    // State for popover
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState('');

    const defaultValues = {
        mt5Login: '',
        to: '',
        type: "2",
        amount: ''
    };

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(transferFormSchema),
        defaultValues,
        mode: 'onChange'
    });

    const fromAccountValue = watch("mt5Login");
    const amount = watch("amount");
    const formattedAmount = amount ? parseFloat(amount).toFixed(2) : "0.00";

    const { token } = useSelector((state) => state.auth);
    const { data, isLoading: userDataLoading, refetch } = useGetUserDataQuery(undefined, {
        skip: !token,
        refetchOnMountOrArgChange: true,
    });

    const walletBalance = data?.data?.assetData?.mainBalance;
    const MT5IDs = userDataLoading ? [] : (data?.data?.mt5AccountList)?.filter(item => item?.accountType == "REAL")?.map(item => item?.Login);

    const [metaDeposit, { isLoading: metaDepositLoading, isError: depositError, error: depositErrorData }] = useMetaDepositMutation();
    const [metaWithdraw, { isLoading: metaWithdrawLoading, isError: withdrawError, error: withdrawErrorData }] = useMetaWithdrawMutation();

    const handleBack = () => {
        navigate(-1);
    };

    const isLoading = metaDepositLoading || metaWithdrawLoading;
    const isError = depositError || withdrawError;
    const errorData = depositErrorData || withdrawErrorData;

    // Popover handlers
    const handleInfoClick = (event, content) => {
        setAnchorEl(event.currentTarget);
        setPopoverContent(content);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const popoverId = open ? 'transfer-form-popover' : undefined;

    // Content for info popups
    const headerInfoContent = `• Internal transfers are processed instantly
• No fees for transfers between your accounts
• Available 24/7 for your convenience
• All transfers are secured with encryption`;

    const fromAccountInfoContent = `• Select the account you want to transfer FROM
• Choose from your MT5 trading accounts or Wallet
• Make sure you have sufficient balance
• Transfers are instant and free`;

    const toAccountInfoContent = `• Select the account you want to transfer TO
• Choose from your MT5 trading accounts or Wallet
• Cannot transfer to the same account
• All transfers are processed in real-time`;

    const amountInfoContent = `• Enter the amount you want to transfer
• Minimum transfer amount: $10
• Maximum transfer amount depends on account balance
• Amount should be in USD`;

    const summaryInfoContent = `• Transfer amount: ${formattedAmount} USD
• Processing time: Instant
• Fees: $0.00
• Security: Encrypted transfer`;

    // Theme-aware colors - Lighter borders
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

    const onSubmit = async (data) => {
        const mt5LoginID = (data?.mt5Login).includes("Wallet");
        const finalData = {
            mt5Login: mt5LoginID ? data?.to : data?.mt5Login,
            type: data?.type,
            amount: data?.amount
        };
        try {
            const response = fromAccountValue.includes("Wallet") 
                ? await metaDeposit(finalData).unwrap() 
                : await metaWithdraw(finalData).unwrap();
            
            if (response?.status) {
                dispatch(setNotification({ 
                    open: true, 
                    message: "Transfer completed successfully!", 
                    severity: "success" 
                }));
                reset(defaultValues);
                refetch();
            }
        } catch (error) {
            if (!error?.data?.status) {
                dispatch(setNotification({ 
                    open: true, 
                    message: error?.data?.message || "Failed to complete transfer. Please try again.", 
                    severity: "error" 
                }));
            }
        }
    };

    // Format account options
    const fromAccountOptions = userDataLoading 
        ? [] 
        : [...MT5IDs, `Wallet (${walletBalance ? walletBalance.toFixed(2) : '0.00'} USD)`];
    
    const toAccountOptions = userDataLoading ? [] : [...MT5IDs, "Wallet"];

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
                                    <SwapHorizIcon sx={{ 
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
                                            Internal Transfer
                                        </Typography>
                                        <Tooltip title="Transfer information">
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
                                        Transfer funds between your accounts instantly
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
                                Transfer Details
                            </Typography>
                            <Stack direction="row" spacing={0.5}>
                                <Chip
                                    label="Instant"
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    icon={<AccessTimeIcon fontSize="small" />}
                                    sx={{ 
                                        fontSize: '0.65rem',
                                        height: 22,
                                        borderColor: chipBorderColor,
                                        color: theme.palette.mode === 'dark' ? 'success.light' : 'success.dark',
                                        backgroundColor: chipBgColor,
                                        '& .MuiChip-icon': {
                                            color: theme.palette.mode === 'dark' ? 'success.light' : 'success.main'
                                        }
                                    }}
                                />
                                <Chip
                                    label="No fees"
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    icon={<MoneyOffIcon fontSize="small" />}
                                    sx={{ 
                                        fontSize: '0.65rem',
                                        height: 22,
                                        borderColor: chipBorderColor,
                                        color: theme.palette.mode === 'dark' ? 'success.light' : 'success.dark',
                                        backgroundColor: chipBgColor,
                                        '& .MuiChip-icon': {
                                            color: theme.palette.mode === 'dark' ? 'success.light' : 'success.main'
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
                            {isError && errorData?.data?.message && (
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        mb: 1.5,
                                        borderRadius: 1.2,
                                        '& .MuiAlert-icon': { alignItems: 'center' },
                                        bgcolor: theme.palette.mode === 'dark' 
                                            ? alpha(theme.palette.error.dark, 0.15)
                                            : undefined,
                                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                        color: theme.palette.mode === 'dark' ? 'error.light' : 'error.dark',
                                        fontSize: isMobile ? '0.8rem' : '0.875rem'
                                    }}
                                    icon={<ErrorOutlineIcon fontSize="small" />}
                                >
                                    {errorData.data.message}
                                </Alert>
                            )}

                            <Stack
                                component={"form"}
                                onSubmit={handleSubmit(onSubmit)}
                                spacing={2}
                                sx={{ pb: 1 }}
                            >
                                {/* From Account */}
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
                                            From Account *
                                        </InputLabel>
                                        <Tooltip title="From account information">
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handleInfoClick(e, fromAccountInfoContent)}
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
                                    {userDataLoading ? (
                                        <Skeleton 
                                            variant="rectangular" 
                                            height={isMobile ? 38 : 42} 
                                            sx={{ 
                                                borderRadius: 1.2,
                                                backgroundColor: theme.palette.mode === 'dark' 
                                                    ? alpha(theme.palette.grey[800], 0.3)
                                                    : alpha(theme.palette.grey[300], 0.3)
                                            }} 
                                        />
                                    ) : (
                                        <Selector
                                            items={fromAccountOptions}
                                            value={watch("mt5Login")}
                                            onChange={(e) => setValue("mt5Login", e.target.value, { shouldValidate: true })}
                                            shouldBeFullWidth={true}
                                            disableItem={watch("to")}
                                            size="small"
                                            sx={{
                                                borderRadius: 1.2,
                                                '& .MuiSelect-select': {
                                                    py: isMobile ? 0.8 : 1.2,
                                                    fontSize: isMobile ? '0.85rem' : '0.9rem',
                                                    backgroundColor: theme.palette.background.paper,
                                                    color: 'text.primary',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: borderColor,
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.mode === 'dark' 
                                                        ? theme.palette.primary.light
                                                        : theme.palette.primary.main,
                                                }
                                            }}
                                        />
                                    )}
                                    {errors.mt5Login && (
                                        <Typography color="error" variant="caption" sx={{ mt: 0.3, display: 'block', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                            {errors.mt5Login.message}
                                        </Typography>
                                    )}
                                </Box>

                                {/* To Account */}
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
                                            To Account *
                                        </InputLabel>
                                        <Tooltip title="To account information">
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handleInfoClick(e, toAccountInfoContent)}
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
                                    {userDataLoading ? (
                                        <Skeleton 
                                            variant="rectangular" 
                                            height={isMobile ? 38 : 42} 
                                            sx={{ 
                                                borderRadius: 1.2,
                                                backgroundColor: theme.palette.mode === 'dark' 
                                                    ? alpha(theme.palette.grey[800], 0.3)
                                                    : alpha(theme.palette.grey[300], 0.3)
                                            }} 
                                        />
                                    ) : (
                                        <Selector
                                            items={toAccountOptions}
                                            value={watch("to")}
                                            onChange={(e) => setValue("to", e.target.value, { shouldValidate: true })}
                                            shouldBeFullWidth={true}
                                            disableItem={watch("mt5Login")}
                                            size="small"
                                            sx={{
                                                borderRadius: 1.2,
                                                '& .MuiSelect-select': {
                                                    py: isMobile ? 0.8 : 1.2,
                                                    fontSize: isMobile ? '0.85rem' : '0.9rem',
                                                    backgroundColor: theme.palette.background.paper,
                                                    color: 'text.primary',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: borderColor,
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.mode === 'dark' 
                                                        ? theme.palette.primary.light
                                                        : theme.palette.primary.main,
                                                }
                                            }}
                                        />
                                    )}
                                    {errors.to && (
                                        <Typography color="error" variant="caption" sx={{ mt: 0.3, display: 'block', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                            {errors.to.message}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Amount Field */}
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
                                    <OutlinedInput
                                        {...register("amount")}
                                        endAdornment={<InputAdornment position="end">USD</InputAdornment>}
                                        fullWidth
                                        placeholder="0.00"
                                        variant="outlined"
                                        type="number"
                                        inputProps={{ 
                                            min: 0,
                                            step: "0.01"
                                        }}
                                        sx={{
                                            borderRadius: 1.2,
                                            fontWeight: "bold",
                                            fontSize: isMobile ? "1rem" : "1.1rem",
                                            '& .MuiOutlinedInput-input': {
                                                py: isMobile ? 0.8 : 1.2,
                                                backgroundColor: theme.palette.background.paper,
                                                color: 'text.primary',
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: borderColor,
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.palette.mode === 'dark' 
                                                    ? theme.palette.primary.light
                                                    : theme.palette.primary.main,
                                            },
                                            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.palette.error.main,
                                            }
                                        }}
                                        error={!!errors.amount}
                                    />
                                    {errors.amount && (
                                        <Typography color="error" variant="caption" sx={{ mt: 0.3, display: 'block', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                            {errors.amount.message}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Hidden Type Field */}
                                <Box sx={{ display: "none" }}>
                                    <TextField
                                        {...register("type")}
                                        size='small' 
                                        fullWidth 
                                        variant="outlined" 
                                    />
                                </Box>

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
                                        {isLoading ? 'Processing...' : 'Complete Transfer'}
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
                                Transfer Summary
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
                                    Transfer Amount
                                </Typography>
                                <Typography variant={isMobile ? "h4" : "h3"} fontWeight={700} color="primary.main">
                                    ${formattedAmount}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}>
                                    {amount ? "USD" : "Enter amount"}
                                </Typography>
                            </Box>

                            {/* Transfer Details */}
                            <Box sx={{ mb: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.2, fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                                    Details
                                </Typography>
                                <Stack spacing={1.2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                                            From:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ 
                                            textAlign: 'right', 
                                            maxWidth: '60%',
                                            fontSize: isMobile ? '0.8rem' : '0.85rem',
                                            wordBreak: 'break-word'
                                        }}>
                                            {fromAccountValue || 'Not selected'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                                            To:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ 
                                            textAlign: 'right', 
                                            maxWidth: '60%',
                                            fontSize: isMobile ? '0.8rem' : '0.85rem',
                                            wordBreak: 'break-word'
                                        }}>
                                            {watch("to") || 'Not selected'}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ borderColor: borderColor }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                                            Processing:
                                        </Typography>
                                        <Chip
                                            label="Instant"
                                            size="small"
                                            color="success"
                                            sx={{ 
                                                fontSize: '0.65rem',
                                                height: 22,
                                                backgroundColor: chipBgColor,
                                                border: `1px solid ${chipBorderColor}`,
                                                color: theme.palette.mode === 'dark' ? 'success.light' : 'success.dark',
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                                            Fees:
                                        </Typography>
                                        <Chip
                                            label="No fees"
                                            size="small"
                                            color="success"
                                            sx={{ 
                                                fontSize: '0.65rem',
                                                height: 22,
                                                backgroundColor: chipBgColor,
                                                border: `1px solid ${chipBorderColor}`,
                                                color: theme.palette.mode === 'dark' ? 'success.light' : 'success.dark',
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
                                            Important
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ 
                                            fontSize: isMobile ? '0.7rem' : '0.75rem', 
                                            lineHeight: 1.2 
                                        }}>
                                            Transfers are processed instantly with no fees. Minimum transfer amount is $10.
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
}

export default TransferForm;