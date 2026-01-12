import MetaDeposit from '../../myAccount/liveAccount/accountDetailsAccordian/MetaDeposit';
import MetaWithdraw from '../../myAccount/liveAccount/accountDetailsAccordian/MetaWithdraw';
import Grid from '@mui/material/Grid2';
import { useSelector } from 'react-redux';
import { useGetUserDataQuery } from '../../../globalState/userState/userStateApis';
import ChangeMaxLeverageModalContent from '../../myAccount/liveAccount/account/ChangeMaxLeverageModalContent';
import ChangeMT5PasswordModalDetails from '../../myAccount/ChangeMT5PasswordModalDetails';
import { useLocation } from 'react-router-dom';
import {
  Stack,
  Typography,
  Skeleton,
  useMediaQuery,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import ModalComponent from '../../../components/ModalComponent';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import LeverageIcon from '@mui/icons-material/TrendingFlat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function MT5AccountsActions({ login, detailsData }) {
  const { state } = useLocation();
  const modalWidth = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const leverage = state?.group?.leverage;
  const { token } = useSelector((state) => state.auth);
  const { refetch } = useGetUserDataQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  // Metrics configuration with icons
  const metricsConfig = {
    "Actual leverage": {
      icon: <LeverageIcon />,
      color: theme.palette.mode === 'dark' ? '#FF9800' : '#F57C00',
      bgColor: theme.palette.mode === 'dark' ? alpha('#FF9800', 0.15) : alpha('#FF9800', 0.08),
    },
    "Free margin": {
      icon: <AccountBalanceWalletIcon />,
      color: theme.palette.mode === 'dark' ? '#2196F3' : '#1565C0',
      bgColor: theme.palette.mode === 'dark' ? alpha('#2196F3', 0.15) : alpha('#2196F3', 0.08),
    },
    "Unrealized P&L": {
      icon: <TrendingUpIcon />,
      color: detailsData?.["Unrealized P&L"]?.includes('-')
        ? (theme.palette.mode === 'dark' ? '#F44336' : '#D32F2F')
        : (theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32'),
      bgColor: detailsData?.["Unrealized P&L"]?.includes('-')
        ? (theme.palette.mode === 'dark' ? alpha('#F44336', 0.15) : alpha('#F44336', 0.08))
        : (theme.palette.mode === 'dark' ? alpha('#4CAF50', 0.15) : alpha('#4CAF50', 0.08)),
    },
    "Equity": {
      icon: <AccountBalanceIcon />,
      color: theme.palette.mode === 'dark' ? '#4CAF50' : '#2E7D32',
      bgColor: theme.palette.mode === 'dark' ? alpha('#4CAF50', 0.15) : alpha('#4CAF50', 0.08),
    },
    "Credit": {
      icon: <CreditScoreIcon />,
      color: theme.palette.mode === 'dark' ? '#9C27B0' : '#7B1FA2',
      bgColor: theme.palette.mode === 'dark' ? alpha('#9C27B0', 0.15) : alpha('#9C27B0', 0.08),
    }
  };

  // Action buttons configuration
  const actionButtons = [
    {
      name: "Deposit",
      component: MetaDeposit,
      data: { login, refetch },
      color: 'primary',
      variant: 'contained',
      icon: <AccountBalanceWalletIcon />,
      description: "Add funds to your account"
    },
    {
      name: "Withdraw",
      component: MetaWithdraw,
      data: { login, refetch },
      color: 'secondary',
      variant: 'outlined',
      icon: <AccountBalanceWalletIcon />,
      description: "Withdraw funds from your account"
    },
    {
      name: "Leverage",
      component: ChangeMaxLeverageModalContent,
      data: { login, leverage },
      color: 'warning',
      variant: 'outlined',
      icon: <LeverageIcon />,
      description: "Adjust your trading leverage"
    },
    {
      name: "Main Password",
      component: ChangeMT5PasswordModalDetails,
      data: { login },
      color: 'info',
      variant: 'outlined',
      icon: <AccountCircleIcon />,
      description: "Change your account password"
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Account Summary Card */}
      <Paper
        elevation={theme.palette.mode === 'dark' ? 0 : 1}
        sx={{
          mb: 4,
          borderRadius: 2,
          border: `1px solid ${theme.palette.mode === 'dark'
            ? theme.palette.divider
            : alpha('#000', 0.12)}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : '#fff',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.primary.main, 0.05),
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Account Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time account metrics and balances
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {detailsData ? (
            <Grid container spacing={2}>
              {Object.entries(detailsData).map(([key, value], index) => {
                const config = metricsConfig[key];
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={key}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.mode === 'dark'
                          ? alpha(theme.palette.background.paper, 0.5)
                          : alpha('#fff', 0.8),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[2]
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              backgroundColor: config?.bgColor,
                              color: config?.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {config?.icon}
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontWeight: 500,
                              fontSize: '0.875rem'
                            }}
                          >
                            {key}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: config?.color,
                            fontSize: '1.1rem',
                            textAlign: 'center'
                          }}
                        >
                          {value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            // Skeleton loading state
            <Grid container spacing={2}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={item}>
                  <Card sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="text" width={80} height={24} />
                      </Stack>
                      <Skeleton variant="text" width="100%" height={32} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Account Actions Section */}
      <Paper
        elevation={theme.palette.mode === 'dark' ? 0 : 1}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.mode === 'dark'
            ? theme.palette.divider
            : alpha('#000', 0.12)}`,
          backgroundColor: theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : '#fff',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.secondary.main, 0.1)
              : alpha(theme.palette.secondary.main, 0.05),
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Account Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account settings and transactions
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={3}>
            {actionButtons.map((action, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.background.paper, 0.5)
                      : alpha('#fff', 0.8),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, height: '100%' }}>
                    <Stack
                      direction="column"
                      alignItems="center"
                      spacing={2}
                      sx={{ height: '100%' }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.mode === 'dark'
                            ? alpha(theme.palette[action.color]?.main || theme.palette.primary.main, 0.15)
                            : alpha(theme.palette[action.color]?.main || theme.palette.primary.main, 0.1),
                          color: theme.palette[action.color]?.main || theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {action.icon}
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                        {action.name}
                      </Typography>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: 'center', mb: 2 }}
                      >
                        {action.description}
                      </Typography>

                      <Box sx={{ mt: 'auto', width: '100%' }}>
                        <ModalComponent
                          btnName={action.name}
                          Content={action.component}
                          contentData={action.data}
                          modalWidth={modalWidth ? "95%" : 500}
                          fullWidth
                          variant={action.variant}
                          color={action.color}
                          startIcon={action.icon}
                          sx={{
                            width: '100%',
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem'
                          }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

   
    </Box>
  );
}

export default MT5AccountsActions;