import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import {
    Box,
    Button,
    Container,
    Typography,
    Stack,
    Paper,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Grid,
    FormControl,
    Select,
    MenuItem,
    useTheme
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTransactionListQuery } from '../../../globalState/userState/userStateApis';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { TransactionsListHeaderColumn } from './TransactionsListHeaderColumn';
import { handleExportToExcel } from '../../../utils/exportToExcel';

const STATUS_OPTIONS = [
    { value: "", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "COMPLETED", label: "Completed" },
    { value: "PROCESSING", label: "Processing" },
    { value: "REJECTED", label: "Rejected" }
];

const TRANSACTION_TYPES = [
    { value: "", label: "All Types" },
    { value: "INTERNAL-DEPOSIT", label: "Internal Deposit" },
    { value: "INTERNAL-WITHDRAW", label: "Internal Withdraw" },
    { value: "WALLET-DEPOSIT", label: "Wallet Deposit" },
    { value: "WALLET-WITHDRAW", label: "Wallet Withdraw" },
    { value: "IB-WITHDRAW", label: "IB Withdraw" },
    { value: "INTERNAL-TRANSFER", label: "Internal Transfer" },
    { value: "CREDIT-DEPOSIT", label: "Credit Deposit" },
    { value: "BONUS-DEPOSIT", label: "Bonus Deposit" },
    { value: "CREDIT-WITHDRAW", label: "Credit Withdraw" },
    { value: "BONUS-WITHDRAW", label: "Bonus Withdraw" }
];

const PAYMENT_METHODS = [
    { value: "", label: "All Methods" },
    { value: "BANK", label: "Bank" },
    { value: "CASH", label: "Cash" },
    { value: "CRYPTO", label: "Crypto" }
];

