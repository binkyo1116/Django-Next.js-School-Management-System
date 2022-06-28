import { useRef, useState, useEffect } from 'react';

import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import { LoadingButton } from '@mui/lab';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Alert, Box, Collapse, Container, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, Skeleton, Stack, Typography } from '@mui/material';

import axios from '../utils/js/axios';
import { sleep } from '../utils/js/utils';

const { publicRuntimeConfig } = getConfig();

const EmailRequesterForm = () => {
    const usernameOrEmailRef = useRef();

    const [ showAlert, setShowAlert ] = useState(false);
    const [ alertMessage, setAlertMessage ] = useState('');
    const [ alertSeverity, setAlertSeverity ] = useState('');

    const [ loading, setLoading ] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();

        setShowAlert(false);
        setAlertMessage('');
        setAlertSeverity('');
        setLoading(true);

        const isEmail = email => {
            return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        };

        let data = {
            redirect_link : `${publicRuntimeConfig.FRONTEND_URL}/reset-password`,
            vars          : {
                org_name       : publicRuntimeConfig.SCHOOL_NAME,
                privacy_policy : `${publicRuntimeConfig.SITE_URL}/privacy-policy`,
                site_url       : `${publicRuntimeConfig.SITE_URL}`
            }
        };
        if (isEmail(usernameOrEmailRef.current.value)) {
            data['email_id'] = usernameOrEmailRef.current.value;
        } else {
            data['username'] = usernameOrEmailRef.current.value;
        }

        axios.post('auth/password/reset/', data).then(response => {
            if (response.status === 200) {
                setLoading(false);
                setAlertMessage('A Link has been sent to you on your registered Email ID. Please check it out to continue...');
                setAlertSeverity('success');
                setShowAlert(true);
            }
        }).catch(e => {
            if (e.response.status === 403) {
                setLoading(false);
                setAlertMessage('This username has already requested for password reset. Please try again after sometime...');
                setAlertSeverity('error');
                setShowAlert(true);
            } else if (e.response.status === 404) {
                setLoading(false);
                setAlertMessage('Oops! No User found with the given Username/Email ID.');
                setAlertSeverity('error');
                setShowAlert(true);
            } else {
                setLoading(false);
            }
        });
    };

    return (
        <>
            <Collapse in={showAlert}>
                <Alert severity={alertSeverity} variant="filled" onClose={() => { setShowAlert(false); }} sx={{ width : '100%', marginBottom : '8px' }}>
                    {alertMessage}
                </Alert>
            </Collapse>
            <Typography variant="body1">Don{"'"}t worry! Just enter the Username or Email and we{"'"}ll send you a link to get back into your Account</Typography>
            <div style={{ height : '15px' }} />
            <form onSubmit={handleSubmit}>
                <FormControl variant="outlined" margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__passwordreset_form__inp_useroremail">Username or Email ID</InputLabel>
                    <OutlinedInput
                        id="__passwordreset_form__inp_useroremail"
                        type="text"
                        inputRef={usernameOrEmailRef}
                        label="Username or Email ID"
                    />
                </FormControl>
                <LoadingButton type="submit" color="secondary" variant="contained" loading={loading} sx={{ marginTop : '16px' }}>Submit</LoadingButton>
            </form>
        </>
    );
};

