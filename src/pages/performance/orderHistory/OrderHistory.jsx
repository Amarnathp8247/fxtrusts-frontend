import { 
  Container, 
  Stack, 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  alpha, 
  useTheme,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  MenuItem,
  Select
} from '@mui/material';
import OrderHistoryTable from './orderHistoryTable/OrderHistoryTable';
import Toggle from '../../../components/Toggle';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useGetUserDataQuery } from '../../../globalState/userState/userStateApis';
import { useSelector } from 'react-redux';
import { initiatePositionSocketConnection } from '../../../socketENV/positionSocketENV';
import { useClosedOrderListQuery } from '../../../globalState/trade/tradeApis';
import HeroOpenAccountPage from '../../myAccount/liveAccount/heroOpenAccountPage/HeroOpenAccountPage';
import Loader from '../../../components/Loader';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const toggleItems = [
  { name: "Open positions", icon: null },
  { name: "Closed positions", icon: null }
];

function OrderHistory({ login }) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [active, setActive] = useState(toggleItems[0]?.name);
  const [accountType, setAccountType] = useState("");
  const [MT5Account, setMT5Account] = useState("");
  const [positionData, setPositionData] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const socketRef = useRef(null);
  const { token } = useSelector((state) => state.auth);

  const { data, isLoading } = useGetUserDataQuery(undefined, {
      skip: !token,
      refetchOnMountOrArgChange: true,
  });

  const mt5AccountList = data?.data?.mt5AccountList || [];

  // Separate REAL and DEMO accounts
  const realMT5Accounts = useMemo(() => {
    return mt5AccountList
      .filter(item => item?.accountType?.toLowerCase() === "real")
      .map(item => item.Login);
  }, [mt5AccountList]);

  const demoMT5Accounts = useMemo(() => {
    return mt5AccountList
      .filter(item => item?.accountType?.toLowerCase() === "demo")
      .map(item => item.Login);
  }, [mt5AccountList]);

  // Get account details by login
  const mt5AccountDetails = useMemo(() => {
    const details = {};
    mt5AccountList.forEach(item => {
      details[item.Login] = item;
    });
    return details;
  }, [mt5AccountList]);

  // Determine available account types
  const allAccountTypes = useMemo(() => {
    const types = [];
    if (realMT5Accounts.length > 0) types.push("REAL");
    if (demoMT5Accounts.length > 0) types.push("DEMO");
    return types;
  }, [realMT5Accounts, demoMT5Accounts]);

  // Get current list of accounts based on selected type
  const currentAccountList = useMemo(() => {
    if (accountType === "REAL") return realMT5Accounts;
    if (accountType === "DEMO") return demoMT5Accounts;
    return [];
  }, [accountType, realMT5Accounts, demoMT5Accounts]);

  // Get current account details
  const currentAccountDetails = useMemo(() => {
    if (!MT5Account) return null;
    return mt5AccountDetails[MT5Account] || null;
  }, [MT5Account, mt5AccountDetails]);

  // Initialize account type and account on mount
  useEffect(() => {
    if (login) return; // Skip if login prop is provided
    
    // Set default account type
    let defaultType = "";
    let defaultAccount = "";
    
    if (realMT5Accounts.length > 0) {
      defaultType = "REAL";
      defaultAccount = realMT5Accounts[0];
    } else if (demoMT5Accounts.length > 0) {
      defaultType = "DEMO";
      defaultAccount = demoMT5Accounts[0];
    }
    
    if (defaultType && defaultAccount) {
      setAccountType(defaultType);
      setMT5Account(defaultAccount);
    }
  }, [realMT5Accounts, demoMT5Accounts, login]);

  // Handle account type change
  const handleChangeAccountType = (event) => {
    const newType = event.target.value;
    setAccountType(newType);
    setPositionData(null);
    setIsTableLoading(true);
    
    if (!login) {
      // Get first account of new type
      const newAccounts = newType === "REAL" ? realMT5Accounts : demoMT5Accounts;
      if (newAccounts.length > 0) {
        setMT5Account(newAccounts[0]);
      } else {
        setMT5Account("");
      }
    }
  };

  // Handle account change
  const handleChangeAccount = (e) => {
    const newAccount = e.target.value;
    if (newAccount !== MT5Account) {
      setMT5Account(newAccount);
      setPositionData(null);
      setIsTableLoading(true);
    }
  };

  // Socket connection for open positions
  useEffect(() => {
      const currentLogin = login ? login : MT5Account;
      
      if (!currentLogin || !token || active !== "Open positions") {
          if (socketRef.current) {
              socketRef.current.disconnect();
              socketRef.current = null;
          }
          return;
      }

      setIsTableLoading(true);

      if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
      }

      socketRef.current = initiatePositionSocketConnection({
          login: currentLogin,
          token,
          handlePositionData: (data) => {
              setPositionData(data);
              setIsTableLoading(false);
          },
      });

      return () => {
          if (socketRef.current) {
              socketRef.current.disconnect();
              socketRef.current = null;
          }
          setPositionData(null);
      };
  }, [login, MT5Account, token, active]);

  // Closed orders query
  const { data: closedOrderData, isFetching: isClosedOrderFetching } =
      useClosedOrderListQuery(
          { login: login ? login : MT5Account },
          { 
              skip: !token || !(login ? login : MT5Account) || active !== "Closed positions",
              refetchOnMountOrArgChange: true
          }
      );

  const closedOrders = closedOrderData?.data;

  // Update loading state for closed orders
  useEffect(() => {
      if (active === "Closed positions") {
          if (isClosedOrderFetching) {
              setIsTableLoading(true);
          } else if (closedOrderData) {
              setIsTableLoading(false);
          }
      }
  }, [active, isClosedOrderFetching, closedOrderData]);

  const isTableDataLoading = isTableLoading || 
      (active === "Closed positions" && isClosedOrderFetching);

  if (isLoading) return <Loader />;
  if (!login && !mt5AccountList.length) return <HeroOpenAccountPage />;

  return (
      <Container 
          maxWidth={false} 
          disableGutters
          sx={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
          }}
      >
          <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              p: { xs: 2, sm: 3, md: 3 },
              py: '0px'
          }}>
              {/* Header Section */}
              <Box sx={{ mb: { xs: 2, md: 1 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <AccountBalanceWalletIcon 
                          sx={{ 
                              color: 'primary.main',
                              fontSize: { xs: '1.5rem', md: '2rem' }
                          }} 
                      />
                      <Typography 
                          variant="h4" 
                          fontWeight={700}
                          sx={{ 
                              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                              color: 'text.primary'
                          }}
                      >
                          Order History
                      </Typography>
                  </Stack>
              </Box>

              {/* Controls Section - Single Row Layout */}
              <Paper 
                  elevation={0}
                  sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: '12px',
                      backgroundColor: 'background.paper',
                      border: `1px solid ${alpha(
                          isDarkMode ? theme.palette.divider : theme.palette.grey[200], 
                          0.5
                      )}`,
                      boxShadow: isDarkMode 
                          ? '0 4px 20px rgba(0,0,0,0.2)' 
                          : '0 2px 12px rgba(0,0,0,0.05)',
                      mb: { xs: 2.5, md: 3 },
                      width: '100%'
                  }}
              >
                  <Stack 
                      direction={{ xs: 'column', md: 'row' }} 
                      spacing={{ xs: 3, md: 4 }}
                      alignItems={{ xs: 'stretch', md: 'flex-start' }}
                  >
                      {/* Left Side: Account Selection (when no login) */}
                      {!login && (
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack spacing={2.5}>
                                  {/* Account Type Selection - Radio Buttons */}
                                  <Box>
                                      <Typography 
                                          variant="subtitle2" 
                                          fontWeight={600}
                                          sx={{ 
                                              color: 'text.secondary',
                                              mb: 1.5,
                                              fontSize: '0.875rem',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1
                                          }}
                                      >
                                          <Box 
                                              sx={{ 
                                                  width: '4px', 
                                                  height: '14px', 
                                                  bgcolor: 'primary.main',
                                                  borderRadius: '2px'
                                              }} 
                                          />
                                          Account Type
                                      </Typography>
                                      
                                      <FormControl component="fieldset">
                                          <RadioGroup
                                              row
                                              aria-label="account-type"
                                              name="account-type-radio-group"
                                              value={accountType}
                                              onChange={handleChangeAccountType}
                                              sx={{ gap: { xs: 2, sm: 3 } }}
                                          >
                                              {allAccountTypes.includes("REAL") && (
                                                  <FormControlLabel 
                                                      value="REAL" 
                                                      control={
                                                          <Radio 
                                                              size="small"
                                                              sx={{
                                                                  color: isDarkMode ? theme.palette.grey[400] : theme.palette.grey[600],
                                                                  '&.Mui-checked': {
                                                                      color: theme.palette.primary.main,
                                                                  }
                                                              }}
                                                          />
                                                      } 
                                                      label={
                                                          <Typography variant="body2" sx={{ 
                                                              fontWeight: accountType === "REAL" ? 600 : 400,
                                                              color: accountType === "REAL" ? 'text.primary' : 'text.secondary',
                                                              fontSize: '0.875rem'
                                                          }}>
                                                              Real Accounts
                                                          </Typography>
                                                      }
                                                      sx={{ mr: 0 }}
                                                  />
                                              )}
                                              
                                              {allAccountTypes.includes("DEMO") && (
                                                  <FormControlLabel 
                                                      value="DEMO" 
                                                      control={
                                                          <Radio 
                                                              size="small"
                                                              sx={{
                                                                  color: isDarkMode ? theme.palette.grey[400] : theme.palette.grey[600],
                                                                  '&.Mui-checked': {
                                                                      color: theme.palette.info.main,
                                                                  }
                                                              }}
                                                          />
                                                      } 
                                                      label={
                                                          <Typography variant="body2" sx={{ 
                                                              fontWeight: accountType === "DEMO" ? 600 : 400,
                                                              color: accountType === "DEMO" ? 'text.primary' : 'text.secondary',
                                                              fontSize: '0.875rem'
                                                          }}>
                                                              Demo Accounts
                                                          </Typography>
                                                      }
                                                      sx={{ mr: 0 }}
                                                  />
                                              )}
                                          </RadioGroup>
                                      </FormControl>

                                      {/* Account Type Counts */}
                                      <Box sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 1,
                                          mt: 1,
                                          flexWrap: 'wrap'
                                      }}>
                                          {allAccountTypes.includes("REAL") && (
                                              <Chip
                                                  label={`${realMT5Accounts.length} Real`}
                                                  size="small"
                                                  variant={accountType === "REAL" ? "filled" : "outlined"}
                                                  color="primary"
                                                  sx={{
                                                      fontWeight: 500,
                                                      fontSize: '0.75rem',
                                                      height: '26px',
                                                      backgroundColor: accountType === "REAL" 
                                                          ? alpha(theme.palette.primary.main, 0.1)
                                                          : 'transparent',
                                                      borderColor: alpha(theme.palette.primary.main, 0.3),
                                                      color: accountType === "REAL" 
                                                          ? theme.palette.primary.main 
                                                          : 'text.secondary',
                                                      '& .MuiChip-label': {
                                                          px: 1.5
                                                      }
                                                  }}
                                              />
                                          )}
                                          
                                          {allAccountTypes.includes("DEMO") && (
                                              <Chip
                                                  label={`${demoMT5Accounts.length} Demo`}
                                                  size="small"
                                                  variant={accountType === "DEMO" ? "filled" : "outlined"}
                                                  color="info"
                                                  sx={{
                                                      fontWeight: 500,
                                                      fontSize: '0.75rem',
                                                      height: '26px',
                                                      backgroundColor: accountType === "DEMO" 
                                                          ? alpha(theme.palette.info.main, 0.1)
                                                          : 'transparent',
                                                      borderColor: alpha(theme.palette.info.main, 0.3),
                                                      color: accountType === "DEMO" 
                                                          ? theme.palette.info.main 
                                                          : 'text.secondary',
                                                      '& .MuiChip-label': {
                                                          px: 1.5
                                                      }
                                                  }}
                                              />
                                          )}
                                      </Box>
                                  </Box>

                                  {/* Account Number Selection - USING MUI SELECT DIRECTLY */}
                                  <Box>
                                      <Typography 
                                          variant="subtitle2" 
                                          fontWeight={600}
                                          sx={{ 
                                              color: 'text.secondary',
                                              mb: 1.5,
                                              fontSize: '0.875rem',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1
                                          }}
                                      >
                                          <Box 
                                              sx={{ 
                                                  width: '4px', 
                                                  height: '14px', 
                                                  bgcolor: 'primary.main',
                                                  borderRadius: '2px'
                                              }} 
                                          />
                                          Account Number
                                      </Typography>
                                      <FormControl fullWidth size="small">
                                          <Select
                                              value={MT5Account || ""}
                                              onChange={handleChangeAccount}
                                              displayEmpty
                                              sx={{
                                                  borderRadius: '8px',
                                                  backgroundColor: isDarkMode 
                                                      ? alpha(theme.palette.background.default, 0.5)
                                                      : theme.palette.grey[50],
                                                  height: '44px',
                                                  '&:hover': {
                                                      backgroundColor: isDarkMode 
                                                          ? alpha(theme.palette.background.default, 0.7)
                                                          : theme.palette.grey[100],
                                                  },
                                                  '&.Mui-focused': {
                                                      backgroundColor: isDarkMode 
                                                          ? alpha(theme.palette.background.default, 0.8)
                                                          : theme.palette.grey[100],
                                                      '& .MuiOutlinedInput-notchedOutline': {
                                                          borderColor: accountType === "REAL" 
                                                              ? theme.palette.primary.main 
                                                              : theme.palette.info.main,
                                                          borderWidth: '2px'
                                                      }
                                                  },
                                                  '& .MuiSelect-select': {
                                                      fontFamily: 'monospace',
                                                      fontWeight: 500,
                                                      letterSpacing: '0.5px',
                                                      color: 'text.primary'
                                                  }
                                              }}
                                          >
                                              {currentAccountList.map((account) => (
                                                  <MenuItem key={account} value={account}>
                                                      <Typography 
                                                          variant="body2" 
                                                          sx={{ 
                                                              fontFamily: 'monospace',
                                                              fontWeight: 500
                                                          }}
                                                      >
                                                          {account}
                                                      </Typography>
                                                  </MenuItem>
                                              ))}
                                          </Select>
                                      </FormControl>
                                  </Box>

                                  {/* Selected Account Info */}
                                  {currentAccountDetails && MT5Account && (
                                      <Box
                                          sx={{
                                              p: 1.5,
                                              borderRadius: '8px',
                                              backgroundColor: isDarkMode 
                                                  ? alpha(
                                                      accountType === "REAL" 
                                                          ? theme.palette.primary.main 
                                                          : theme.palette.info.main, 
                                                      0.08
                                                  )
                                                  : alpha(
                                                      accountType === "REAL" 
                                                          ? theme.palette.primary.main 
                                                          : theme.palette.info.main, 
                                                      0.04
                                                  ),
                                              border: `1px solid ${alpha(
                                                  accountType === "REAL" 
                                                      ? theme.palette.primary.main 
                                                      : theme.palette.info.main, 
                                                  isDarkMode ? 0.2 : 0.1
                                              )}`,
                                              mt: 0.5
                                          }}
                                      >
                                          <Stack direction="row" alignItems="center" spacing={1.5}>
                                              <AccountBalanceWalletIcon 
                                                  fontSize="small" 
                                                  sx={{ 
                                                      color: accountType === "REAL" 
                                                          ? 'primary.main' 
                                                          : 'info.main'
                                                  }} 
                                              />
                                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                                  <Typography 
                                                      variant="caption" 
                                                      sx={{ 
                                                          color: 'text.secondary',
                                                          fontSize: '0.75rem',
                                                          display: 'block'
                                                      }}
                                                  >
                                                      Selected Account
                                                  </Typography>
                                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
                                                      <Typography 
                                                          variant="body2" 
                                                          fontWeight={600}
                                                          sx={{ 
                                                              color: 'text.primary',
                                                              fontFamily: 'monospace',
                                                              fontSize: '0.875rem'
                                                          }}
                                                          noWrap
                                                      >
                                                          {MT5Account}
                                                      </Typography>
                                                      <Chip
                                                          label={accountType === "REAL" ? "Real" : "Demo"}
                                                          size="small"
                                                          color={accountType === "REAL" ? "primary" : "info"}
                                                          sx={{
                                                              height: '22px',
                                                              fontSize: '0.7rem',
                                                              fontWeight: 600,
                                                              backgroundColor: isDarkMode 
                                                                  ? alpha(
                                                                      accountType === "REAL" 
                                                                          ? theme.palette.primary.main 
                                                                          : theme.palette.info.main, 
                                                                      0.15
                                                                  )
                                                                  : undefined
                                                          }}
                                                      />
                                                  </Stack>
                                              </Box>
                                          </Stack>
                                      </Box>
                                  )}
                              </Stack>
                          </Box>
                      )}

                      {/* Vertical Divider */}
                      {!login && (
                          <Box 
                              sx={{ 
                                  width: { xs: '100%', md: '1px' },
                                  height: { xs: '1px', md: 'auto' },
                                  backgroundColor: alpha(
                                      isDarkMode ? theme.palette.divider : theme.palette.grey[300], 
                                      0.5
                                  ),
                                  my: { xs: 1, md: 0 },
                                  mx: { xs: 0, md: 3 }
                              }} 
                          />
                      )}

                      {/* Right Side: View Type Selection */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack spacing={2.5}>
                              <Typography 
                                  variant="subtitle2" 
                                  fontWeight={600}
                                  sx={{ 
                                      color: 'text.secondary',
                                      mb: 1.5,
                                      fontSize: '0.875rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                  }}
                              >
                                  <Box 
                                      sx={{ 
                                          width: '4px', 
                                          height: '14px', 
                                          bgcolor: 'secondary.main',
                                          borderRadius: '2px'
                                      }} 
                                  />
                                  View Type
                              </Typography>

                              {/* Toggle Buttons */}
                              <Box>
                                  <Toggle
                                      items={toggleItems}
                                      active={active}
                                      onChange={setActive}
                                      stackSx={{ 
                                          width: '100%'
                                      }}
                                      toggleButtonSx={{ 
                                          fontSize: '0.875rem',
                                          fontWeight: 500,
                                          px: { xs: 1.5, md: 2 },
                                          py: 1.25,
                                          borderRadius: '8px',
                                          textTransform: 'none',
                                          flex: 1,
                                          transition: 'all 0.2s ease',
                                          '&.Mui-selected': {
                                              backgroundColor: 'primary.main',
                                              color: 'primary.contrastText',
                                              boxShadow: isDarkMode 
                                                  ? '0 2px 8px rgba(0,0,0,0.3)' 
                                                  : '0 2px 8px rgba(0,0,0,0.1)',
                                              '&:hover': {
                                                  backgroundColor: 'primary.dark',
                                              }
                                          },
                                          '&:not(.Mui-selected)': {
                                              backgroundColor: isDarkMode 
                                                  ? alpha(theme.palette.background.default, 0.6)
                                                  : theme.palette.grey[50],
                                              border: `1px solid ${alpha(
                                                  isDarkMode ? theme.palette.divider : theme.palette.grey[300], 
                                                  0.5
                                              )}`,
                                              color: 'text.secondary',
                                              '&:hover': {
                                                  backgroundColor: isDarkMode 
                                                      ? alpha(theme.palette.action.hover, 0.08)
                                                      : alpha(theme.palette.action.hover, 0.04),
                                                  borderColor: theme.palette.primary.light,
                                              }
                                          }
                                      }}
                                      toggleButtonGroupSx={{ 
                                          width: '100%',
                                          height: 'auto',
                                          backgroundColor: 'transparent',
                                          '& .MuiToggleButtonGroup-grouped': {
                                              flex: 1,
                                              '&:not(:first-of-type)': {
                                                  marginLeft: { xs: '6px', md: '8px' },
                                                  borderRadius: '8px'
                                              },
                                              '&:first-of-type': {
                                                  borderRadius: '8px'
                                              }
                                          }
                                      }}
                                  />
                                  
                                  {/* Status Indicator */}
                                  <Stack 
                                      direction="row" 
                                      alignItems="center" 
                                      spacing={1.5}
                                      sx={{ 
                                          mt: 2.5,
                                          p: 1.5,
                                          borderRadius: '8px',
                                          backgroundColor: isDarkMode 
                                              ? alpha(
                                                  isTableDataLoading ? theme.palette.warning.main : theme.palette.success.main, 
                                                  0.12
                                              )
                                              : alpha(
                                                  isTableDataLoading ? theme.palette.warning.main : theme.palette.success.main, 
                                                  0.08
                                              ),
                                          border: `1px solid ${alpha(
                                              isTableDataLoading ? theme.palette.warning.main : theme.palette.success.main, 
                                              isDarkMode ? 0.2 : 0.15
                                          )}`,
                                      }}
                                  >
                                      <Box
                                          sx={{
                                              width: '10px',
                                              height: '10px',
                                              borderRadius: '50%',
                                              backgroundColor: isTableDataLoading ? 'warning.main' : 'success.main',
                                              animation: isTableDataLoading ? 'pulse 1.5s infinite' : 'none',
                                              '@keyframes pulse': {
                                                  '0%': { opacity: 1 },
                                                  '50%': { opacity: 0.5 },
                                                  '100%': { opacity: 1 }
                                              }
                                          }}
                                      />
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                          <Typography 
                                              variant="caption" 
                                              fontWeight={600}
                                              sx={{ 
                                                  color: 'text.secondary',
                                                  fontSize: '0.7rem',
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '0.5px',
                                                  display: 'block'
                                              }}
                                          >
                                              Status
                                          </Typography>
                                          <Typography 
                                              variant="body2" 
                                              fontWeight={500}
                                              sx={{ 
                                                  color: isTableDataLoading ? 'warning.main' : 'success.main',
                                                  fontSize: '0.8125rem',
                                                  mt: 0.25
                                              }}
                                              noWrap
                                          >
                                              {isTableDataLoading 
                                                  ? 'Loading data...' 
                                                  : active === 'Open positions' 
                                                      ? 'Live positions feed active' 
                                                      : 'Historical data loaded'}
                                          </Typography>
                                      </Box>
                                  </Stack>

                                  {/* Account Status Summary */}
                                  <Box
                                      sx={{
                                          mt: 2,
                                          p: 1.5,
                                          borderRadius: '8px',
                                          backgroundColor: isDarkMode 
                                              ? alpha(theme.palette.info.main, 0.08)
                                              : alpha(theme.palette.info.main, 0.04),
                                          border: `1px solid ${alpha(
                                              theme.palette.info.main,
                                              isDarkMode ? 0.2 : 0.1
                                          )}`,
                                      }}
                                  >
                                      <Typography 
                                          variant="caption" 
                                          fontWeight={600}
                                          sx={{ 
                                              color: 'text.secondary',
                                              fontSize: '0.7rem',
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.5px',
                                              display: 'block',
                                              mb: 0.5
                                          }}
                                      >
                                          Account Summary
                                      </Typography>
                                      <Stack direction="row" spacing={2} alignItems="center">
                                          <Typography 
                                              variant="body2" 
                                              sx={{ 
                                                  color: 'text.primary',
                                                  fontSize: '0.8125rem',
                                                  fontWeight: 500
                                              }}
                                          >
                                              {accountType === "REAL" ? "Real" : "Demo"} Account
                                          </Typography>
                                          <Box sx={{ flex: 1 }} />
                                          <Chip
                                              label={active === "Open positions" ? "Open View" : "Closed View"}
                                              size="small"
                                              color={active === "Open positions" ? "success" : "info"}
                                              sx={{
                                                  height: '22px',
                                                  fontSize: '0.7rem',
                                                  fontWeight: 600,
                                                  backgroundColor: isDarkMode 
                                                      ? alpha(
                                                          active === "Open positions" 
                                                              ? theme.palette.success.main 
                                                              : theme.palette.info.main, 
                                                          0.15
                                                      )
                                                      : undefined
                                              }}
                                          />
                                      </Stack>
                                  </Box>
                              </Box>
                          </Stack>
                      </Box>
                  </Stack>
              </Paper>

              {/* Table Section */}
              <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0
              }}>
                  <OrderHistoryTable
                      data={active === "Open positions" ? positionData : closedOrders}
                      activeTab={active}
                      isLoading={isTableDataLoading}
                      accountType={accountType}
                      selectedAccount={login ? login : MT5Account}
                  />
              </Box>
          </Box>
      </Container>
  );
}

export default OrderHistory;