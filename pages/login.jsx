import { useContext, useState, useRef, useEffect } from 'react';

import Link from 'next/link';
import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import { LoadingButton } from '@mui/lab';
import { VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';
import { Alert, Box, Collapse, Container, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography } from '@mui/material';

import axios from '../utils/js/axios';
import { AuthContext } from '../utils/js/context';

const { publicRuntimeConfig } = getConfig();

export default function Login() {
    const router = useRouter();
    const authContext = useContext(AuthContext);

    const usernameOrEmailRef = useRef();
    const passwordRef = useRef();

    const [ showPassword, setShowPassword ] = useState(false);
    const [ showAlert, setShowAlert ] = useState(false);
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        if (authContext.documentLoaded) {
            if (authContext.loggedIn) {
                router.replace('/dashboard');
            }
        }
    }, [ authContext.documentLoaded ]); // eslint-disable-line

    const handleSubmit = e => {
        e.preventDefault();

        setShowAlert(false);
        setLoading(true);

        const isEmail = email => {
            return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        };

        let data = {};
        if (isEmail(usernameOrEmailRef.current.value)) {
            data['email_id'] = usernameOrEmailRef.current.value;
        } else {
            data['username'] = usernameOrEmailRef.current.value;
        }
        data['password'] = passwordRef.current.value;

        axios.post('auth/authenticate/', data).then(response => {
            if (response.status === 200) {
                authContext.setLoggedIn(true);
                authContext.setUserData(response.data.data);
                setLoading(false);
                router.push('/dashboard');
            }
        }).catch(e => {
            if (e.response.status === 404) {
                setLoading(false);
                setShowAlert(true);
            } else {
                setLoading(false);
            }
        });
    };

    return (
        <>
            <Head>
                <title>Login | {publicRuntimeConfig.SCHOOL_NAME}</title>
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
                    <Typography variant="h5">Login</Typography>
                    <Container sx={{ marginTop : '30px', maxWidth : { xs : '100%', sm : '80%', md : '60%', lg : '40%' } }}>
                        <Collapse in={showAlert}>
                            <Alert severity="error" onClose={() => { setShowAlert(false); }} sx={{ width : '100%', marginBottom : '8px' }}>
                                Invalid Username/Email ID or Password
                            </Alert>
                        </Collapse>
                        <form onSubmit={handleSubmit}>
                            <FormControl margin="normal" sx={{ width : '100%' }} required>
                                <InputLabel htmlFor="__login_form__inp_useroremail">Username or Email ID</InputLabel>
                                <OutlinedInput
                                    id="__login_form__inp_useroremail"
                                    type="text"
                                    inputRef={usernameOrEmailRef}
                                    label="Username or Email ID"
                                />
                            </FormControl>
                            <FormControl margin="normal" sx={{ width : '100%' }} required>
                                <InputLabel htmlFor="__login_form__inp_pass">Password</InputLabel>
                                <OutlinedInput
                                    id="__login_form__inp_pass"
                                    type={showPassword ? 'text' : 'password'}
                                    inputRef={passwordRef}
                                    label="Password"
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => { setShowPassword(!showPassword); }} edge="end">
                                                {showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>
                            <Typography variant="body1" sx={{ marginTop : '8px', marginBottom : '4px' }}><Link href="/reset-password"><a>Forgot Password?</a></Link></Typography>
                            <LoadingButton type="submit" variant="contained" loading={loading} sx={{ marginTop : '16px' }}>Submit</LoadingButton>
                        </form>
                    </Container>
                </Box>
            </Container>
        </>
    );
}