function TransactionsList({ marginTop, login }) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [globalFilter, setGlobalFilter] = useState("");
    const [filters, setFilters] = useState({
        status: "",
        transactionType: "",
        paymentMethod: "",
        fromDate: null,
        toDate: null,
    });

    const formattedFromDate = filters.fromDate ? dayjs(filters.fromDate).format('YYYY-MM-DD') : undefined;
    const formattedToDate = filters.toDate ? dayjs(filters.toDate).format('YYYY-MM-DD') : undefined;

    const { data: listData, isLoading, isError, error, refetch } = useTransactionListQuery({
        page: pagination.pageIndex + 1,
        sizePerPage: pagination.pageSize,
        search: globalFilter,
        ...filters,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        login
    });

    const showError = error?.data?.message;
    const list = listData?.data?.usersList || [];
    const totalRecords = listData?.data?.totalRecords || 0;

    const handleDownloadExcel = () => {
        handleExportToExcel(list, `Transactions_${login}_${dayjs().format('YYYY-MM-DD')}.xlsx`, dispatch);
    };

    const handleRefresh = () => {
        refetch();
    };

    const handleClearFilters = () => {
        setFilters({
            status: "",
            transactionType: "",
            paymentMethod: "",
            fromDate: null,
            toDate: null,
        });
        setGlobalFilter("");
    };

    const columns = useMemo(() => TransactionsListHeaderColumn, []);
    const data = useMemo(() => list, [list]);
    const rowCount = useMemo(() => totalRecords, [totalRecords]);

    const activeFilterCount = Object.values(filters).filter(value =>
        value !== "" && value !== null
    ).length + (globalFilter ? 1 : 0);

    // Dark mode colors
    const backgroundColor = isDarkMode ? theme.palette.background.paper : '#fafafa';
    const paperBackground = isDarkMode ? theme.palette.background.paper : '#ffffff';
    const borderColor = isDarkMode ? theme.palette.divider : '#e0e0e0';
    const headerBackground = isDarkMode ? theme.palette.grey[900] : '#f5f5f5';
    const inputBackground = isDarkMode ? theme.palette.background.default : '#ffffff';
    const iconColor = isDarkMode ? theme.palette.text.secondary : '#666';

    const table = useMaterialReactTable({
        columns: columns,
        data: isError ? [] : data,
        enableColumnFilters: false,
        enableSorting: false,
        enableColumnActions: false,
        manualPagination: true,
        manualFiltering: true,
        rowCount: rowCount,

        // Table Styling
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                border: `1px solid ${borderColor}`,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: paperBackground
            }
        },

        muiTableHeadRowProps: {
            sx: {
                backgroundColor: headerBackground,
            }
        },

        muiTableHeadCellProps: {
            sx: {
                fontWeight: 600,
                fontSize: '0.875rem',
                py: 1.5,
                color: isDarkMode ? theme.palette.common.white : '#333',
                borderBottom: `1px solid ${borderColor}`,
            }
        },

        muiTableBodyRowProps: {
            sx: {
                '&:hover': {
                    backgroundColor: isDarkMode ? 
                        theme.palette.action.hover : 
                        '#f9f9f9',
                },
                borderBottom: `1px solid ${borderColor}`,
            }
        },

        muiTableBodyCellProps: {
            sx: {
                py: 1.5,
                fontSize: '0.875rem',
                color: isDarkMode ? theme.palette.text.secondary : '#555',
                borderBottom: `1px solid ${borderColor}`,
            }
        },

        muiPaginationProps: {
            rowsPerPageOptions: [5, 10, 25, 50],
            showRowsPerPage: true,
            sx: {
                backgroundColor: paperBackground,
                borderTop: `1px solid ${borderColor}`,
            }
        },

        // State
        state: {
            pagination,
            globalFilter,
            isLoading,
            showAlertBanner: isError,
        },

        // Handlers
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,

        // Display
        columnFilterDisplayMode: "popover",
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',

        muiToolbarAlertBannerProps: isError
            ? {
                color: 'error',
                children: showError || 'Error loading transactions.',
            }
            : undefined,

        // Render custom top toolbar
        renderTopToolbar: ({ table }) => (
            <Box sx={{ 
                p: 2, 
                borderBottom: `1px solid ${borderColor}`, 
                backgroundColor: headerBackground 
            }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600, 
                            color: isDarkMode ? theme.palette.common.white : '#333' 
                        }}>
                            Transaction Records
                        </Typography>
                        <Chip
                            label={`${totalRecords} records`}
                            size="small"
                            variant="outlined"
                            sx={{ 
                                fontSize: '0.75rem',
                                color: isDarkMode ? theme.palette.text.secondary : 'inherit',
                                borderColor: isDarkMode ? theme.palette.divider : undefined
                            }}
                        />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            onClick={handleRefresh}
                            size="small"
                            sx={{ 
                                border: `1px solid ${borderColor}`,
                                color: iconColor,
                                '&:hover': {
                                    backgroundColor: isDarkMode ? 
                                        theme.palette.action.hover : 
                                        'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                        <Button
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleDownloadExcel}
                            size="small"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': { 
                                    backgroundColor: theme.palette.primary.dark 
                                }
                            }}
                        >
                            Export Excel
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        ),
    });

    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 }, mt: marginTop || 0 }}>
                {/* Title Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant='h5'
                        fontWeight={600}
                        fontSize="1.5rem"
                        color="text.primary"
                        gutterBottom
                    >
                        Accounts Transaction History
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        View and manage all transaction records
                    </Typography>
                </Box>

                {/* Filters Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        border: `1px solid ${borderColor}`,
                        borderRadius: 2,
                        backgroundColor: backgroundColor
                    }}
                >
                    {/* Filters Header */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 3 
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <FilterListIcon sx={{ color: iconColor, fontSize: 20 }} />
                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                Filters
                            </Typography>
                            {activeFilterCount > 0 && (
                                <Chip
                                    label={`${activeFilterCount} active`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    onDelete={handleClearFilters}
                                    sx={{
                                        color: theme.palette.primary.main,
                                        borderColor: theme.palette.primary.main
                                    }}
                                />
                            )}
                        </Stack>
                        {activeFilterCount > 0 && (
                            <Button
                                variant="text"
                                startIcon={<ClearIcon />}
                                onClick={handleClearFilters}
                                size="small"
                                sx={{
                                    color: iconColor,
                                    fontSize: '0.875rem',
                                    '&:hover': { 
                                        color: theme.palette.error.main,
                                        backgroundColor: isDarkMode ? 
                                            'rgba(244, 67, 54, 0.08)' : 
                                            'rgba(211, 47, 47, 0.04)'
                                    }
                                }}
                            >
                                Clear All
                            </Button>
                        )}
                    </Box>

                    {/* Search Bar */}
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            placeholder="Search by reference, amount, remark, or any transaction detail..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            size="medium"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: iconColor }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    backgroundColor: inputBackground,
                                    borderRadius: 1,
                                    color: isDarkMode ? theme.palette.text.primary : 'inherit',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: isDarkMode ? theme.palette.text.secondary : undefined,
                                        opacity: 0.7
                                    }
                                }
                            }}
                        />
                    </Box>

                    {/* Filter Grid - Properly Aligned */}
                    <Grid container spacing={2.5} sx={{ alignItems: 'flex-end' }}>
                        {/* Status Filter - First Column */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    displayEmpty
                                    sx={{
                                        backgroundColor: inputBackground,
                                        color: isDarkMode ? theme.palette.text.primary : 'inherit',
                                        '& .MuiSelect-icon': {
                                            color: iconColor
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: isDarkMode ? theme.palette.divider : undefined
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: isDarkMode ? 
                                                    theme.palette.background.paper : 
                                                    '#ffffff',
                                                color: isDarkMode ? 
                                                    theme.palette.text.primary : 
                                                    'inherit'
                                            }
                                        }
                                    }}
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <MenuItem 
                                            key={option.value} 
                                            value={option.value}
                                            sx={{
                                                color: isDarkMode ? 
                                                    theme.palette.text.primary : 
                                                    'inherit'
                                            }}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Transaction Type Filter - Second Column */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={filters.transactionType}
                                    onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                                    displayEmpty
                                    sx={{
                                        backgroundColor: inputBackground,
                                        color: isDarkMode ? theme.palette.text.primary : 'inherit',
                                        '& .MuiSelect-icon': {
                                            color: iconColor
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: isDarkMode ? theme.palette.divider : undefined
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: isDarkMode ? 
                                                    theme.palette.background.paper : 
                                                    '#ffffff',
                                                color: isDarkMode ? 
                                                    theme.palette.text.primary : 
                                                    'inherit'
                                            }
                                        }
                                    }}
                                >
                                    {TRANSACTION_TYPES.map((option) => (
                                        <MenuItem 
                                            key={option.value} 
                                            value={option.value}
                                            sx={{
                                                color: isDarkMode ? 
                                                    theme.palette.text.primary : 
                                                    'inherit'
                                            }}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Payment Method Filter - Third Column */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={filters.paymentMethod}
                                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                    displayEmpty
                                    sx={{
                                        backgroundColor: inputBackground,
                                        color: isDarkMode ? theme.palette.text.primary : 'inherit',
                                        '& .MuiSelect-icon': {
                                            color: iconColor
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: isDarkMode ? theme.palette.divider : undefined
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: isDarkMode ? 
                                                    theme.palette.background.paper : 
                                                    '#ffffff',
                                                color: isDarkMode ? 
                                                    theme.palette.text.primary : 
                                                    'inherit'
                                            }
                                        }
                                    }}
                                >
                                    {PAYMENT_METHODS.map((option) => (
                                        <MenuItem 
                                            key={option.value} 
                                            value={option.value}
                                            sx={{
                                                color: isDarkMode ? 
                                                    theme.palette.text.primary : 
                                                    'inherit'
                                            }}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Date Range Filter - Fourth Column */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <DatePicker
                                    value={filters.fromDate}
                                    onChange={(newValue) => handleFilterChange('fromDate', newValue)}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            fullWidth: true,
                                            placeholder: "Start Date",
                                            sx: {
                                                backgroundColor: inputBackground,
                                                color: isDarkMode ? theme.palette.text.primary : 'inherit',
                                                '& .MuiInputBase-input': {
                                                    fontSize: '0.875rem',
                                                    color: isDarkMode ? theme.palette.text.primary : 'inherit',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: isDarkMode ? theme.palette.divider : undefined
                                                },
                                                '& .MuiInputBase-input::placeholder': {
                                                    color: isDarkMode ? theme.palette.text.secondary : undefined,
                                                    opacity: 0.7
                                                },
                                                '& .MuiIconButton-root': {
                                                    color: iconColor
                                                }
                                            }
                                        },
                                        field: { clearable: true },
                                    }}
                                />
                                <DatePicker
                                    value={filters.toDate}
                                    onChange={(newValue) => handleFilterChange('toDate', newValue)}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            fullWidth: true,
                                            placeholder: "End Date",
                                            sx: {
                                                backgroundColor: inputBackground,
                                                color: isDarkMode ? theme.palette.text.primary : 'inherit',
                                                '& .MuiInputBase-input': {
                                                    fontSize: '0.875rem',
                                                    color: isDarkMode ? theme.palette.text.primary : 'inherit',
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: isDarkMode ? theme.palette.divider : undefined
                                                },
                                                '& .MuiInputBase-input::placeholder': {
                                                    color: isDarkMode ? theme.palette.text.secondary : undefined,
                                                    opacity: 0.7
                                                },
                                                '& .MuiIconButton-root': {
                                                    color: iconColor
                                                }
                                            }
                                        },
                                        field: { clearable: true },
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Loading State */}
                {isLoading && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        minHeight: 400 
                    }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error State */}
                {isError && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        action={
                            <Button 
                                color="inherit" 
                                size="small" 
                                onClick={handleRefresh}
                                sx={{ color: isDarkMode ? theme.palette.text.primary : undefined }}
                            >
                                Retry
                            </Button>
                        }
                    >
                        {showError || 'Failed to load transactions. Please try again.'}
                    </Alert>
                )}

                {/* Table Section */}
                {!isLoading && !isError && (
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${borderColor}`,
                            backgroundColor: paperBackground
                        }}
                    >
                        <MaterialReactTable table={table} />
                    </Paper>
                )}

                {/* Empty State */}
                {!isLoading && !isError && list.length === 0 && (
                    <Paper
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            border: `1px dashed ${borderColor}`,
                            backgroundColor: backgroundColor,
                            borderRadius: 2
                        }}
                    >
                        <SearchIcon sx={{ 
                            fontSize: 48, 
                            color: isDarkMode ? theme.palette.text.secondary : '#999', 
                            mb: 2 
                        }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No transactions found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters or search terms
                        </Typography>
                    </Paper>
                )}
            </Container>
        </LocalizationProvider>
    );
}

export default TransactionsList;