const PasswordChangerForm = ({ props }) => {
    const router = useRouter();

    const passwordRef = useRef();
    const confirmPasswordRef = useRef();

    const [ passwordError, setPasswordError ] = useState(false);
    const [ passwordErrorMessages, setPasswordErrorMessages ] = useState([]);
    const [ confirmPasswordError, setConfirmPasswordError ] = useState(false);

    const [ showPassword, setShowPassword ] = useState(false);

    const [ showSuccessAlert, setShowSuccessAlert ] = useState(false);
    const [ showErrorAlert, setShowErrorAlert ] = useState(false);
    const [ errorAlertMessage, setErrorAlertMessage ] = useState('');

    const [ loading, setLoading ] = useState(false);

    const checkPasswordValidation = () => {
        if (passwordRef.current.value === '') {
            setPasswordErrorMessages([]);
            setPasswordError(false);
        } else {
            axios.post(
                'auth/password/validate/', { username : props.username, password : passwordRef.current.value }
            ).then(response => {
                if (response.status === 200) {
                    setPasswordErrorMessages([]);
                    setPasswordError(false);
                }
            }).catch(e => {
                if (e.response.status === 400) {
                    setPasswordErrorMessages(e.response.data.error.errors);
                    setPasswordError(true);
                }
            });
        }
    };

    const checkPasswordsEquality = () => {
        if (confirmPasswordRef.current.value === '') {
            setConfirmPasswordError(false);
        } else {
            if (passwordRef.current.value !== confirmPasswordRef.current.value) {
                setConfirmPasswordError(true);
            } else {
                setConfirmPasswordError(false);
            }
        }
    };

    const handleSubmit = e => {
        e.preventDefault();

        setLoading(true);
        setShowErrorAlert(false);
        setShowSuccessAlert(false);
        setErrorAlertMessage('');

        axios.patch(
            'auth/password/reset/', { username : props.username, token : props.token, new_password : passwordRef.current.value }
        ).then(response => {
            if (response.status === 200) {
                setLoading(false);
                setShowSuccessAlert(true);
                sleep(1.5).then(() => {
                    router.push('/login');
                });
            } else {
                setLoading(false);
            }
        }).catch(e => {
            if (e.response.status === 400) {
                setLoading(false);
                setErrorAlertMessage(e.response.data.error.error_message);
                setShowErrorAlert(true);
            } else if (e.response.status === 404) {
                setLoading(false);
            } else {
                setLoading(false);
            }
        });
    };

    return (
        <>
            <Collapse in={showErrorAlert}>
                <Alert severity="error" variant="filled" onClose={() => { setShowErrorAlert(false); }} sx={{ width : '100%', marginBottom : '8px' }}>
                    {errorAlertMessage}
                </Alert>
            </Collapse>
            <Collapse in={showSuccessAlert}>
                <Alert severity="success" variant="filled" sx={{ width : '100%', marginBottom : '8px' }}>
                    Your password has been successfully updated
                </Alert>
            </Collapse>
            <form onSubmit={handleSubmit}>
                <FormControl variant="outlined" margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__passwordreset_form__inp_newpass" error={passwordError}>New Password</InputLabel>
                    <OutlinedInput
                        id="__passwordreset_form__inp_newpass"
                        aria-describedby="__passwordreset_form__inp_newpass_helper"
                        type={showPassword ? 'text' : 'password'}
                        inputRef={passwordRef}
                        label="New Password"
                        error={passwordError}
                        onChange={() => {
                            checkPasswordValidation();
                            checkPasswordsEquality();
                        }}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={() => { setShowPassword(!showPassword); }} edge="end">
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <FormHelperText id="__passwordreset_form__inp_newpass_helper" error={passwordError}>{passwordErrorMessages.join(' ')}</FormHelperText>
                </FormControl>
                <FormControl variant="outlined" margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__passwordreset_form__inp_reenternewpass" error={confirmPasswordError}>Re-Enter New Password</InputLabel>
                    <OutlinedInput
                        id="__passwordreset_form__inp_reenternewpass"
                        aria-describedby="__passwordreset_form__inp_reenternewpass_helper"
                        type={showPassword ? 'text' : 'password'}
                        inputRef={confirmPasswordRef}
                        label="Re-Enter New Password"
                        error={confirmPasswordError}
                        onChange={checkPasswordsEquality}
                    />
                    <FormHelperText id="__passwordreset_form__inp_reenternewpass_helper" error={confirmPasswordError}>{confirmPasswordError ? 'Passwords does not Match' : ' '}</FormHelperText>
                </FormControl>
                <LoadingButton type="submit" color="secondary" variant="contained" loading={loading} sx={{ marginTop : '16px' }} disabled={passwordError || confirmPasswordError}>Submit</LoadingButton>
            </form>
        </>
    );
};

const ErrorForm = ({ message }) => {
    return (
        <Alert severity="error" variant="filled" sx={{ width : '100%', marginBottom : '8px' }}>
            {message}
        </Alert>
    );
};

const SkeletonForm = () => {
    return (
        <Stack spacing={2}>
            <Skeleton animation="wave" variant="rectangular" width="100%" height="40px" />
            <Skeleton animation="wave" variant="rectangular" width="100%" height="40px" />
            <Skeleton animation="wave" variant="rectangular" width="100%" height="200px" />
        </Stack>
    );
};

export default function ResetPassword() {
    const router = useRouter();

    const [ curState, setCurState ] = useState('');

    useEffect(() => {
        if (!curState) {
            if (typeof router.query.token === 'undefined' || typeof router.query.username === 'undefined') {
                setCurState('new');
            } else {
                axios.get(
                    'auth/password/reset/',
                    { params : { username : router.query.username, token : router.query.token } }
                ).then(response => {
                    if (response.status === 200) {
                        setCurState('verified_token');
                    } else {
                        setCurState('new');
                    }
                }).catch(e => {
                    if (e.response.status === 400) {
                        if (e.response.data.error.error_message.includes('expired')) {
                            setCurState('expired_or_notfound_token');
                        } else if (e.response.data.error.error_message.includes('match')) {
                            setCurState('invalid_token');
                        } else {
                            setCurState('new');
                        }
                    }
                });
            }
        }
    }, []); //eslint-disable-line

    return (
        <>
            <Head>
                <title>Reset Password | {publicRuntimeConfig.SCHOOL_NAME}</title>
            </Head>
            <Container sx={{ display : 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center', padding : '8vh 0' }}>
                <Box sx={{
                    display         : 'flex',
                    flexDirection   : 'column',
                    alignItems      : 'center',
                    justifyContent  : 'center',
                    flexWrap        : 'wrap',
                    width           : { xs : '100%', sm : '90%' },
                    borderRadius    : '7.5px',
                    padding         : '50px 30px',
                    backgroundColor : 'background.paper'
                }}>
                    <Typography variant="h5">Reset Password</Typography>
                    <Container sx={{ marginTop : '30px', maxWidth : { xs : '100%', sm : '80%', md : '60%', lg : '40%' } }}>
                        {
                            !curState ? <SkeletonForm /> : (
                                curState === 'new' ? <EmailRequesterForm /> : (
                                    curState === 'verified_token' ? <PasswordChangerForm props={{ username : router.query.username, token : router.query.token }} /> : (
                                        curState === 'expired_or_notfound_token' ? <ErrorForm message="The token is either expired or not found. Please try again" /> : (
                                            curState === 'invalid_token' ? <ErrorForm message="The token is invalid. Please try again" /> : null
                                        )
                                    )
                                )
                            )
                        }
                    </Container>
                </Box>
            </Container>
        </>
    );
}
