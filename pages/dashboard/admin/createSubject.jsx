import { useRef, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Alert, Box, Collapse, Container, FormControl, FormHelperText, InputLabel, OutlinedInput, Snackbar, Typography } from '@mui/material';

import axios from '../../../utils/js/axios';

export default function CreateSubject() {
    const [ loading, setLoading ] = useState(false);
    const [ alertData, setAlertData ] = useState({ show : false, severity : '', text : '' });
    const [ openSnackbar, setOpenSnackbar ] = useState(false);
    const [ existingSubjectError, setExistingSubjectError ] = useState(false);

    const nameRef = useRef(null);
    const codeRef = useRef(null);

    const checkExistingSubject = () => {
        if (nameRef.current?.value && codeRef.current?.value) {
            axios.get(
                'api/subject/',
                { params : { name : nameRef.current.value, code : Number(codeRef.current.value) } }
            ).then(response => {
                if (response.status === 200) {
                    setExistingSubjectError(true);
                }
            }).catch(e => {
                if (e.response.status === 400 || e.response.status === 404) {
                    setExistingSubjectError(false);
                }
            });
        } else {
            setExistingSubjectError(false);
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        setLoading(true);

        axios.post(
            'api/subject/',
            { name : nameRef.current.value, code : Number(codeRef.current.value) }
        ).then(response => {
            if (response.status === 201) {
                setLoading(false);
                setAlertData({ show : true, severity : 'success', text : 'Created Subject Successfully' });
                setOpenSnackbar(true);
            }
        }).catch(() => {
            if (e.response.status === 400){
                setAlertData({ show : true, severity : 'error', text : 'Subject already exists with the given data' });
            }
            setLoading(false);
        });
    };

    return (
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
                <Typography variant="h5">Create Subject</Typography>
                <Container sx={{ marginTop : '30px', maxWidth : { xs : '90%', sm : '80%', md : '60%', lg : '45%' } }}>
                    <Collapse in={alertData.show}>
                        <Alert severity={alertData.severity} onClose={() => { setAlertData({ show : false, severity : '', text : '' }); }} sx={{ width : '100%', marginBottom : '8px' }}>
                            {alertData.text}
                        </Alert>
                    </Collapse>
                    <form onSubmit={handleSubmit}>
                        <FormControl margin="normal" sx={{ width : '100%' }} required>
                            <InputLabel htmlFor="__dashboard_admin__form_createsubject__name" error={existingSubjectError}>Name</InputLabel>
                            <OutlinedInput
                                id="__dashboard_admin__form_createsubject__name"
                                aria-describedby="__dashboard_admin__form_createsubject__name_helper"
                                label="Name"
                                inputRef={nameRef}
                                onChange={checkExistingSubject}
                                error={existingSubjectError}
                            />
                            <FormHelperText id="__dashboard_admin__form_createsubject__name_helper" error={existingSubjectError}>
                                { existingSubjectError ? 'Subject already exists with the given name and code' : null }
                            </FormHelperText>
                        </FormControl>
                        <FormControl margin="normal" sx={{ width : '100%' }} required>
                            <InputLabel htmlFor="__dashboard_admin__form_createsubject__code" error={existingSubjectError}>Code</InputLabel>
                            <OutlinedInput
                                id="__dashboard_admin__form_createsubject__code"
                                aria-describedby="__dashboard_admin__form_createsubject__code_helper"
                                type="number"
                                label="Code"
                                inputRef={codeRef}
                                onChange={checkExistingSubject}
                                error={existingSubjectError}
                            />
                            <FormHelperText id="__dashboard_admin__form_createsubject__code_helper" error={existingSubjectError}>
                                { existingSubjectError ? 'Subject already exists with the given name and code' : null }
                            </FormHelperText>
                        </FormControl>
                        <Container style={{ display : 'flex', flexDirection : 'row', marginTop : '20px' }} disableGutters>
                            <LoadingButton variant="contained" type="submit" loading={loading} disabled={existingSubjectError}>Submit</LoadingButton>
                        </Container>
                    </form>
                </Container>
                <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                    <Alert severity="success" onClose={() => setOpenSnackbar(false)} sx={{ width : '100%' }}>Created Subject Successfully</Alert>
                </Snackbar>
            </Box>
        </Container>
    );
}
