import { useContext, useEffect, useRef, useState } from 'react';

import moment from 'moment';

import { createFilterOptions } from '@mui/material/Autocomplete';
import { AdapterMoment, DatePicker, LoadingButton, LocalizationProvider } from '@mui/lab';
import { Alert, Autocomplete, Box, Button, Collapse, Container, FormControl, Input, InputLabel, LinearProgress, OutlinedInput, Snackbar, TextField, Typography } from '@mui/material';

import axios from '../../../utils/js/axios';
import { AuthContext } from '../../../utils/js/context';

export default function CreateAssignment() {
    const authContext = useContext(AuthContext);

    const classes = useState(null);
    const [ loading, setLoading ] = useState(false);
    const [ showAlert, setShowAlert ] = useState(false);
    const [ openSnackbar, setOpenSnackbar ] = useState(false);
    const [ uploadingFile, setUploadingFile ] = useState(false);
    const [ progress, setProgress ] = useState(0);

    const reader = new FileReader();
    reader.onloadstart = () => setUploadingFile(true);
    reader.onloadend = () => { setUploadingFile(false); setProgress(0); };
    reader.onabort = () => { setUploadingFile(false); setProgress(0); };
    reader.onprogress = data => {
        if (data.lengthComputable) {
            setProgress(parseInt( ((data.loaded / data.total) * 100), 10 ));
        }
    };

    const titleRef = useRef();
    const assignedTo = useState([]);
    const submissionDate = useState(null);
    const messageRef = useRef();
    const file = useState(null);

    useEffect(() => {
        !classes[0] ? axios.get('api/class/all/').then(response => classes[1](response.data.data)) : undefined;
    }, []); // eslint-disable-line

    const getURIFromFile = file => new Promise((resolve, reject) => {
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        const dataURI = await getURIFromFile(file[0]);
        axios.post('api/assignment/', {
            title           : titleRef.current.value,
            assigned_by     : authContext.userData.id,
            assigned_to     : assignedTo[0].map(val => val.id),
            submission_date : submissionDate[0],
            file            : dataURI,
            message         : messageRef.current.value,
        }).then(response => {
            if (response.status === 201) {
                setLoading(false);
                setShowAlert(true);
                setOpenSnackbar(true);
            }
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
                <Typography variant="h5">Create Assignment</Typography>
                <Container sx={{ marginTop : '30px', maxWidth : { xs : '90%', sm : '80%', md : '60%', lg : '45%' } }}>
                    <Collapse in={showAlert}>
                        <Alert severity="success" onClose={() => { setShowAlert(false); }} sx={{ width : '100%', marginBottom : '8px' }}>
                                Created Assignment Successfully
                        </Alert>
                    </Collapse>
                    <form onSubmit={handleSubmit}>
                        <FormControl margin="normal" sx={{ width : '100%' }} required>
                            <InputLabel htmlFor="__dashboard_teacher__form_createassignment__title">Title</InputLabel>
                            <OutlinedInput
                                id="__dashboard_teacher__form_createassignment__title"
                                label="Title"
                                inputRef={titleRef}
                            />
                        </FormControl>
                        <FormControl margin="normal" sx={{ width : '100%' }} required>
                            <Autocomplete
                                autoHighlight
                                multiple
                                options={classes[0] ? classes[0] : []}
                                getOptionLabel={option => `${option.grade}${option.section ? ` - ${option.section}` : ''}`}
                                filterOptions={createFilterOptions({ ignoreCase : true, stringify : option => `${option.grade}${option.section ? ` - ${option.section}` : ''}`, trim : true })}
                                isOptionEqualToValue={(option, value) => option.grade === value.grade && option.section === value.section}
                                value={assignedTo[0]}
                                onChange={(e, newValue) => assignedTo[1](newValue)}
                                renderOption={(props, option) => (
                                    <Box {...props} component="div" key={option.id}>
                                        <Typography variant="subtitle1" sx={{ marginLeft : '10px' }}>
                                            {option.grade}{option.section ? ` - ${option.section}` : ''}
                                        </Typography>
                                    </Box>
                                )}
                                renderInput={params => (
                                    <TextField
                                        required={assignedTo[0].length === 0}
                                        {...params}
                                        label={`Assigned to${assignedTo[0].length === 0 ? '' : ' *'}`}
                                        inputProps={{
                                            ...params.inputProps,
                                            autoComplete: 'new-password',
                                        }}
                                    />
                                )}
                            />
                        </FormControl>
                        <FormControl margin="normal" sx={{ width : '100%' }}>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <DatePicker
                                    disablePast
                                    label="Submission Date"
                                    value={submissionDate[0] ? moment(submissionDate[0]) : null}
                                    onChange={newValue => { submissionDate[1](moment(newValue).toISOString()); }}
                                    renderInput={params => <TextField {...params} helperText={`Format: ${params?.inputProps?.placeholder}`} />}
                                />
                            </LocalizationProvider>
                        </FormControl>
                        <FormControl margin="normal" sx={{ width : '100%' }}>
                            <InputLabel htmlFor="__dashboard_teacher__form_createassignment__message">Message</InputLabel>
                            <OutlinedInput
                                id="__dashboard_teacher__form_createassignment__message"
                                label="Message"
                                inputRef={messageRef}
                                multiline
                                rows={4}
                                inputProps={{ maxLength : 1000 }}
                            />
                        </FormControl>
                        <FormControl margin="normal" sx={{ width : '100%' }} required>
                            <Container sx={{ display : 'flex', flexDirection : 'column', gap : '10px' }} disableGutters>
                                <Typography variant="body1">{file[0] ? file[0].name : 'No File Chosen'}</Typography>
                                <Input
                                    id="__dashboard_teacher__form_createassignment__file"
                                    type="file"
                                    sx={{ display : 'none' }}
                                    onChange={event => {
                                        let _file = event.target.files[0];
                                        if (_file) {
                                            file[1](_file);
                                        }
                                    }}
                                />
                                <Button onClick={() => { document?.getElementById('__dashboard_teacher__form_createassignment__file').click(); }}>
                                    {file[0] ? 'Change Attachment' : 'Upload Attachment'}
                                </Button>
                                {file[0] ? <Button onClick={() => file[1](null)}>Remove Attachment</Button> : null}
                            </Container>
                        </FormControl>
                        <Container style={{ display : 'flex', flexDirection : 'column', marginTop : '10px', gap : '20px' }} disableGutters>
                            {uploadingFile ? (
                                <Container sx={{ display : 'flex', flexDirection : 'column', gap : '4px' }} disableGutters>
                                Uploading File...
                                    <LinearProgress variant="determinate" color="secondary" value={progress} />
                                </Container>
                            ) : null}
                            <Container disableGutters>
                                <LoadingButton variant="contained" type="submit" loading={loading} disabled={!file[0]}>Submit</LoadingButton>
                            </Container>
                        </Container>
                    </form>
                </Container>
                <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                    <Alert severity="success" onClose={() => setOpenSnackbar(false)} sx={{ width : '100%' }}>Created Assignment Successfully</Alert>
                </Snackbar>
            </Box>
        </Container>
    );
}
