import { useRef, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Alert, Box, Collapse, Container, FormControl, FormHelperText, InputLabel, OutlinedInput, Snackbar, Typography } from '@mui/material';

import axios from '../../../utils/js/axios';

export default function CreateClass() {
    const [ loading, setLoading ] = useState(false);
    const [ alertData, setAlertData ] = useState({ show : false, severity : '', text : '' });
    const [ openSnackbar, setOpenSnackbar ] = useState(false);
    const [ existingClassError, setExistingClassError ] = useState(false);

    const gradeRef = useRef(null);
    const sectionRef = useRef(null);

    const checkExistingClass = () => {
        if (gradeRef.current?.value) {
            axios.get(
                'api/class/',
                { params : { grade : gradeRef.current.value, section : sectionRef.current.value } }
            ).then(response => {
                if (response.status === 200) {
                    setExistingClassError(true);
                }
            }).catch(e => {
                if (e.response.status === 400 || e.response.status === 404) {
                    setExistingClassError(false);
                }
            });
        } else {
            setExistingClassError(false);
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        setLoading(true);

        axios.post(
            'api/class/',
            { grade : gradeRef.current.value, section : sectionRef.current.value }
        ).then(response => {
            if (response.status === 201) {
                setLoading(false);
                setAlertData({ show : true, severity : 'success', text : 'Created Class Successfully' });
                setOpenSnackbar(true);
            }
        }).catch(() => {
            if (e.response.status === 400){
                setAlertData({ show : true, severity : 'error', text : 'Class already exists with the given data' });
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
                <Typography variant="h5">Create Class</Typography>
                <Container sx={{ marginTop : '30px', maxWidth : { xs : '90%', sm : '80%', md : '60%', lg : '45%' } }}>
                    <Collapse in={alertData.show}>
                        <Alert severity={alertData.severity} onClose={() => { setAlertData({ show : false, severity : '', text : '' }); }} sx={{ width : '100%', marginBottom : '8px' }}>
                            {alertData.text}
                        </Alert>
                    </Collapse>
                    <form onSubmit={handleSubmit}>
                        <FormControl margin="normal" sx={{ width : '100%' }} required>
                            <InputLabel htmlFor="__dashboard_management__form_createclass__grade" error={existingClassError}>Grade</InputLabel>
                            <OutlinedInput
                                id="__dashboard_management__form_createclass__grade"
                                aria-describedby="__dashboard_management__form_createclass__grade_helper"
                                label="Grade"
                                inputRef={gradeRef}
                                onChange={checkExistingClass}
                                error={existingClassError}
                            />
                            <FormHelperText id="__dashboard_management__form_createclass__grade_helper" error={existingClassError}>
                                { existingClassError ? 'Class already exists with the given grade and section' : null }
                            </FormHelperText>
                        </FormControl>
                        <FormControl margin="normal" sx={{ width : '100%' }}>
                            <InputLabel htmlFor="__dashboard_management__form_createclass__section" error={existingClassError}>Section</InputLabel>
                            <OutlinedInput
                                id="__dashboard_management__form_createclass__section"
                                aria-describedby="__dashboard_management__form_createclass__section_helper"
                                label="Section"
                                inputRef={sectionRef}
                                onChange={checkExistingClass}
                                error={existingClassError}
                            />
                            <FormHelperText id="__dashboard_management__form_createclass__section_helper" error={existingClassError}>
                                { existingClassError ? 'Class already exists with the given grade and section' : null }
                            </FormHelperText>
                        </FormControl>
                        <Container style={{ display : 'flex', flexDirection : 'row', marginTop : '20px' }} disableGutters>
                            <LoadingButton variant="contained" type="submit" loading={loading}>Submit</LoadingButton>
                        </Container>
                    </form>
                </Container>
                <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                    <Alert severity="success" onClose={() => setOpenSnackbar(false)} sx={{ width : '100%' }}>Created Class Successfully</Alert>
                </Snackbar>
            </Box>
        </Container>
    );
}
