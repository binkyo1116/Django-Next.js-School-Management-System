import { useRef, useState } from 'react';

import Head from 'next/head';
import getConfig from 'next/config';

import { LoadingButton } from '@mui/lab';
import { Alert, Box, Collapse, Container, FormControl, InputLabel, OutlinedInput, Typography } from '@mui/material';

import axios from '../utils/js/axios';

const { publicRuntimeConfig } = getConfig();

export default function Contact() {
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const emailRef = useRef();
    const messageRef = useRef();

    const [ loading, setLoading ] = useState(false);
    const [ showAlert, setShowAlert ] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();

        setShowAlert(false);
        setLoading(true);

        axios.post(
            'api/contact/',
            {
                first_name : firstNameRef.current.value,
                last_name  : lastNameRef.current.value ? lastNameRef.current.value : null,
                email_id   : emailRef.current.value,
                message    : messageRef.current.value,
            }
        ).then(response => {
            if (response.status === 201) {
                setLoading(false);
                setShowAlert(true);
            }
        }).catch(() => {
            setLoading(false);
        });
    };

    return (
        <>
            <Head>
                <title>Contact Us | {publicRuntimeConfig.SCHOOL_NAME}</title>
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
                    <Typography variant="h5">Contact Us</Typography>
                    <Container sx={{ marginTop : '30px', maxWidth : { xs : '100%', sm : '80%', md : '60%', lg : '50%' } }}>
                        <Collapse in={showAlert}>
                            <Alert severity="success" onClose={() => { setShowAlert(false); }} sx={{ width : '100%', marginBottom : '8px' }}>
                                Thank You! Your response has been successfully submitted.
                            </Alert>
                        </Collapse>
                        <form onSubmit={handleSubmit}>
                            <Container sx={{ display : 'flex', flexDirection : 'row', gap : '20px' }} disableGutters>
                                <FormControl margin="normal" sx={{ width : '100%' }} required>
                                    <InputLabel htmlFor="__contact_form__inp_firstname">First Name</InputLabel>
                                    <OutlinedInput
                                        id="__contact_form__inp_firstname"
                                        type="text"
                                        inputRef={firstNameRef}
                                        label="First Name"
                                        inputProps={{ maxLength : 255 }}
                                    />
                                </FormControl>
                                <FormControl margin="normal" sx={{ width : '100%' }}>
                                    <InputLabel htmlFor="__contact_form__inp_lastname">Last Name</InputLabel>
                                    <OutlinedInput
                                        id="__contact_form__inp_lastname"
                                        type="text"
                                        inputRef={lastNameRef}
                                        label="Last Name"
                                        inputProps={{ maxLength : 255 }}
                                    />
                                </FormControl>
                            </Container>
                            <FormControl margin="normal" sx={{ width : '100%' }} required>
                                <InputLabel htmlFor="__contact_form__inp_emailid">Email ID</InputLabel>
                                <OutlinedInput
                                    id="__contact_form__inp_emailid"
                                    type="email"
                                    inputRef={emailRef}
                                    label="Email ID"
                                    inputProps={{ maxLength : 1023 }}
                                />
                            </FormControl>
                            <FormControl margin="normal" sx={{ width : '100%' }} required>
                                <InputLabel htmlFor="__contact_form__inp_message">Message</InputLabel>
                                <OutlinedInput
                                    id="__contact_form__inp_message"
                                    type="text"
                                    inputRef={messageRef}
                                    label="Message"
                                    multiline
                                    rows={5}
                                    inputProps={{ maxLength : 10000 }}
                                />
                            </FormControl>
                            <LoadingButton type="submit" variant="contained" loading={loading} sx={{ marginTop : '16px' }}>Submit</LoadingButton>
                        </form>
                    </Container>
                </Box>
            </Container>
        </>
    );
}
