import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Stack, Divider, Box, IconButton, Tooltip, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import MenuComponent from '../../../../components/MenuComponent';
import ModalComponent from '../../../../components/ModalComponent';
import ChangeMT5PasswordModalDetails from "../../ChangeMT5PasswordModalDetails"
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetUserDataQuery } from '../../../../globalState/userState/userStateApis';
import { useMt5AccountBalanceQuery } from '../../../../globalState/mt5State/mt5StateApis';
import { initiateMT5AccountDetailsSocketConnection } from '../../../../socketENV/MT5AccountDetailsSocketENV';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';

const SERVER_NAME = import.meta.env.VITE_SERVER_NAME;
const brandLight = "#699d89";
const brandDark = "#17433d";

function AccountDetailsAccordian({ account, actionButtons }) {
    const theme = useTheme();
    const { selectedTheme } = useSelector((state) => state.themeMode);
    const isDarkMode = selectedTheme === "dark";
    const { token } = useSelector((state) => state.auth);

    const [activeAccountDetails, setActiveAccountDetails] = useState(null);
    const socketRef = useRef();

    const { data: accountBalanceData, isLoading: activeAccountBalanceLoading, refetch } = useMt5AccountBalanceQuery(
        { login: account?.Login, flag: 1 },
        { skip: !account?.Login }
    );

    useEffect(() => {
        if (!account?.Login || !token) return;

        if (socketRef.current) {
            socketRef.current.disconnect();
            setActiveAccountDetails(null);
        }

        const accountData = (data) => {
            if (data) {
                setActiveAccountDetails(data?.marginDetails ? data?.marginDetails : data);
            }
        };

        socketRef.current = initiateMT5AccountDetailsSocketConnection({
            login: account.Login,
            token,
            accountData
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [account?.Login, token]);

    const accountTypeDetails = useMemo(() => ({
        type: account?.accountType || "-",
        MTVersion: "MT5",
        accountId: account?.Login || "-",
    }), [account]);

    const accountDetailsData = useMemo(() => ({
        "Actual leverage": activeAccountDetails ? activeAccountDetails?.MarginLeverage || "- - - - -" : "- - - - -",
        "Free margin": activeAccountDetails ? activeAccountDetails?.MarginFree || "0.00 USD" : "0.00 USD",
        "Unrealized P&L": activeAccountDetails ? activeAccountDetails?.Profit || "0.00 USD" : "0.00 USD",
        "Equity": activeAccountDetails ? activeAccountDetails?.Equity || "0.00 USD" : "0.00 USD",
        "Credit": activeAccountDetails ? activeAccountDetails?.Credit || "0.00 USD" : "0.00 USD"
    }), [activeAccountDetails]);

    const accountDetailsID = useMemo(() => [
        { type: "Server", id: SERVER_NAME, icon: ContentCopyIcon },
        { type: "MT5 login", id: account?.Login || "-", icon: ContentCopyIcon }
    ], [account]);

    const currentBalance = activeAccountDetails?.Balance || account?.Balance || 0;
    const currentBalanceFormatted = Number(currentBalance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const cardBackground = isDarkMode 
        ? `linear-gradient(135deg, #1a1a1a 0%, ${brandLight}22 40%, ${brandDark}77 100%)`
        : `linear-gradient(135deg, #f3f7f5 0%, ${brandLight}33 40%, ${brandDark} 100%)`;

    const balanceCardBackground = isDarkMode
        ? `linear-gradient(135deg, ${brandDark} 0%, #0d2a26 60%, ${brandLight}44 100%)`
        : `linear-gradient(135deg, ${brandDark} 0%, #1f5f55 60%, ${brandLight} 100%)`;

    const primaryTextColor = isDarkMode ? "#e0e0e0" : brandDark;
    const secondaryTextColor = isDarkMode ? "#b0b0b0" : "#666666";
    const iconColor = isDarkMode ? brandLight : brandDark;
    const dividerColor = isDarkMode ? "rgba(105, 157, 137, 0.3)" : "rgba(105, 157, 137, 0.2)";

    const chipRealBg = isDarkMode ? brandLight : brandLight;
    const chipRealColor = isDarkMode ? "#0d2a26" : "#0d2a26";
    const chipMtsBg = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(23, 67, 61, 0.1)";
    const chipMtsColor = isDarkMode ? "#ffffff" : brandDark;

    const modalWidth = useMediaQuery('(max-width:600px)');
    const [copied, setCopied] = useState(false);
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const { hideBalance } = useSelector(state => state.profile);

    const defaultActionButtons = [
        {
            name: "Deposit",
            icon: AddIcon,
            link: "/client/transactions/deposit"
        },
        {
            name: "Withdraw",
            icon: ArrowOutwardIcon,
            link: "/client/transactions/withdrawal"
        },
        {
            name: "Transfer",
            icon: CompareArrowsIcon,
            link: "/client/transactions/internalTransfer"
        },
        {
            name: "Trade",
            icon: AttachMoneyIcon,
            modal: null,
        }
    ];

    const buttonsToUse = actionButtons && actionButtons.length > 0 ? actionButtons : defaultActionButtons;

    // Custom Button Component to prevent nested buttons
    const ActionButton = ({ button }) => {
        if (button.link) {
            return (
                <Button
                    component={Link}
                    to={button.link}
                    startIcon={button.icon && <button.icon />}
                    variant={button.name === "Trade" ? "outlined" : "contained"}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        px: 2.5,
                        py: 1,
                        minWidth: { xs: "120px", sm: "auto" },
                        ...(button.name !== "Trade"
                            ? {
                                background: brandLight,
                                color: isDarkMode ? "#0d2a26" : "#ffffff",
                                boxShadow: "0 2px 8px rgba(105, 157, 137, 0.3)",
                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                "&:hover": {
                                    background: isDarkMode ? "#7ab39e" : "#5a8f7b",
                                    boxShadow: "0 4px 12px rgba(105, 157, 137, 0.4)",
                                },
                            }
                            : {
                                color: isDarkMode ? brandLight : brandDark,
                                borderColor: isDarkMode ? brandLight : brandDark,
                                borderWidth: "1.5px",
                                background: isDarkMode ? "rgba(105, 157, 137, 0.1)" : "rgba(23, 67, 61, 0.05)",
                                "&:hover": {
                                    borderColor: isDarkMode ? "#8bc4aa" : "#2a6d64",
                                    background: isDarkMode ? "rgba(105, 157, 137, 0.2)" : "rgba(23, 67, 61, 0.1)",
                                    boxShadow: "0 0 20px rgba(105, 157, 137, 0.3)",
                                },
                            }),
                    }}
                >
                    {button.name}
                </Button>
            );
        } else if (button.modal) {
            return (
                <ModalComponent
                    startIcon={button.icon && <button.icon />}
                    btnName={button.name}
                    Content={button.modal}
                    contentData={{ 
                        login: accountTypeDetails.accountId, 
                        mainBalance: currentBalanceFormatted, 
                        refetch 
                    }}
                    btnSx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        px: 2.5,
                        py: 1,
                        minWidth: { xs: "120px", sm: "auto" },
                        color: isDarkMode ? brandLight : brandDark,
                        borderColor: isDarkMode ? brandLight : brandDark,
                        borderWidth: "1.5px",
                        background: isDarkMode ? "rgba(105, 157, 137, 0.1)" : "rgba(23, 67, 61, 0.05)",
                        "&:hover": {
                            borderColor: isDarkMode ? "#8bc4aa" : "#2a6d64",
                            background: isDarkMode ? "rgba(105, 157, 137, 0.2)" : "rgba(23, 67, 61, 0.1)",
                            boxShadow: "0 0 20px rgba(105, 157, 137, 0.3)",
                        },
                    }}
                    modalWidth={modalWidth ? "95%" : 500}
                />
            );
        } else if (button.menuItems) {
            return (
                <MenuComponent
                    modal={ModalComponent}
                    modalComponentData={{
                        mt5Login: accountTypeDetails.accountId,
                        accountInfo: { accountDetailsData, accountTypeDetails, accountDetailsID }
                    }}
                    btnContent={button.icon && <button.icon />}
                    modalMenuData={button.menuItems}
                    btnSx={{
                        bgcolor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(23, 67, 61, 0.1)",
                        color: isDarkMode ? brandLight : brandDark,
                        borderRadius: 2,
                        p: 1,
                        minWidth: "auto",
                        "&:hover": {
                            bgcolor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(23, 67, 61, 0.2)",
                        },
                    }}
                />
            );
        }
        return null;
    };

    return (
        <Box
            sx={{
                position: "relative",
                borderRadius: 4,
                background: cardBackground,
                border: isDarkMode 
                    ? "1px solid rgba(105, 157, 137, 0.3)" 
                    : "1px solid rgba(105, 157, 137, 0.2)",
                overflow: "hidden",
                "&:before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: isDarkMode
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
                    background: isDarkMode
                        ? "radial-gradient(circle at 20% 80%, rgba(105, 157, 137, 0.15), transparent 50%)"
                        : "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2), transparent 50%)",
                    pointerEvents: "none",
                },
                mb: 3,
            }}
        >
            {/* Header with buttons (outside Accordion) */}
            <Box sx={{ p: 3, pb: 0 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                        {!account ? (
                            <Skeleton width={60} height={28} sx={{ borderRadius: 1 }} />
                        ) : (
                            <Box
                                sx={{
                                    bgcolor: chipRealBg,
                                    color: chipRealColor,
                                    borderRadius: 1,
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                            >
                                {accountTypeDetails.type}
                            </Box>
                        )}
                        
                        {!account ? (
                            <Skeleton width={60} height={28} sx={{ borderRadius: 1 }} />
                        ) : (
                            <Box
                                sx={{
                                    bgcolor: chipMtsBg,
                                    color: chipMtsColor,
                                    borderRadius: 1,
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                            >
                                {accountTypeDetails.MTVersion}
                            </Box>
                        )}
                        
                        {!account ? (
                            <Skeleton width={100} height={28} sx={{ borderRadius: 1 }} />
                        ) : (
                            <Stack direction="row" alignItems="center" gap={0.75}>
                                <AccountCircleIcon sx={{ 
                                    color: iconColor, 
                                    fontSize: "18px",
                                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                                }} />
                                <Typography
                                    sx={{
                                        color: isDarkMode ? brandLight : brandDark,
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        fontFamily: "monospace",
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    ID: {accountTypeDetails.accountId}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>

                    {/* Action Buttons - Now outside Accordion */}
                    <Stack direction="row" flexWrap="wrap" gap={1.5}>
                        {buttonsToUse.map((button, i) => (
                            <ActionButton key={i} button={button} />
                        ))}
                    </Stack>
                </Stack>

                {/* Balance Section */}
                <Box sx={{ mt: 3 }}>
                    <Typography
                        sx={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: isDarkMode ? "#ffffff" : brandDark,
                            lineHeight: 1,
                            letterSpacing: "-0.5px",
                            textShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                    >
                        {hideBalance ? '•••••••' : currentBalanceFormatted}
                        <Typography
                            component="span"
                            sx={{
                                fontSize: { xs: "1rem", md: "1.25rem" },
                                color: secondaryTextColor,
                                fontWeight: 500,
                                ml: 1.5,
                                textTransform: "uppercase",
                            }}
                        >
                            USD
                        </Typography>
                    </Typography>
                    <Typography
                        sx={{
                            color: secondaryTextColor,
                            fontSize: "0.875rem",
                            mt: 0.5,
                            fontWeight: 500,
                        }}
                    >
                        Account Balance
                    </Typography>
                </Box>
            </Box>

            {/* Accordion for details only */}
            <Accordion
                defaultExpanded={false}
                sx={{
                    background: "transparent",
                    boxShadow: "none",
                    borderRadius: "0 !important",
                    "&:before": { display: "none" },
                    "&.Mui-expanded": {
                        margin: 0,
                    },
                    mt: 2,
                }}
            >
                <AccordionSummary
                    expandIcon={
                        <ExpandMoreIcon sx={{ 
                            color: iconColor,
                            fontSize: "1.5rem",
                        }} />
                    }
                    sx={{
                        px: 3,
                        py: 2,
                        minHeight: "auto",
                        "& .MuiAccordionSummary-content": { 
                            margin: 0,
                        },
                        "&.Mui-expanded": {
                            minHeight: "auto", 
                        },
                    }}
                >
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: iconColor }}>
                        View Account Details
                    </Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 3, pt: 0 }}>
                    <Box
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            background: balanceCardBackground,
                            color: "#ffffff",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
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
                        }}
                    >
                        <Stack gap={0} sx={{ position: "relative", zIndex: 2 }}>
                            {Object.entries(accountDetailsData).map(([key, value], i) => (
                                <Box key={key}>
                                    <Stack 
                                        direction="row" 
                                        justifyContent="space-between" 
                                        alignItems="center" 
                                        sx={{ py: 1.5 }}
                                    >
                                        <Typography 
                                            sx={{ 
                                                color: "rgba(255, 255, 255, 0.9)",
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {key}
                                        </Typography>
                                        <Typography 
                                            sx={{ 
                                                color: "#ffffff",
                                                fontSize: "0.875rem",
                                                fontWeight: 600,
                                                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                            }}
                                        >
                                            {value}
                                        </Typography>
                                    </Stack>
                                    {i < Object.entries(accountDetailsData).length - 1 && (
                                        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    <Box 
                        sx={{ 
                            mt: 3, 
                            display: "flex", 
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between", 
                            alignItems: { xs: "flex-start", sm: "center" },
                            gap: 2,
                        }}
                    >
                        <Stack direction="row" gap={3} flexWrap="wrap">
                            {accountDetailsID.map((ele, i) => (
                                <Stack key={i} direction="row" alignItems="center" gap={1}>
                                    <Typography 
                                        sx={{ 
                                            color: secondaryTextColor, 
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {ele.type}:
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontSize: "0.75rem", 
                                            color: primaryTextColor, 
                                            fontWeight: 600,
                                            fontFamily: "monospace",
                                        }}
                                    >
                                        {ele.id}
                                    </Typography>
                                    <Tooltip title={copied ? "Copied!" : "Copy"}>
                                        <IconButton 
                                            size="small" 
                                            onClick={(e) => {
                                                handleCopy(ele?.id);
                                            }} 
                                            sx={{ 
                                                color: secondaryTextColor, 
                                                p: 0.5, 
                                                "&:hover": { 
                                                    color: iconColor,
                                                    bgcolor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(23, 67, 61, 0.1)",
                                                } 
                                            }}
                                        >
                                            <ele.icon sx={{ fontSize: "14px" }} />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            ))}
                        </Stack>
                        
                        <ModalComponent
                            startIcon={<EditIcon sx={{ fontSize: "14px" }} />}
                            btnName="Change trading password"
                            Content={ChangeMT5PasswordModalDetails}
                            contentData={{ mt5Login: accountTypeDetails.accountId }}
                            btnSx={{
                                textTransform: "none",
                                borderRadius: 1.5,
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                px: 2,
                                py: 0.75,
                                color: secondaryTextColor,
                                border: `1px solid ${dividerColor}`,
                                background: "transparent",
                                "&:hover": {
                                    color: primaryTextColor,
                                    borderColor: iconColor,
                                    background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(23, 67, 61, 0.05)",
                                },
                            }}
                            modalWidth={modalWidth ? "95%" : 500}
                        />
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}

export default AccountDetailsAccordian;