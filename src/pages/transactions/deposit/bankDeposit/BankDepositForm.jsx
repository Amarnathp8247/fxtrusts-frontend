import { 
    Button, 
    Stack, 
    Typography, 
    TextField, 
    InputLabel, 
    Box, 
    Paper,
    CircularProgress,
    Alert,
    Divider,
    useTheme,
    alpha,
    IconButton
} from '@mui/material'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { setNotification } from '../../../../globalState/notificationState/notificationStateSlice';
import { useBankDepositMutation } from '../../../../globalState/userState/userStateApis';
import { bankDepositFormschema } from './bankDepositFormschema';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotesIcon from '@mui/icons-material/Notes';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import { useState } from 'react';
import styled from '@emotion/styled';

// Styled file upload button - hidden visually but accessible
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function BankDepositForm() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');

    const defaultValues = {
        transactionReference: "",
        amount: "",
        remark: "",
        image: null,
    };

    const { 
        register, 
        handleSubmit, 
        reset, 
        watch, 
        setValue, 
        formState: { errors, isValid } 
    } = useForm({
        resolver: zodResolver(bankDepositFormschema),
        defaultValues,
        mode: 'onChange'
    });

    const [bankDeposit, { isLoading, isError, error }] = useBankDepositMutation();

    const onSubmit = async (data) => {
        try {
            const response = await bankDeposit(data).unwrap();
            if (response?.status) {
                dispatch(setNotification({ 
                    open: true, 
                    message: "Deposit request submitted successfully!", 
                    severity: "success" 
                }));
                reset(defaultValues);
                setSelectedFile(null);
                setFileName('');
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

    const amount = watch("amount");
    const formattedAmount = amount ? parseFloat(amount).toFixed(2) : "0.00";

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                dispatch(setNotification({
                    open: true,
                    message: "File size should be less than 5MB",
                    severity: "error"
                }));
                return;
            }

            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                dispatch(setNotification({
                    open: true,
                    message: "Only JPEG, PNG, and PDF files are allowed",
                    severity: "error"
                }));
                return;
            }

            setSelectedFile(URL.createObjectURL(file));
            setFileName(file.name);
            setValue("image", file, { shouldValidate: true });
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileName('');
        setValue("image", null, { shouldValidate: true });
    };

    const getFileIcon = (fileName) => {
        if (fileName?.toLowerCase().endsWith('.pdf')) {
            return <PictureAsPdfIcon color="error" />;
        }
        return <ImageIcon color="primary" />;
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Deposit Request Form
            </Typography>

            {/* Error Alert */}
            {isError && error?.data?.message && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        '& .MuiAlert-icon': { alignItems: 'center' }
                    }}
                    icon={<ErrorOutlineIcon />}
                >
                    {error.data.message}
                </Alert>
            )}

            <Stack
                component={"form"}
                onSubmit={handleSubmit(onSubmit)}
                spacing={3}
            >
                {/* Amount Field */}
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <AttachMoneyIcon color="primary" fontSize="small" />
                        <InputLabel 
                            sx={{ 
                                fontWeight: 500,
                                color: 'text.primary',
                                fontSize: '0.875rem'
                            }}
                        >
                            Amount (USD) *
                        </InputLabel>
                    </Stack>
                    <TextField 
                        {...register("amount")}
                        size='small' 
                        fullWidth 
                        placeholder="Enter amount in USD" 
                        variant="outlined"
                        type="number"
                        inputProps={{ 
                            min: 0,
                            step: "0.01"
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                            }
                        }}
                        error={!!errors.amount}
                        helperText={errors.amount?.message}
                    />
                </Box>

                {/* File Upload Section */}
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <UploadFileIcon color="primary" fontSize="small" />
                        <InputLabel 
                            sx={{ 
                                fontWeight: 500,
                                color: 'text.primary',
                                fontSize: '0.875rem'
                            }}
                        >
                            Upload Deposit Proof *
                        </InputLabel>
                    </Stack>

                    {/* File Upload Button */}
                    {!selectedFile ? (
                        <Box>
                            <Button
                                component="label"
                                variant="outlined"
                                fullWidth
                                sx={{
                                    py: 2,
                                    borderRadius: 2,
                                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                    '&:hover': {
                                        border: `2px dashed ${theme.palette.primary.main}`,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                    }
                                }}
                            >
                                <Stack alignItems="center" spacing={1}>
                                    <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            Click to upload
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Supported formats: JPG, PNG, PDF (Max 5MB)
                                        </Typography>
                                    </Box>
                                </Stack>
                                <VisuallyHiddenInput 
                                    type="file" 
                                    onChange={handleFileChange}
                                    accept="image/jpeg,image/png,application/pdf"
                                />
                            </Button>
                        </Box>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                backgroundColor: alpha(theme.palette.success.main, 0.05),
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                {getFileIcon(fileName)}
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography 
                                        variant="body2" 
                                        fontWeight={500}
                                        noWrap
                                    >
                                        {fileName}
                                    </Typography>
                                    <Typography variant="caption" color="success.main">
                                        File uploaded successfully
                                    </Typography>
                                </Box>
                                <IconButton
                                    size="small"
                                    onClick={handleRemoveFile}
                                    sx={{
                                        color: 'error.main',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.error.main, 0.1)
                                        }
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>
                        </Paper>
                    )}

                    {errors.image && (
                        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                            {errors.image.message}
                        </Typography>
                    )}
                </Box>

                {/* Transaction Reference */}
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <ReceiptIcon color="primary" fontSize="small" />
                        <InputLabel 
                            sx={{ 
                                fontWeight: 500,
                                color: 'text.primary',
                                fontSize: '0.875rem'
                            }}
                        >
                            Transaction Reference *
                        </InputLabel>
                    </Stack>
                    <TextField 
                        {...register("transactionReference")} 
                        size='small' 
                        fullWidth 
                        placeholder="Enter bank transaction reference number" 
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                            }
                        }}
                        error={!!errors.transactionReference}
                        helperText={errors.transactionReference?.message}
                    />
                </Box>

                {/* Remark Field */}
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <NotesIcon color="primary" fontSize="small" />
                        <InputLabel 
                            sx={{ 
                                fontWeight: 500,
                                color: 'text.primary',
                                fontSize: '0.875rem'
                            }}
                        >
                            Remarks *
                        </InputLabel>
                    </Stack>
                    <TextField
                        {...register("remark")}
                        size='small' 
                        multiline 
                        rows={3}
                        fullWidth 
                        placeholder="Enter any additional notes or remarks about this deposit..."
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                            }
                        }}
                        error={!!errors.remark}
                        helperText={errors.remark?.message}
                    />
                </Box>

                {/* Summary Card */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.03),
                        mt: 2
                    }}
                >
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>
                        Deposit Summary
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" color="text.secondary">
                            Amount to be deposited:
                        </Typography>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" fontWeight={700} color="primary.main">
                                ${formattedAmount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {amount ? "USD" : "Enter amount above"}
                            </Typography>
                        </Box>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Funds will be credited to your account within 1-3 business days after verification.
                    </Typography>
                </Paper>

                {/* Submit Button */}
                <Box sx={{ mt: 2 }}>
                    <Button
                        type='submit'
                        variant='contained'
                        disabled={isLoading || !isValid}
                        fullWidth
                        size="large"
                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': {
                                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                                transform: 'translateY(-1px)'
                            },
                            '&:disabled': {
                                opacity: 0.7
                            }
                        }}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Deposit Request'}
                    </Button>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                        By submitting, you confirm that you have deposited the exact amount to the provided bank account.
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}

export default BankDepositForm;