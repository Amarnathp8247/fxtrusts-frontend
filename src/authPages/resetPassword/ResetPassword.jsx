import { Typography, Box, Container, Paper, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2"; // Changed to Grid2
import { Link, useSearchParams } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import EnterNewPassword from "./EnterNewPassword";

const SHORT_BRAND_NAME = import.meta.env.VITE_SHORT_BRAND_NAME || "Our Platform";
const FULL_BRAND_NAME = import.meta.env.VITE_FULL_BRAND_NAME || SHORT_BRAND_NAME;

// Hero section features
const HERO_FEATURES = [
    "🔒 Secure password recovery",
    "⚡ Quick verification process",
    "🔐 End-to-end encryption",
    "📱 Access from any device"
];

function ResetPassword() {

    const [searchParams] = useSearchParams()
    const theme = useTheme();

    const forgotPasswordStep = searchParams.get('forgotPasswordStep') || "sendOTP"

    const resetPasswordMaping = {
        sendOTP: ForgotPassword,
        verifyOTP: VerifyOtp,
        enterNewPassword: EnterNewPassword
    }

    const stepTitles = {
        sendOTP: "Reset Password",
        verifyOTP: "Verify OTP",
        enterNewPassword: "Create New Password"
    };

    const stepDescriptions = {
        sendOTP: "Enter your email to receive a verification code",
        verifyOTP: "Enter the verification code sent to your email",
        enterNewPassword: "Create a strong new password for your account"
    };

    const ActiveStep = resetPasswordMaping[forgotPasswordStep]

    return (
        <Box sx={{ 
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            background: theme.palette.mode === 'light' 
                ? 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)'
                : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                    {/* Left Column - Hero Section */}
                    <Grid size={{ xs: 12, md: 6 }}> {/* Changed from 'item' to 'size' */}
                        <Box sx={{ 
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            pr: { md: 4 }
                        }}>
                            {/* Brand Logo/Name */}
                            <Typography 
                                variant="h2" 
                                component="h1"
                                fontWeight="800"
                                gutterBottom
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    mb: 2
                                }}
                            >
                                {FULL_BRAND_NAME}
                            </Typography>
                            
                            {/* Hero Description */}
                            <Typography 
                                variant="h6" 
                                color="text.secondary"
                                sx={{ mb: 4, lineHeight: 1.6 }}
                            >
                                Reset your password securely and regain access to your {SHORT_BRAND_NAME} account. 
                                Our recovery process ensures your account stays protected.
                            </Typography>
                            
                            {/* Features List */}
                            <Box sx={{ mb: 4 }}>
                                <Typography 
                                    variant="h6" 
                                    fontWeight="600" 
                                    gutterBottom
                                    color="text.primary"
                                >
                                    Secure Password Recovery
                                </Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                                    {HERO_FEATURES.map((feature, index) => (
                                        <Box 
                                            key={index}
                                            sx={{ 
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    backgroundColor: "primary.main",
                                                    flexShrink: 0
                                                }}
                                            />
                                            <Typography 
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {feature}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Column - Reset Password Form */}
                    <Grid size={{ xs: 12, md: 6 }}> {/* Changed from 'item' to 'size' */}
                        <Paper
                            elevation={3}
                            sx={{
                                width: "100%",
                                maxWidth: "450px",
                                borderRadius: 3,
                                overflow: "hidden",
                                ml: { md: "auto" },
                                boxShadow: theme.shadows[8]
                            }}
                        >
                            {/* Form Content */}
                            <Box sx={{ 
                                p: { xs: 3, sm: 4 },
                                backgroundColor: theme.palette.mode === 'light' 
                                    ? 'grey.50' 
                                    : 'background.default'
                            }}>
                                <ActiveStep />
                            </Box>

                            {/* Form Footer */}
                            <Box 
                                sx={{ 
                                    p: 2.5, 
                                    borderTop: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: theme.palette.mode === 'light' 
                                        ? 'white' 
                                        : 'background.paper',
                                    textAlign: "center"
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Remember your password?{" "}
                                    <Typography
                                        component={Link}
                                        to="/accounts/signIn"
                                        variant="body2"
                                        sx={{
                                            color: "primary.main",
                                            fontWeight: 600,
                                            textDecoration: "none",
                                            '&:hover': {
                                                textDecoration: "underline"
                                            }
                                        }}
                                    >
                                        Sign in now
                                    </Typography>
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default ResetPassword;