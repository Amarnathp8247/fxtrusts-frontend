import { Card, Box, Typography, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import HistoryIcon from "@mui/icons-material/History";
import { useSelector } from "react-redux";
import { useGetUserDataQuery } from "../globalState/userState/userStateApis";
import { Link } from "react-router-dom";

const brandLight = "#699d89";
const brandDark = "#17433d";

function WalletCard() {
    const { token } = useSelector((state) => state.auth);
    const { selectedTheme } = useSelector((state) => state.themeMode);
    
    const { data, isLoading } = useGetUserDataQuery(undefined, {
        skip: !token,
        refetchOnMountOrArgChange: true,
    });

    const mainBalance = Number(!isLoading && data?.data?.assetData?.mainBalance || 0).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    // Dynamic colors based on theme
    const cardBackground = selectedTheme === "dark" 
        ? `linear-gradient(135deg, #1a1a1a 0%, ${brandLight}22 40%, ${brandDark}77 100%)`
        : `linear-gradient(135deg, #f3f7f5 0%, ${brandLight}33 40%, ${brandDark} 100%)`;

    const cardColor = selectedTheme === "dark" ? "#e0e0e0" : brandDark;
    const balanceCardBackground = selectedTheme === "dark"
        ? `linear-gradient(135deg, ${brandDark} 0%, #0d2a26 60%, ${brandLight}44 100%)`
        : `linear-gradient(135deg, ${brandDark} 0%, #1f5f55 60%, ${brandLight} 100%)`;

    return (
        <Card
            sx={{
                p: 3,
                borderRadius: 4,
                background: cardBackground,
                color: cardColor,
                position: "relative",
                overflow: "hidden",
                minHeight: "260px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: selectedTheme === "dark" 
                    ? "1px solid rgba(105, 157, 137, 0.3)" 
                    : "1px solid rgba(105, 157, 137, 0.2)",
                "&:before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: selectedTheme === "dark"
                        ? "linear-gradient(90deg, transparent, rgba(105, 157, 137, 0.6), rgba(255, 255, 255, 0.8), rgba(105, 157, 137, 0.6), transparent)"
                        : "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.8), transparent)",
                },
                "&:after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: selectedTheme === "dark"
                        ? "radial-gradient(circle at 20% 80%, rgba(105, 157, 137, 0.15), transparent 50%)"
                        : "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2), transparent 50%)",
                    pointerEvents: "none",
                },
            }}
        >
            {/* Header Section */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3, position: "relative", zIndex: 2 }}
            >
                <Box>
                    <Typography 
                        fontWeight={700} 
                        fontSize={22}
                        sx={{ 
                            lineHeight: 1.2, 
                            color: selectedTheme === "dark" ? "#ffffff" : "inherit",
                            textShadow: selectedTheme === "dark" 
                                ? "0 1px 2px rgba(0,0,0,0.5)" 
                                : "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                    >
                        Flexy
                        <Box component="span" sx={{ 
                            color: selectedTheme === "dark" ? brandLight : brandDark,
                            ml: 0.5,
                            background: selectedTheme === "dark"
                                ? `linear-gradient(90deg, ${brandLight}, #8bc4aa)`
                                : `linear-gradient(90deg, ${brandDark}, #2a6d64)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            Markets
                        </Box>
                    </Typography>

                    <Typography 
                        variant="body2" 
                        sx={{ 
                            opacity: selectedTheme === "dark" ? 0.7 : 0.8,
                            mt: 0.5,
                            fontSize: "0.875rem",
                            color: selectedTheme === "dark" ? "#b0b0b0" : "inherit"
                        }}
                    >
                        Global Trading Wallet
                    </Typography>
                </Box>

                {/* Transaction History Button */}
                <Button
                    component={Link}
                    to={"/client/transactions/depositWithdrawList"}
                    variant="outlined"
                    startIcon={<HistoryIcon sx={{ 
                        fontSize: "1rem",
                        color: selectedTheme === "dark" ? brandLight : brandDark,
                    }} />}
                    size="small"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        color: selectedTheme === "dark" ? brandLight : brandDark,
                        borderColor: selectedTheme === "dark" ? brandLight : brandDark,
                        borderWidth: "1px",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        py: 0.75,
                        px: 1.5,
                        minWidth: "auto",
                        background: selectedTheme === "dark" 
                            ? "rgba(105, 157, 137, 0.15)" 
                            : "rgba(23, 67, 61, 0.05)",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: selectedTheme === "dark"
                            ? "0 0 10px rgba(105, 157, 137, 0.3), inset 0 0 10px rgba(105, 157, 137, 0.1)"
                            : "0 0 10px rgba(105, 157, 137, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.2)",
                        "&:before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                            pointerEvents: "none",
                        },
                        "&:hover": {
                            borderColor: selectedTheme === "dark" ? "#8bc4aa" : "#2a6d64",
                            color: selectedTheme === "dark" ? "#8bc4aa" : "#2a6d64",
                            background: selectedTheme === "dark" ? "rgba(105, 157, 137, 0.25)" : "rgba(23, 67, 61, 0.1)",
                            boxShadow: selectedTheme === "dark" 
                                ? "0 0 20px rgba(105, 157, 137, 0.5), inset 0 0 15px rgba(105, 157, 137, 0.2)" 
                                : "0 0 20px rgba(105, 157, 137, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.3)",
                        },
                    }}
                >
                   Transaction History
                </Button>
            </Stack>

            {/* Balance Card Section */}
            <Box
                sx={{
                    flexGrow: 1,
                    p: 3,
                    borderRadius: 3,
                    background: balanceCardBackground,
                    color: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: selectedTheme === "dark" 
                        ? "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(105, 157, 137, 0.2)" 
                        : "0 8px 32px rgba(23, 67, 61, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)",
                    position: "relative",
                    overflow: "hidden",
                    border: selectedTheme === "dark" 
                        ? "1px solid rgba(105, 157, 137, 0.3)" 
                        : "1px solid rgba(255, 255, 255, 0.2)",
                    "&:before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: selectedTheme === "dark"
                            ? "linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1), transparent)"
                            : "linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
                        pointerEvents: "none",
                    },
                    "&:after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: selectedTheme === "dark"
                            ? "radial-gradient(circle at 50% 50%, rgba(105, 157, 137, 0.1), transparent 60%)"
                            : "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15), transparent 60%)",
                        pointerEvents: "none",
                    },
                }}
            >
                <Box sx={{ position: "relative", zIndex: 2 }}>
                    <Typography 
                        fontSize={34} 
                        fontWeight={800}
                        sx={{ 
                            lineHeight: 1.2,
                            mb: 0.5,
                            background: "linear-gradient(180deg, #ffffff, #e0e0e0)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        }}
                    >
                        {mainBalance} USD
                    </Typography>

                    <Typography 
                        variant="body2" 
                        sx={{ 
                            opacity: 0.9,
                            fontSize: "0.875rem",
                            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        }}
                    >
                        Wallet Balance
                    </Typography>
                </Box>

                {/* Buttons Section */}
                <Stack 
                    direction="row" 
                    spacing={2} 
                    sx={{ 
                        mt: 3,
                        justifyContent: { xs: "center", sm: "flex-start" },
                        position: "relative",
                        zIndex: 2,
                    }}
                >
                    <Button
                        startIcon={<AddIcon />}
                        component={Link}
                        to={"/client/transactions/deposit"}
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${brandLight}, #5a8f7b)`,
                            color: selectedTheme === "dark" ? "#0d2a26" : "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            px: 3,
                            py: 1,
                            minWidth: "120px",
                            boxShadow: "0 4px 15px rgba(105, 157, 137, 0.5), 0 0 20px rgba(105, 157, 137, 0.3)",
                            position: "relative",
                            overflow: "hidden",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            "&:before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: "linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
                                pointerEvents: "none",
                            },
                            "&:hover": {
                                background: `linear-gradient(135deg, #7ab39e, #699d89)`,
                                boxShadow: "0 6px 25px rgba(105, 157, 137, 0.7), 0 0 30px rgba(105, 157, 137, 0.4)",
                                transform: "translateY(-2px)",
                            },
                        }}
                    >
                        Deposit
                    </Button>

                    <Button
                        startIcon={<ArrowOutwardIcon />}
                        variant="outlined"
                        component={Link}
                        to={"/client/transactions/withdrawal"}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            color: "#ffffff",
                            borderColor: "rgba(255, 255, 255, 0.6)",
                            borderWidth: "2px",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            px: 3,
                            py: 1,
                            minWidth: "120px",
                            background: "rgba(255, 255, 255, 0.1)",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)",
                            "&:before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)",
                                pointerEvents: "none",
                            },
                            "&:after": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                border: "2px solid transparent",
                                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0)) border-box",
                                WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                                WebkitMaskComposite: "xor",
                                maskComposite: "exclude",
                                borderRadius: 2,
                            },
                            "&:hover": {
                                borderColor: "#ffffff",
                                background: "rgba(255, 255, 255, 0.2)",
                                boxShadow: "0 6px 25px rgba(255, 255, 255, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.2)",
                                transform: "translateY(-2px)",
                            },
                        }}
                    >
                        Withdraw
                    </Button>
                </Stack>
            </Box>
        </Card>
    );
}

export default WalletCard;