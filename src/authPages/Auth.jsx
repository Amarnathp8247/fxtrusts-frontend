import { Container, Typography, Stack, Box, Paper, useTheme, Grid } from "@mui/material";
import TabComponent from "../components/TabComponent";
import { useNavigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import Loader from "../components/Loader";

const SignIn = lazy(() => import("./signIn/SignIn"));
const SignUp = lazy(() => import("./signUp/SignUp"));

const TABS = {
    Sign_In: "Sign in",
    Sign_Up: "Create an account",
};

const PATHS = {
    [TABS.Sign_In]: "signIn",
    [TABS.Sign_Up]: "signUp",
};

const COMPONENTS = {
    [TABS.Sign_In]: SignIn,
    [TABS.Sign_Up]: SignUp,
};

const SHORT_BRAND_NAME = import.meta.env.VITE_SHORT_BRAND_NAME;
const FULL_BRAND_NAME = import.meta.env.VITE_FULL_BRAND_NAME || SHORT_BRAND_NAME;

function Auth() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const getActiveTab = () => {
        return Object.keys(PATHS).find(tab =>
            location.pathname.toLowerCase().includes(PATHS[tab].toLowerCase())
        ) || TABS.Sign_In;
    };

    const active = getActiveTab();
    const ActiveComponent = useMemo(() => COMPONENTS[active], [active]);

    function handleOnChange(newAlignment) {
        if (newAlignment) {
            navigate(`/accounts/${PATHS[newAlignment]}`);
        }
    }

    return (
        <Box sx={{ 
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            background: theme.palette.mode === 'light' 
                ? 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)'
                : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        }}>
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Grid container spacing={4} alignItems="center">
                    {/* Left Column - Hero Section */}
                    <Grid item xs={12} md={6}>
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
                                Join thousands of professionals who trust {SHORT_BRAND_NAME} 
                                to streamline their workflow and boost efficiency. 
                                Experience the difference today.
                            </Typography>
                            
                            {/* Features List */}
                            <Box sx={{ mb: 4 }}>
                                <Typography 
                                    variant="h6" 
                                    fontWeight="600" 
                                    gutterBottom
                                    color="text.primary"
                                >
                                    Why Choose {SHORT_BRAND_NAME}?
                                </Typography>
                                <Stack spacing={1}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "primary.main" }} />
                                        <Typography variant="body2" color="text.secondary">Secure & encrypted data protection</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "primary.main" }} />
                                        <Typography variant="body2" color="text.secondary">Lightning-fast performance</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "primary.main" }} />
                                        <Typography variant="body2" color="text.secondary">Real-time analytics & insights</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Column - Compact Auth Form Card */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={3}
                            sx={{
                                width: "100%",
                                maxWidth: "450px",
                                borderRadius: 2,
                                overflow: "hidden",
                                ml: { md: "auto" },
                                boxShadow: theme.shadows[4]
                            }}
                        >
                            {/* Compact Header */}
                            <Box
                                sx={{
                                    p: 2,
                                    backgroundColor: theme.palette.mode === 'light' 
                                        ? 'white' 
                                        : 'background.paper',
                                    textAlign: "center"
                                }}
                            >
                                <Typography 
                                    variant="subtitle1" 
                                    component="h2"
                                    fontWeight="600"
                                    gutterBottom
                                    color="text.primary"
                                >
                                    {active === TABS.Sign_In ? "Sign In" : "Create Account"}
                                </Typography>
                                
                                {/* Compact Tabs */}
                                <Box sx={{ width: "100%" }}>
                                    <TabComponent
                                        items={Object.values(TABS)}
                                        tabSx={{ 
                                            fontSize: "0.875rem", 
                                            py: 1,
                                            flex: 1,
                                            minHeight: "38px",
                                            textTransform: "none",
                                            fontWeight: 500
                                        }}
                                        containerSx={{
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 1,
                                            overflow: "hidden",
                                            backgroundColor: theme.palette.action.hover,
                                        }}
                                        onChange={(_, newAlignment) => handleOnChange(newAlignment)}
                                        active={active}
                                    />
                                </Box>
                            </Box>

                            {/* Compact Form Content - Very Short */}
                            <Box sx={{ 
                                p: 2,
                                backgroundColor: theme.palette.mode === 'light' 
                                    ? 'grey.50' 
                                    : 'background.default',
                                minHeight: '220px' // Much shorter height
                            }}>
                                <Suspense fallback={
                                    <Box 
                                        display="flex" 
                                        justifyContent="center" 
                                        alignItems="center" 
                                        height="180px"
                                    >
                                        <Loader size="small" />
                                    </Box>
                                }>
                                    {ActiveComponent ? (
                                        <ActiveComponent />
                                    ) : (
                                        <Typography 
                                            color="error" 
                                            textAlign="center"
                                            variant="body2"
                                            py={1}
                                        >
                                            Invalid tab selection
                                        </Typography>
                                    )}
                                </Suspense>
                            </Box>

                            {/* Compact Footer */}
                            <Box 
                                sx={{ 
                                    p: 1.5, 
                                    borderTop: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: theme.palette.mode === 'light' 
                                        ? 'white' 
                                        : 'background.paper',
                                    textAlign: "center"
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    {active === TABS.Sign_In 
                                        ? "New here? " 
                                        : "Already have an account? "}
                                    <Typography
                                        component="span"
                                        variant="caption"
                                        onClick={() => handleOnChange(
                                            active === TABS.Sign_In ? TABS.Sign_Up : TABS.Sign_In
                                        )}
                                        sx={{
                                            color: "primary.main",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            '&:hover': {
                                                textDecoration: "underline"
                                            }
                                        }}
                                    >
                                        {active === TABS.Sign_In ? "Sign up" : "Sign in"}
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

export default Auth;