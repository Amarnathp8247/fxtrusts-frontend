import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import OTPInput from "../../components/OTPInput";
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForgotPasswordVerifyOTPMutation } from "../../globalState/auth/authApis";
import { useForm } from "react-hook-form";
import { setNotification } from "../../globalState/notificationState/notificationStateSlice";
import { useRef } from "react";
import { setEmailOnOTPSent, setTempToken } from "../../globalState/auth/authSlice";
import { useForgotPasswordSendOTPMutation } from "../../globalState/auth/authApis";
import useCountdownTimer from "../../hooks/useCountdownTimer";
import { setResendOtpCreatedTime, setResendOtpExpiryTime } from "../../globalState/auth/authSlice";

function VerifyOtp() {

    const [searchParams, setSearchParams] = useSearchParams()
    const dispatch = useDispatch()
    const theme = useTheme();

    const { resendOtpCreatedTime: createdTime, resendOtpExpiryTime: expireTime } = useSelector(state => state.auth)

    const timeLeft = useCountdownTimer(createdTime, expireTime, () => {
        dispatch(setResendOtpCreatedTime(null));
        dispatch(setResendOtpExpiryTime(null));
    });

    const isTimedOut = timeLeft <= 0;

    const formatTime = (seconds) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const { emailOnOTPSent } = useSelector(state => state.auth)
    const hasSubmitted = useRef(false);

    const defaultValues = {
        email: emailOnOTPSent,
        otp: ""
    };

    const { handleSubmit, setValue, watch } = useForm({
        defaultValues: defaultValues
    });

    const [forgotPasswordVerifyOTP] = useForgotPasswordVerifyOTPMutation();

    const onSubmit = async (data) => {

        try {

            const response = await forgotPasswordVerifyOTP(data).unwrap();

            if (response?.status) {
                dispatch(setTempToken(response?.data))
                dispatch(setEmailOnOTPSent(""))
                dispatch(setResendOtpCreatedTime(null));
                dispatch(setResendOtpExpiryTime(null));
                setSearchParams({ forgotPasswordStep: "enterNewPassword" })
                dispatch(setNotification({ open: true, message: response?.message, severity: "success" }));
            }

        } catch (error) {
            if (!error?.data?.status) {
                dispatch(setNotification({ open: true, message: error?.data?.message || "Failed to submit. Please try again later.", severity: "error" }));
            }
        } finally {
            hasSubmitted.current = false;
        }

    };

    const [forgotPasswordSendOTP] = useForgotPasswordSendOTPMutation();

    const handleResendOtp = async () => {

        try {
            const data = { email: emailOnOTPSent }
            const response = await forgotPasswordSendOTP(data).unwrap();

            if (response?.status) {
                const now = Date.now();
                const expire = now + 2 * 60 * 1000;

                dispatch(setResendOtpCreatedTime(now));
                dispatch(setResendOtpExpiryTime(expire));
                dispatch(setNotification({ open: true, message: response?.message, severity: "success" }));
            }

        } catch (data) {
            if (!data?.data?.status) {
                dispatch(setNotification({ open: true, message: data?.data?.message || "Failed to sign in. Please try again later.", severity: "error" }));
            }
        }

    };

    return (
        <Stack spacing={2}>
            <Box textAlign="center">
                <Typography
                    variant="h6"
                    fontWeight="600"
                    color="text.primary"
                    gutterBottom
                >
                    Enter Verification Code
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Sent to: {emailOnOTPSent}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    p: 1.5,
                    backgroundColor: theme.palette.mode === 'light' 
                        ? 'rgba(25, 118, 210, 0.06)' 
                        : 'rgba(25, 118, 210, 0.1)',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 1
                }}
            >
                <CommentOutlinedIcon 
                    sx={{ 
                        color: "primary.main",
                        fontSize: "18px",
                        mt: 0.25
                    }} 
                />
                <Typography variant="caption" color="text.secondary">
                    Enter the 6-digit code sent to your email
                </Typography>
            </Box>

            <Box sx={{ mt: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <OTPInput
                        value={watch("otp")}
                        onComplete={(value) => {
                            setValue("otp", value);
                            if (!hasSubmitted.current) {
                                hasSubmitted.current = true;
                                handleSubmit(onSubmit)();
                            }
                        }} 
                    />
                </Box>
            </Box>

            <Box sx={{ mt: 1, textAlign: "center" }}>
                {isTimedOut ? (
                    <Typography
                        onClick={handleResendOtp}
                        sx={{
                            cursor: "pointer",
                            color: "primary.main",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            '&:hover': {
                                textDecoration: "underline"
                            }
                        }}
                    >
                        Resend code
                    </Typography>
                ) : (
                    <Typography variant="caption" color="text.secondary">
                        Resend in: <Box component="span" fontWeight="600" color="primary.main">{formatTime(timeLeft)}</Box>
                    </Typography>
                )}
            </Box>

            <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit(onSubmit)}
                size="small"
                sx={{
                    mt: 1.5,
                    py: 0.75,
                    borderRadius: 0.75,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem"
                }}
            >
                Verify Code
            </Button>

            <Typography 
                variant="caption" 
                color="text.secondary" 
                textAlign="center"
                sx={{ mt: 1 }}
            >
                Didn't receive it?{" "}
                <Typography
                    component={Link}
                    to="#"
                    variant="caption"
                    sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        textDecoration: "none",
                        cursor: "pointer",
                        '&:hover': {
                            textDecoration: "underline"
                        }
                    }}
                >
                    Try again
                </Typography>
            </Typography>
        </Stack>
    )
}

export default VerifyOtp;