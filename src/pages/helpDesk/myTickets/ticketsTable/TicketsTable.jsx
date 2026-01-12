import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import { Stack, Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { useState, useMemo } from 'react';
import { TicketsTableColumnHeade } from './TicketsTableColumnHeade';
import Selector from '../../../../components/Selector';
import { useSupportTicketListQuery } from '../../../../globalState/supportState/supportStateApis';
import FilterListIcon from '@mui/icons-material/FilterList';

function TicketsTable() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [status, setStatus] = useState("");

    const { data: listData, isLoading, isError, error } = useSupportTicketListQuery({
        page: pagination.pageIndex + 1,
        sizePerPage: pagination.pageSize,
        status
    });

    const showError = error?.data?.message;

    const list = listData?.data?.ticketList || [];

    const columns = useMemo(() => TicketsTableColumnHeade, []);
    const data = useMemo(() => list, [list]);
    const rowCount = useMemo(() => listData?.data?.totalRecords || 0, [listData]);

    const table = useMaterialReactTable({
        columns: columns,
        data: isError ? [] : data,
        enableColumnFilters: false,
        enableSorting: false,
        enableColumnActions: false,
        manualPagination: true,
        manualFiltering: true,
        rowCount: rowCount,
        state: {
            pagination,
            isLoading,
            showAlertBanner: isError,
        },
        onPaginationChange: setPagination,
        columnFilterDisplayMode: "popover",
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                border: 'none',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'transparent',
            }
        },
        muiTableContainerProps: {
            sx: {
                maxHeight: '600px',
                '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: alpha(theme.palette.divider, 0.1),
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: theme.palette.primary.main,
                    borderRadius: '4px',
                }
            }
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: isDarkMode 
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.04),
                fontWeight: 600,
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:hover': {
                    backgroundColor: isDarkMode 
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.primary.main, 0.08),
                }
            }
        },
        muiTableBodyCellProps: {
            sx: {
                fontSize: '0.875rem',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                '&:hover': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.05),
                }
            }
        },
        muiPaginationProps: {
            rowsPerPageOptions: [5, 10, 20, 50],
            showFirstButton: true,
            showLastButton: true,
            sx: {
                '& .MuiPaginationItem-root': {
                    fontSize: '0.875rem',
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        }
                    },
                    '&:hover': {
                        backgroundColor: isDarkMode 
                            ? alpha(theme.palette.action.hover, 0.08)
                            : alpha(theme.palette.action.hover, 0.04),
                    }
                }
            }
        },
        muiToolbarAlertBannerProps: isError
            ? {
                color: 'error',
                children: showError || 'Error loading tickets.',
                sx: {
                    borderRadius: '8px',
                    margin: '8px',
                }
            }
            : undefined,
        renderTopToolbarCustomActions: () => (
            <Stack direction="row" alignItems="center" spacing={2}>
                <Typography 
                    variant="subtitle2" 
                    fontWeight={600}
                    sx={{ 
                        color: 'text.secondary',
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <FilterListIcon fontSize="small" />
                    Filter by Status:
                </Typography>
                <Selector
                    items={["", "OPEN", "CLOSED", "PROCESSING"]}
                    itemLabels={["All Tickets", "Open", "Closed", "Processing"]}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    width={{ xs: '100%', sm: 180 }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: isDarkMode 
                                ? alpha(theme.palette.background.default, 0.5)
                                : theme.palette.grey[50],
                            height: '40px',
                            '&:hover': {
                                backgroundColor: isDarkMode 
                                    ? alpha(theme.palette.background.default, 0.7)
                                    : theme.palette.grey[100],
                            }
                        }
                    }}
                />
            </Stack>
        ),
        renderBottomToolbarCustomActions: ({ table }) => (
            <Typography 
                variant="caption" 
                sx={{ 
                    color: 'text.secondary',
                    px: 2
                }}
            >
                Showing {table.getRowModel().rows.length} of {rowCount} tickets
            </Typography>
        ),
    });

    return (
        <Stack spacing={3}>
            {/* Filter Section - Mobile */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Typography 
                    variant="caption" 
                    fontWeight={600}
                    sx={{ 
                        color: 'text.secondary',
                        mb: 1,
                        display: 'block'
                    }}
                >
                    Filter by Status
                </Typography>
                <Selector
                    items={["", "OPEN", "CLOSED", "PROCESSING"]}
                    itemLabels={["All Tickets", "Open", "Closed", "Processing"]}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    fullWidth
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: isDarkMode 
                                ? alpha(theme.palette.background.default, 0.5)
                                : theme.palette.grey[50],
                            height: '40px',
                            '&:hover': {
                                backgroundColor: isDarkMode 
                                    ? alpha(theme.palette.background.default, 0.7)
                                    : theme.palette.grey[100],
                            }
                        }
                    }}
                />
            </Box>

            {/* Table */}
            <Box sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                <MaterialReactTable table={table} />
            </Box>
        </Stack>
    )
};

export default TicketsTable;