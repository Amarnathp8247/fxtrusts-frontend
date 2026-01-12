import { Button, Container, Stack, Typography, Box, Grid } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from "react-redux";
import Account from "./account/Account";
import { Link } from "react-router-dom";
import TabComponent from "../../../components/TabComponent";
import { useGetUserDataQuery } from "../../../globalState/userState/userStateApis";
import Tooltip from '@mui/material/Tooltip';
import { useMt5AccountListQuery } from "../../../globalState/mt5State/mt5StateApis";
import HeroOpenAccountPage from "./heroOpenAccountPage/HeroOpenAccountPage";
import Loader from "../../../components/Loader"
import { useEffect } from "react";
import { setActiveMT5AccountType } from "../../../globalState/mt5State/mt5StateSlice";
import WalletCard from "../../../components/WalletCard";

function MyAccount() {
    const dispatch = useDispatch();
    const { activeMT5AccountType } = useSelector(state => state.mt5);
    const { token } = useSelector((state) => state.auth);

    const { data, isLoading } = useGetUserDataQuery(undefined, {
        skip: !token,
        refetchOnMountOrArgChange: true,
    });

    const { data: mt5AccountData, isLoading: mt5AccountLoading } = useMt5AccountListQuery({ 
        page: "1", 
        rowPerPage: "10" 
    });

    const haveDemoMT5Account = !mt5AccountLoading && 
        (mt5AccountData?.data?.mt5AccountList)?.filter(item => item?.accountType === "DEMO")?.length > 0;
    const haveRealMT5Account = !mt5AccountLoading && 
        (mt5AccountData?.data?.mt5AccountList)?.filter(item => item?.accountType === "REAL")?.length > 0;

    const isEmailVerified = !isLoading && data?.data?.userData?.isEmailVerified;
    const isMobileVerified = !isLoading && data?.data?.userData?.isMobileVerified;
    const isNameRegistered = !isLoading && data?.data?.userData?.name;
    const levelOneVerification = !!(isEmailVerified && isNameRegistered);

    function handleAccountToggle(newAlignment) {
        if (newAlignment) {
            dispatch(setActiveMT5AccountType(newAlignment));
        }
    }

    function handleAccount(activeMT5AccountType) {
        if (activeMT5AccountType === "Real") {
            return haveRealMT5Account ? <Account /> : <HeroOpenAccountPage />;
        } else {
            return haveDemoMT5Account ? <Account /> : <HeroOpenAccountPage />;
        }
    }

    useEffect(() => {
        if (!activeMT5AccountType) {
            dispatch(setActiveMT5AccountType("Real"));
        }
    }, [dispatch, activeMT5AccountType]);

    return (
        <Stack sx={{ width: "100%" }}>
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Wallet Card Section */}
                <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <WalletCard />
                </Box>

                {/* Header with Title and Button */}
                <Stack
                    sx={{
                        mb: 3,
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 2, sm: 0 }
                    }}
                >
                    <Typography 
                        sx={{ 
                            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }, 
                            fontWeight: 700,
                            lineHeight: 1.2
                        }}
                    >
                        Your Trading Account
                    </Typography>
                    
                    <Tooltip 
                        title={!levelOneVerification ? "Complete level one verification to open an account" : ""}
                        placement="top"
                    >
                        <Box>
                            <Button
                                component={Link}
                                to={levelOneVerification ? "/client/newAccount" : "#"}
                                variant="contained"
                                startIcon={<AddIcon />}
                                disabled={!levelOneVerification}
                                sx={{
                                    textTransform: "none",
                                    bgcolor: "#f3f5f7",
                                    color: "#000",
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    boxShadow: "none",
                                    "&:hover": {
                                        bgcolor: "#e8eaed",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    },
                                    "&.Mui-disabled": {
                                        bgcolor: "#f3f5f7",
                                        color: "#999",
                                    },
                                    minWidth: { xs: "100%", sm: "auto" }
                                }}
                            >
                                Open New Account
                            </Button>
                        </Box>
                    </Tooltip>
                </Stack>

                {/* Tab Component */}
                <Box sx={{ mb: 3 }}>
                    <TabComponent
                        boxSx={{
                            width: "100%",
                            maxWidth: { xs: "100%", sm: "400px" }
                        }}
                        items={["Real", "Demo"]}
                        onChange={(_, newAlignment) => handleAccountToggle(newAlignment)}
                        active={activeMT5AccountType}
                    />
                </Box>

                {/* Account Content Section */}
                <Box sx={{ mb: 4 }}>
                    {isLoading || mt5AccountLoading ? (
                        <Box 
                            sx={{ 
                                display: "flex", 
                                justifyContent: "center", 
                                alignItems: "center", 
                                minHeight: "200px" 
                            }}
                        >
                            <Loader />
                        </Box>
                    ) : (
                        <Box sx={{ 
                            animation: "fadeIn 0.3s ease-in",
                            "@keyframes fadeIn": {
                                "0%": { opacity: 0 },
                                "100%": { opacity: 1 }
                            }
                        }}>
                            {handleAccount(activeMT5AccountType)}
                        </Box>
                    )}
                </Box>
            </Container>
        </Stack>
    );
}

export default MyAccount;