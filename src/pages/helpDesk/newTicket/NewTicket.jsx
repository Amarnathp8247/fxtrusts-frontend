import { 
    Button, 
    Stack, 
    Typography, 
    TextField, 
    Container, 
    Box, 
    Paper, 
    alpha, 
    useTheme,
    FormControl,
    MenuItem,
    Select,
    InputLabel,
    FormHelperText
} from '@mui/material'
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useCreateSupportTicketMutation } from '../../../globalState/supportState/supportStateApis';
import { newTicketSchema } from './newTicketSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { setNotification } from "../../../globalState/notificationState/notificationStateSlice"
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import TitleIcon from '@mui/icons-material/Title';
import { useState } from 'react';

function NewTicket() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const dispatch = useDispatch();

    const defaultValues = {
        subject: "",
        priority: "",
        message: ""
    };

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(newTicketSchema),
        defaultValues,
    });

    const [createSupportTicket, { isLoading }] = useCreateSupportTicketMutation();

    const onSubmit = async (data) => {
        try {
            const response = await createSupportTicket(data).unwrap();
            if (response?.status) {
                dispatch(setNotification({ 
                    open: true, 
                    message: response?.message, 
                    severity: "success" 
                }));
                reset(defaultValues);
            }
        } catch (error) {
            if (!error?.data?.status) {
                dispatch(setNotification({ 
                    open: true, 
                    message: error?.data?.message || "Failed to submit. Please try again later.", 
                    severity: "error" 
                }));
            }
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'LOW': return 'success.main';
            case 'MEDIUM': return 'warning.main';
            case 'HIGH': return 'error.main';
            default: return 'text.secondary';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ 
            py: { xs: 2, md: 3 },
            minHeight: 'calc(100vh - 100px)',
            display: 'flex',
            alignItems: 'center'
        }}>
            <Box sx={{ width: '100%' }}>
                <Stack 
                    direction={{ xs: 'column', lg: 'row' }} 
                    spacing={{ xs: 3, lg: 4 }}
                    alignItems="flex-start"
                >
                    {/* Left Side - Form */}
                    <Paper 
                        elevation={0}
                        sx={{
                            flex: 1,
                            p: { xs: 3, md: 4 },
                            borderRadius: '16px',
                            backgroundColor: 'background.paper',
                            border: `1px solid ${alpha(
                                isDarkMode ? theme.palette.divider : theme.palette.grey[200], 
                                0.5
                            )}`,
                            boxShadow: isDarkMode 
                                ? '0 8px 32px rgba(0,0,0,0.24)' 
                                : '0 8px 32px rgba(0,0,0,0.08)',
                        }}
                    >
                        <Box 
                            component="form" 
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Stack spacing={3}>
                                {/* Header inside form */}
                                <Stack spacing={1}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Box
                                            sx={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <HelpOutlineIcon 
                                                sx={{ 
                                                    color: 'primary.main',
                                                    fontSize: '1.8rem'
                                                }} 
                                            />
                                        </Box>
                                        <Box>
                                            <Typography 
                                                variant="h4" 
                                                fontWeight={700}
                                                sx={{ 
                                                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                                                    color: 'text.primary'
                                                }}
                                            >
                                                Create Support Ticket
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: 'text.secondary',
                                                    fontSize: { xs: '0.875rem', md: '0.9375rem' }
                                                }}
                                            >
                                                Submit a new support request
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>

                                {/* Title Field */}
                                <Box>
                                    <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                                        <TitleIcon 
                                            sx={{ 
                                                color: 'primary.main',
                                                fontSize: '1.2rem'
                                            }} 
                                        />
                                        <Typography 
                                            variant="subtitle2" 
                                            fontWeight={600}
                                            sx={{ 
                                                color: 'text.primary',
                                                fontSize: '0.9375rem'
                                            }}
                                        >
                                            Ticket Title
                                        </Typography>
                                    </Stack>
                                    <TextField
                                        {...register("subject")}
                                        fullWidth
                                        placeholder="What's the issue about?"
                                        variant="outlined"
                                        error={!!errors.subject}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                backgroundColor: isDarkMode 
                                                    ? alpha(theme.palette.background.default, 0.4)
                                                    : alpha(theme.palette.grey[50], 0.8),
                                                '&:hover': {
                                                    backgroundColor: isDarkMode 
                                                        ? alpha(theme.palette.background.default, 0.6)
                                                        : alpha(theme.palette.grey[100], 0.8),
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: isDarkMode 
                                                        ? alpha(theme.palette.background.default, 0.7)
                                                        : alpha(theme.palette.grey[100], 0.8),
                                                }
                                            }
                                        }}
                                        InputProps={{
                                            sx: {
                                                height: '50px',
                                                fontSize: '0.9375rem'
                                            }
                                        }}
                                    />
                                    {errors.subject && (
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: 'error.main',
                                                mt: 1,
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {errors.subject.message}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Priority Field */}
                                <Box>
                                    <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                                        <PriorityHighIcon 
                                            sx={{ 
                                                color: getPriorityColor(watch("priority")),
                                                fontSize: '1.2rem'
                                            }} 
                                        />
                                        <Typography 
                                            variant="subtitle2" 
                                            fontWeight={600}
                                            sx={{ 
                                                color: 'text.primary',
                                                fontSize: '0.9375rem'
                                            }}
                                        >
                                            Priority Level
                                        </Typography>
                                    </Stack>
                                    
                                    <FormControl fullWidth error={!!errors.priority}>
                                        <Select
                                            value={watch("priority")}
                                            onChange={(e) => setValue("priority", e.target.value, { shouldValidate: true })}
                                            displayEmpty
                                            sx={{
                                                borderRadius: '10px',
                                                backgroundColor: isDarkMode 
                                                    ? alpha(theme.palette.background.default, 0.4)
                                                    : alpha(theme.palette.grey[50], 0.8),
                                                height: '50px',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: errors.priority ? 'error.main' : alpha(theme.palette.divider, 0.3)
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: errors.priority ? 'error.main' : alpha(theme.palette.primary.main, 0.5)
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: errors.priority ? 'error.main' : theme.palette.primary.main,
                                                    borderWidth: '2px'
                                                }
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        borderRadius: '10px',
                                                        marginTop: '8px',
                                                        backgroundColor: isDarkMode 
                                                            ? theme.palette.background.paper 
                                                            : theme.palette.background.paper,
                                                        boxShadow: isDarkMode 
                                                            ? '0 8px 32px rgba(0,0,0,0.3)'
                                                            : '0 8px 32px rgba(0,0,0,0.1)'
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem value="" sx={{ color: 'text.secondary' }}>
                                                Select priority level
                                            </MenuItem>
                                            <MenuItem 
                                                value="LOW" 
                                                sx={{ 
                                                    color: 'success.main',
                                                    fontWeight: 500,
                                                    '&.Mui-selected': {
                                                        backgroundColor: alpha(theme.palette.success.main, 0.1)
                                                    }
                                                }}
                                            >
                                                Low Priority
                                            </MenuItem>
                                            <MenuItem 
                                                value="MEDIUM" 
                                                sx={{ 
                                                    color: 'warning.main',
                                                    fontWeight: 500,
                                                    '&.Mui-selected': {
                                                        backgroundColor: alpha(theme.palette.warning.main, 0.1)
                                                    }
                                                }}
                                            >
                                                Medium Priority
                                            </MenuItem>
                                            <MenuItem 
                                                value="HIGH" 
                                                sx={{ 
                                                    color: 'error.main',
                                                    fontWeight: 500,
                                                    '&.Mui-selected': {
                                                        backgroundColor: alpha(theme.palette.error.main, 0.1)
                                                    }
                                                }}
                                            >
                                                High Priority
                                            </MenuItem>
                                        </Select>
                                        {errors.priority && (
                                            <FormHelperText sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                                                {errors.priority.message}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>

                                {/* Message Field */}
                                <Box>
                                    <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                                        <DescriptionIcon 
                                            sx={{ 
                                                color: 'info.main',
                                                fontSize: '1.2rem'
                                            }} 
                                        />
                                        <Typography 
                                            variant="subtitle2" 
                                            fontWeight={600}
                                            sx={{ 
                                                color: 'text.primary',
                                                fontSize: '0.9375rem'
                                            }}
                                        >
                                            Description
                                        </Typography>
                                    </Stack>
                                    <TextField
                                        {...register("message")}
                                        fullWidth
                                        multiline
                                        rows={8}
                                        placeholder="Describe your issue in detail. Include steps to reproduce, error messages, and what you expected to happen."
                                        variant="outlined"
                                        error={!!errors.message}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                backgroundColor: isDarkMode 
                                                    ? alpha(theme.palette.background.default, 0.4)
                                                    : alpha(theme.palette.grey[50], 0.8),
                                                '&:hover': {
                                                    backgroundColor: isDarkMode 
                                                        ? alpha(theme.palette.background.default, 0.6)
                                                        : alpha(theme.palette.grey[100], 0.8),
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: isDarkMode 
                                                        ? alpha(theme.palette.background.default, 0.7)
                                                        : alpha(theme.palette.grey[100], 0.8),
                                                }
                                            }
                                        }}
                                        InputProps={{
                                            sx: {
                                                fontSize: '0.9375rem',
                                                lineHeight: 1.6
                                            }
                                        }}
                                    />
                                    {errors.message && (
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: 'error.main',
                                                mt: 1,
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {errors.message.message}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Submit Button */}
                                <Box sx={{ pt: 1 }}>
                                    <Button
                                        variant='contained'
                                        type='submit'
                                        disabled={isLoading}
                                        startIcon={<SendIcon />}
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: '10px',
                                            py: 1.75,
                                            px: 5,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            width: { xs: '100%', sm: 'auto' },
                                            minWidth: '160px',
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                                            },
                                            '&:active': {
                                                transform: 'translateY(0)'
                                            },
                                            '&.Mui-disabled': {
                                                background: theme.palette.grey[400],
                                                color: theme.palette.grey[600]
                                            }
                                        }}
                                    >
                                        {isLoading ? 'Submitting...' : 'Submit Ticket'}
                                    </Button>
                                </Box>
                            </Stack>
                        </Box>
                    </Paper>

                    {/* Right Side - Info */}
                    <Box sx={{ 
                        flex: { lg: 0.6 }, 
                        width: '100%',
                        position: { lg: 'sticky' },
                        top: { lg: 24 }
                    }}>
                        <Stack spacing={3}>
                            {/* Priority Info */}
                            <Paper 
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    backgroundColor: isDarkMode 
                                        ? alpha(theme.palette.primary.main, 0.08)
                                        : alpha(theme.palette.primary.main, 0.04),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                }}
                            >
                                <Typography 
                                    variant="subtitle1" 
                                    fontWeight={600}
                                    sx={{ 
                                        color: 'text.primary',
                                        mb: 2,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Priority Guidelines
                                </Typography>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                color: 'success.main',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                mb: 0.5
                                            }}
                                        >
                                            Low Priority
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: 'text.secondary',
                                                fontSize: '0.8125rem'
                                            }}
                                        >
                                            General questions, feature requests, non-urgent issues. Response within 48 hours.
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                color: 'warning.main',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                mb: 0.5
                                            }}
                                        >
                                            Medium Priority
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: 'text.secondary',
                                                fontSize: '0.8125rem'
                                            }}
                                        >
                                            Minor bugs, account issues, important questions. Response within 24 hours.
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                color: 'error.main',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                mb: 0.5
                                            }}
                                        >
                                            High Priority
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: 'text.secondary',
                                                fontSize: '0.8125rem'
                                            }}
                                        >
                                            Critical bugs, security issues, account blocking. Response within 4 hours.
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>

                            {/* Tips Info */}
                            <Paper 
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    backgroundColor: isDarkMode 
                                        ? alpha(theme.palette.info.main, 0.08)
                                        : alpha(theme.palette.info.main, 0.04),
                                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                }}
                            >
                                <Typography 
                                    variant="subtitle1" 
                                    fontWeight={600}
                                    sx={{ 
                                        color: 'text.primary',
                                        mb: 2,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Tips for Better Support
                                </Typography>
                                <Stack spacing={1.5}>
                                    {[
                                        "Include specific error messages",
                                        "Describe steps to reproduce",
                                        "Attach screenshots if possible",
                                        "Mention your browser and OS",
                                        "Include relevant account details"
                                    ].map((tip, index) => (
                                        <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    backgroundColor: alpha(theme.palette.info.main, 0.2),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    mt: 0.25
                                                }}
                                            >
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: 'info.main',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    {index + 1}
                                                </Typography>
                                            </Box>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: 'text.secondary',
                                                    fontSize: '0.8125rem'
                                                }}
                                            >
                                                {tip}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>

                           
                        </Stack>
                    </Box>
                </Stack>
            </Box>
        </Container>
    );
}

export default NewTicket;