import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Container,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Modal,
  InputLabel,
  IconButton,
  InputAdornment,
  Avatar,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FolderIcon from '@mui/icons-material/Folder';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { useDispatch } from 'react-redux';
import { useGetDocumentDataQuery } from '../../../globalState/complianceState/complianceStateApis';
import { handleExportToExcel } from '../../../utils/exportToExcel';
import { useAddBankMutation } from '../../../globalState/complianceState/complianceStateApis';
import { setNotification } from "../../../globalState/notificationState/notificationStateSlice"
import FileUploadTextArea from '../../../components/FileUploadTextArea';
import { useForm } from 'react-hook-form';

function DocumentList() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const downSm = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();

  // Dark mode colors
  const backgroundColor = isDarkMode ? theme.palette.background.default : '#ffffff';
  const paperBackground = isDarkMode ? theme.palette.background.paper : '#ffffff';
  const borderColor = isDarkMode ? theme.palette.divider : '#e0e0e0';
  const lightBackground = isDarkMode ? theme.palette.grey[900] : 'grey.50';
  const inputBackground = isDarkMode ? theme.palette.background.default : '#ffffff';
  const iconColor = isDarkMode ? theme.palette.text.secondary : '#666';

  // State for Search and Add Bank Modal
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [openBankModal, setOpenBankModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [viewerModal, setViewerModal] = useState({
    open: false,
    url: null,
    title: ''
  });

  // React Hook Form for Add Bank
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      holderName: "",
      accountNo: "",
      ifscCode: "",
      ibanNo: "",
      bankName: "",
      bankAddress: "",
      country: "",
      image: null,
    },
  });

  // Add Bank Mutation
  const [addBank, { isLoading: isAddingBank }] = useAddBankMutation();

  // Fetch Document Data
  const { data: listData, isLoading, isError, error } = useGetDocumentDataQuery({
    search: globalFilter,
  });

  // Document List Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setGlobalFilter(searchInput);
  };

  const handleDownloadExcel = () => {
    const list = listData?.data ? [listData.data] : [];
    handleExportToExcel(list, "DocumentList.xlsx", dispatch);
  };

  const handleViewDocument = (documentUrl, title = 'Document') => {
    if (!documentUrl) return;
    
    // Check if it's an image
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(String(documentUrl));
    
    if (isImage) {
      // Open in modal for images
      setViewerModal({
        open: true,
        url: documentUrl,
        title: title
      });
    } else {
      // Open in new tab for PDFs and other files
      window.open(documentUrl, '_blank');
    }
  };

  const handleCloseViewer = () => {
    setViewerModal({
      open: false,
      url: null,
      title: ''
    });
  };

  // Add Bank Handlers
  const handleOpenBankModal = () => {
    setOpenBankModal(true);
  };

  const handleCloseBankModal = () => {
    setOpenBankModal(false);
    reset();
  };

  const onSubmitBank = async (data) => {
    try {
      const response = await addBank(data).unwrap();
      if (response?.status) {
        dispatch(setNotification({ 
          open: true, 
          message: response?.message || "Bank details added successfully", 
          severity: "success" 
        }));
        handleCloseBankModal();
      }
    } catch (error) {
      dispatch(setNotification({ 
        open: true, 
        message: error?.data?.message || "Failed to submit. Please try again later.", 
        severity: "error" 
      }));
    }
  };

  // Document Data Processing
  const document = listData?.data || null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <PendingIcon sx={{ fontSize: 16, color: '#ff9800' }} />;
    
    const statusUpper = String(status).toUpperCase();
    switch (statusUpper) {
      case 'APPROVED':
        return <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />;
      case 'REJECTED':
        return <CancelIcon sx={{ fontSize: 16, color: '#f44336' }} />;
      case 'PENDING':
        return <PendingIcon sx={{ fontSize: 16, color: '#ff9800' }} />;
      default:
        return <PendingIcon sx={{ fontSize: 16, color: '#ff9800' }} />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    
    const statusUpper = String(status).toUpperCase();
    switch (statusUpper) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  // SAFE FUNCTIONS TO HANDLE NULL/UNDEFINED
  const getInitial = (value) => {
    if (!value) return 'U';
    const stringValue = String(value);
    return stringValue.charAt(0).toUpperCase();
  };

  const getUserIdString = (userId) => {
    if (!userId) return 'N/A';
    return String(userId);
  };

  const getDocumentIdString = (id) => {
    if (!id) return 'N/A';
    return `DOC-${id}`;
  };

  const getFileIcon = (url) => {
    if (!url) return <InsertDriveFileIcon />;
    
    const urlString = String(url);
    const extension = urlString.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) {
      return <PictureAsPdfIcon sx={{ color: '#f44336' }} />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return <ImageIcon sx={{ color: '#4caf50' }} />;
    } else {
      return <InsertDriveFileIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const urlString = String(url);
    const extension = urlString.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return 'Document';
    const urlString = String(url);
    const parts = urlString.split('/');
    const fullName = parts[parts.length - 1];
    if (fullName.length > 35) {
      return `${fullName.substring(0, 32)}...`;
    }
    return fullName;
  };

  // Calculate total documents
  const totalDocuments = document ? 
    (document.poi ? 1 : 0) + 
    (document.poa ? 1 : 0) + 
    (document.extraDocs?.length || 0) 
    : 0;

  return (
    <Container maxWidth="xl" sx={{ 
      py: 2, 
      minHeight: 'calc(100vh - 100px)',
      backgroundColor: backgroundColor
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6' fontWeight={700} color="text.primary">
            Document Details
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={handleDownloadExcel}
              startIcon={<FileDownloadIcon sx={{ fontSize: 16 }} />}
              size="small"
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                px: 2,
                borderColor: borderColor,
                color: isDarkMode ? theme.palette.text.primary : undefined,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                }
              }}
            >
              Export
            </Button>

            <Button
              variant="contained"
              onClick={handleOpenBankModal}
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              size="small"
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                px: 2,
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              Add Bank
            </Button>
          </Stack>
        </Box>
        
        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search documents by ID, user, or status..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: iconColor, fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchInput && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchInput("");
                      setGlobalFilter("");
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: inputBackground,
                borderRadius: 1,
                '& .MuiInputBase-input': {
                  color: isDarkMode ? theme.palette.text.primary : 'inherit',
                  fontSize: '0.875rem',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: borderColor,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }
            }}
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {isError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            py: 0.5,
            fontSize: '0.875rem',
            backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : undefined,
          }}
        >
          {error?.data?.message || 'Error loading document'}
        </Alert>
      )}

      {/* Main Content Area */}
      <Box sx={{ 
        height: 'calc(100% - 120px)', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* Loading State */}
        {isLoading ? (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading document...
            </Typography>
          </Box>
        ) : (
          <>
            {document ? (
              <>
                {/* Document Header Bar - Compact */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 2,
                  p: 1,
                  bgcolor: lightBackground,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: borderColor
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: isDarkMode ? theme.palette.primary.dark : theme.palette.primary.main,
                        fontSize: '0.875rem'
                      }}>
                        {getInitial(document.userId)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          User: {getUserIdString(document.userId)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getDocumentIdString(document.id)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: iconColor }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(document.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={getStatusIcon(document.status)}
                    label={document.status || 'PENDING'}
                    color={getStatusColor(document.status)}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {/* Main Content Grid */}
                <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                  {/* Left Column - Compact Document Information */}
                  <Grid item xs={12} md={4} lg={3}>
                    <Card sx={{ 
                      height: '100%',
                      border: '1px solid',
                      borderColor: borderColor,
                      backgroundColor: paperBackground,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <CardContent sx={{ flex: 1, p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.primary">
                          Document Information
                        </Typography>
                        <Stack spacing={1.5} sx={{ mt: 1 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Status
                            </Typography>
                            <Chip
                              icon={getStatusIcon(document.status)}
                              label={document.status || 'PENDING'}
                              color={getStatusColor(document.status)}
                              size="small"
                              sx={{ 
                                mt: 0.5,
                                height: 22,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Created Date
                            </Typography>
                            <Typography variant="body2" color="text.primary" fontWeight={500}>
                              {formatDate(document.createdAt)}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Updated Date
                            </Typography>
                            <Typography variant="body2" color="text.primary" fontWeight={500}>
                              {formatDate(document.updatedAt)}
                            </Typography>
                          </Box>

                          {document.approvedBy && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Approved By
                              </Typography>
                              <Typography variant="body2" color="text.primary" fontWeight={500}>
                                {String(document.approvedBy)}
                              </Typography>
                            </Box>
                          )}

                          {document.remark && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Remark
                              </Typography>
                              <Typography variant="body2" color="text.primary" sx={{ 
                                fontStyle: 'italic',
                                fontSize: '0.875rem'
                              }}>
                                {String(document.remark)}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Right Column - Documents */}
                  <Grid item xs={12} md={8} lg={9}>
                    <Card sx={{ 
                      height: '100%',
                      border: '1px solid',
                      borderColor: borderColor,
                      backgroundColor: paperBackground,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <CardContent sx={{ 
                        flex: 1, 
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mb: 2,
                          pb: 1,
                          borderBottom: `1px solid ${borderColor}`
                        }}>
                          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                            Documents ({totalDocuments} total)
                          </Typography>
                          <Badge 
                            badgeContent={document.extraDocs?.length || 0} 
                            color="primary"
                            sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}
                          >
                            <FolderIcon sx={{ color: iconColor, fontSize: 20 }} />
                          </Badge>
                        </Box>

                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                          {/* Tabs for different document types */}
                          <Tabs 
                            value={activeTab} 
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            sx={{ 
                              mb: 2,
                              minHeight: 36,
                              '& .MuiTab-root': {
                                minHeight: 36,
                                fontSize: '0.75rem',
                                textTransform: 'none',
                              }
                            }}
                          >
                            <Tab label={`POI (${document.poi ? '1' : '0'})`} />
                            <Tab label={`POA (${document.poa ? '1' : '0'})`} />
                            <Tab label={`Extra (${document.extraDocs?.length || 0})`} />
                          </Tabs>

                          {/* POI Tab Content */}
                          {activeTab === 0 && (
                            <Box sx={{ p: 1 }}>
                              {document.poi ? (
                                <Card variant="outlined" sx={{ borderColor: borderColor }}>
                                  <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                      <Avatar sx={{ 
                                        bgcolor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.2)',
                                        width: 40,
                                        height: 40
                                      }}>
                                        {getFileIcon(document.poi)}
                                      </Avatar>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                          Proof of Identity
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {getFileNameFromUrl(document.poi)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                                        onClick={() => handleViewDocument(document.poi, 'Proof of Identity')}
                                        sx={{
                                          textTransform: 'none',
                                          fontSize: '0.7rem',
                                          px: 1.5,
                                          py: 0.5
                                        }}
                                      >
                                        {isImageFile(document.poi) ? 'Preview' : 'View'}
                                      </Button>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                                        onClick={() => window.open(document.poi, '_blank')}
                                        sx={{
                                          textTransform: 'none',
                                          fontSize: '0.7rem',
                                          px: 1.5,
                                          py: 0.5
                                        }}
                                      >
                                        Download
                                      </Button>
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ) : (
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  py: 4,
                                  border: `1px dashed ${borderColor}`,
                                  borderRadius: 1
                                }}>
                                  <DescriptionIcon sx={{ 
                                    fontSize: 40, 
                                    color: iconColor, 
                                    mb: 1 
                                  }} />
                                  <Typography variant="body2" color="text.secondary">
                                    No POI document uploaded
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}

                          {/* POA Tab Content */}
                          {activeTab === 1 && (
                            <Box sx={{ p: 1 }}>
                              {document.poa ? (
                                <Card variant="outlined" sx={{ borderColor: borderColor }}>
                                  <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                      <Avatar sx={{ 
                                        bgcolor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.2)',
                                        width: 40,
                                        height: 40
                                      }}>
                                        {getFileIcon(document.poa)}
                                      </Avatar>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                          Proof of Address
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {getFileNameFromUrl(document.poa)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                                        onClick={() => handleViewDocument(document.poa, 'Proof of Address')}
                                        sx={{
                                          textTransform: 'none',
                                          fontSize: '0.7rem',
                                          px: 1.5,
                                          py: 0.5
                                        }}
                                      >
                                        {isImageFile(document.poa) ? 'Preview' : 'View'}
                                      </Button>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                                        onClick={() => window.open(document.poa, '_blank')}
                                        sx={{
                                          textTransform: 'none',
                                          fontSize: '0.7rem',
                                          px: 1.5,
                                          py: 0.5
                                        }}
                                      >
                                        Download
                                      </Button>
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ) : (
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  py: 4,
                                  border: `1px dashed ${borderColor}`,
                                  borderRadius: 1
                                }}>
                                  <DescriptionIcon sx={{ 
                                    fontSize: 40, 
                                    color: iconColor, 
                                    mb: 1 
                                  }} />
                                  <Typography variant="body2" color="text.secondary">
                                    No POA document uploaded
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}

                          {/* Extra Documents Tab Content - MULTI-DISPLAY */}
                          {activeTab === 2 && (
                            <Box sx={{ p: 1 }}>
                              {document.extraDocs && document.extraDocs.length > 0 ? (
                                <Grid container spacing={1.5}>
                                  {document.extraDocs.map((docUrl, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                      <Card variant="outlined" sx={{ 
                                        borderColor: borderColor,
                                        height: '100%',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          boxShadow: isDarkMode ? 
                                            '0 2px 8px rgba(0,0,0,0.3)' : 
                                            '0 2px 8px rgba(0,0,0,0.1)',
                                          borderColor: theme.palette.primary.main
                                        }
                                      }}>
                                        <CardContent sx={{ p: 1.5 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                            <Avatar sx={{ 
                                              bgcolor: isDarkMode ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.2)',
                                              width: 36,
                                              height: 36
                                            }}>
                                              {getFileIcon(docUrl)}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                              <Typography 
                                                variant="body2" 
                                                fontWeight={600} 
                                                color="text.primary"
                                                noWrap
                                              >
                                                Extra Document {index + 1}
                                              </Typography>
                                              <Typography 
                                                variant="caption" 
                                                color="text.secondary"
                                                noWrap
                                              >
                                                {getFileNameFromUrl(docUrl)}
                                              </Typography>
                                            </Box>
                                          </Box>
                                          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                                            <Button
                                              variant="outlined"
                                              size="small"
                                              startIcon={isImageFile(docUrl) ? 
                                                <ZoomInIcon sx={{ fontSize: 12 }} /> : 
                                                <VisibilityIcon sx={{ fontSize: 12 }} />
                                              }
                                              onClick={() => handleViewDocument(docUrl, `Extra Document ${index + 1}`)}
                                              sx={{
                                                textTransform: 'none',
                                                fontSize: '0.65rem',
                                                px: 1,
                                                py: 0.25,
                                                flex: 1
                                              }}
                                            >
                                              {isImageFile(docUrl) ? 'Preview' : 'View'}
                                            </Button>
                                            <Button
                                              variant="contained"
                                              size="small"
                                              startIcon={<DownloadIcon sx={{ fontSize: 12 }} />}
                                              onClick={() => window.open(docUrl, '_blank')}
                                              sx={{
                                                textTransform: 'none',
                                                fontSize: '0.65rem',
                                                px: 1,
                                                py: 0.25,
                                                flex: 1
                                              }}
                                            >
                                              Download
                                            </Button>
                                          </Stack>
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  ))}
                                </Grid>
                              ) : (
                                <Box sx={{ 
                                  textAlign: 'center', 
                                  py: 4,
                                  border: `1px dashed ${borderColor}`,
                                  borderRadius: 1
                                }}>
                                  <FolderIcon sx={{ 
                                    fontSize: 40, 
                                    color: iconColor, 
                                    mb: 1 
                                  }} />
                                  <Typography variant="body2" color="text.secondary">
                                    No extra documents uploaded
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            ) : (
              /* Empty State - No Document Found */
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                textAlign: 'center',
                p: 4
              }}>
                <DescriptionIcon sx={{ 
                  fontSize: 48, 
                  color: isDarkMode ? theme.palette.text.disabled : 'text.disabled', 
                  mb: 2 
                }} />
                <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
                  No Document Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                  {globalFilter 
                    ? `No document matches "${globalFilter}"`
                    : 'No document data available'
                  }
                </Typography>
                {!globalFilter && (
                  <Button
                    variant="contained"
                    onClick={handleOpenBankModal}
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    Add Bank Details
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Image Viewer Modal */}
      <Modal 
        open={viewerModal.open} 
        onClose={handleCloseViewer}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          bgcolor: paperBackground,
          borderRadius: '8px',
          boxShadow: 24,
          overflow: 'hidden',
        }}>
          {/* Modal Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: `1px solid ${borderColor}`,
            bgcolor: isDarkMode ? theme.palette.grey[900] : 'grey.50'
          }}>
            <Typography variant="h6" color="text.primary">
              {viewerModal.title}
            </Typography>
            <IconButton onClick={handleCloseViewer} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Image Content */}
          <Box sx={{ 
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            maxHeight: '70vh',
            overflow: 'auto'
          }}>
            {viewerModal.url && (
              <img
                src={viewerModal.url}
                alt={viewerModal.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            )}
          </Box>
          
          {/* Modal Footer */}
          <Box sx={{ 
            p: 2,
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: isDarkMode ? theme.palette.grey[900] : 'grey.50'
          }}>
            <Typography variant="body2" color="text.secondary">
              {viewerModal.url && getFileNameFromUrl(viewerModal.url)}
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => window.open(viewerModal.url, '_blank')}
              sx={{
                textTransform: 'none'
              }}
            >
              Download
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add Bank Details Modal */}
      <Modal open={openBankModal} onClose={handleCloseBankModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: downSm ? '95%' : 700,
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: paperBackground,
          borderRadius: '12px',
          boxShadow: 24,
          p: 4,
        }}>
          {/* Modal Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            pb: 2, 
            borderBottom: `1px solid ${borderColor}` 
          }}>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Add Bank Details
            </Typography>
            <IconButton 
              onClick={handleCloseBankModal} 
              size="small"
              sx={{ color: iconColor }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Add Bank Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmitBank)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ mb: ".5rem", fontWeight: 600, color: 'text.primary' }}>
                  Account holder Name *
                </InputLabel>
                <TextField 
                  {...register("holderName", { required: "Account holder name is required" })} 
                  size='small' 
                  fullWidth 
                  placeholder="Enter account Name" 
                  variant="outlined" 
                  error={!!errors.holderName}
                  helperText={errors.holderName?.message}
                  sx={{
                    backgroundColor: inputBackground,
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : 'inherit',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.divider : undefined
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ mb: ".5rem", fontWeight: 600, color: 'text.primary' }}>
                  Account No. *
                </InputLabel>
                <TextField 
                  {...register("accountNo", { required: "Account number is required" })} 
                  size='small' 
                  fullWidth 
                  placeholder="Enter account No." 
                  variant="outlined" 
                  error={!!errors.accountNo}
                  helperText={errors.accountNo?.message}
                  sx={{
                    backgroundColor: inputBackground,
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : 'inherit',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.divider : undefined
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ mb: ".5rem", fontWeight: 600, color: 'text.primary' }}>
                  IFSC/Swift Code *
                </InputLabel>
                <TextField 
                  {...register("ifscCode", { required: "IFSC/Swift Code is required" })} 
                  size='small' 
                  fullWidth 
                  placeholder="Enter IFSC/Swift Code" 
                  variant="outlined" 
                  error={!!errors.ifscCode}
                  helperText={errors.ifscCode?.message}
                  sx={{
                    backgroundColor: inputBackground,
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : 'inherit',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.divider : undefined
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ mb: ".5rem", fontWeight: 600, color: 'text.primary' }}>
                  IBAN No.
                </InputLabel>
                <TextField 
                  {...register("ibanNo")} 
                  size='small' 
                  fullWidth 
                  placeholder="Enter IBAN No." 
                  variant="outlined" 
                  error={!!errors.ibanNo}
                  helperText={errors.ibanNo?.message}
                  sx={{
                    backgroundColor: inputBackground,
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : 'inherit',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.divider : undefined
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ mb: ".5rem", fontWeight: 600, color: 'text.primary' }}>
                  Bank Name *
                </InputLabel>
                <TextField 
                  {...register("bankName", { required: "Bank name is required" })} 
                  size='small' 
                  fullWidth 
                  placeholder="Enter bank name" 
                  variant="outlined" 
                  error={!!errors.bankName}
                  helperText={errors.bankName?.message}
                  sx={{
                    backgroundColor: inputBackground,
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : 'inherit',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.divider : undefined
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ mb: ".5rem", fontWeight: 600, color: 'text.primary' }}>
                  Bank address *
                </InputLabel>
                <TextField 
                  {...register("bankAddress", { required: "Bank address is required" })} 
                  size='small' 
                  fullWidth 
                  placeholder="Enter bank address" 
                  variant="outlined" 
                  error={!!errors.bankAddress}
                  helperText={errors.bankAddress?.message}
                  sx={{
                    backgroundColor: inputBackground,
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : 'inherit',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.divider : undefined
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ mb: ".5rem", fontWeight: 600, color: 'text.primary' }}>
                  Country *
                </InputLabel>
                <TextField 
                  {...register("country", { required: "Country is required" })} 
                  size='small' 
                  fullWidth 
                  placeholder="Enter your country name" 
                  variant="outlined" 
                  error={!!errors.country}
                  helperText={errors.country?.message}
                  sx={{
                    backgroundColor: inputBackground,
                    '& .MuiInputBase-input': {
                      color: isDarkMode ? theme.palette.text.primary : 'inherit',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.divider : undefined
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ mb: ".5rem", fontWeight: 600, color: 'text.primary' }}>
                  Bank Document *
                </InputLabel>
                <FileUploadTextArea
                  onChange={(fileData) => setValue("image", fileData, { shouldValidate: true })}
                  extentionType={['image/jpeg', 'image/png']}
                  acceptType={"image/jpeg,image/png,application/pdf"}
                />
                {errors.image && <Typography color="error" fontSize={"14px"}>{errors.image.message}</Typography>}
              </Grid>
            </Grid>

            {/* Form Actions */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2, 
              mt: 4, 
              pt: 3, 
              borderTop: `1px solid ${borderColor}` 
            }}>
              <Button
                variant="outlined"
                onClick={handleCloseBankModal}
                sx={{
                  textTransform: "capitalize",
                  fontWeight: 600,
                  px: 4,
                  borderColor: borderColor,
                  color: isDarkMode ? theme.palette.text.primary : undefined,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={isSubmitting || isAddingBank}
                sx={{
                  textTransform: "capitalize",
                  boxShadow: "none",
                  color: "white",
                  fontWeight: 600,
                  px: 4,
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    boxShadow: "none",
                    backgroundColor: theme.palette.primary.dark,
                  },
                  "&:disabled": {
                    backgroundColor: isDarkMode ? theme.palette.grey[700] : undefined,
                    color: isDarkMode ? theme.palette.text.disabled : undefined,
                  }
                }}
              >
                {(isSubmitting || isAddingBank) ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}

export default DocumentList;