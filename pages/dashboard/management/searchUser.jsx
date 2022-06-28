import { useRef, useState } from 'react';

import { Alert, Avatar, Box, Collapse, Container, FormControl, Grid, InputLabel, OutlinedInput, Paper, Tab, Tabs, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import axios from '../../../utils/js/axios';

export default function SearchUser() {
    const [ loading, setLoading ] = useState(false);
    const [ tabValue, setTabValue ] = useState('search_by_username');
    const [ showAlert, setShowAlert ] = useState(false);

    const [ userData, setUserData ] = useState(null);

    const searchRef = useRef();

    const handleSubmit = e => {
        e.preventDefault();
        setLoading(true);
        setUserData(null);

        let queryParams = {};

        switch (tabValue) {
            case 'search_by_username':
                queryParams['username'] = searchRef.current.value;
                break;
            case 'search_by_email':
                queryParams['email_id'] = searchRef.current.value;
                break;
            case 'search_by_id':
                queryParams['id'] = searchRef.current.value;
                break;
        }

        axios.get('api/user/', { params : queryParams }).then(response => {
            if (response.status === 200) {
                setUserData(response.data.data);
                console.log(response.data.data);
                setLoading(false);
            }
        }).catch(e => {
            if (e.response.status === 404) {
                setShowAlert(true);
                setLoading(false);
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
                <Typography variant="h5">Search User</Typography>
                <Container sx={{ display : 'flex', justifyContent : 'center', marginTop : '30px', maxWidth : { xs : '100%', sm : '95%', md : '85%', lg : '70%' } }}>
                    <Tabs value={tabValue} onChange={(event, value) => setTabValue(value)} variant="scrollable" indicatorColor="secondary" textColor="secondary" allowScrollButtonsMobile>
                        <Tab value="search_by_username" label="Search by Username" />
                        <Tab value="search_by_email" label="Search by Email" />
                        <Tab value="search_by_id" label="Search by ID" />
                    </Tabs>
                </Container>
                <Container sx={{ marginTop : '30px', maxWidth : { xs : '90%', sm : '80%', md : '50%', lg : '40%' } }}>
                    <Collapse in={showAlert}>
                        <Alert severity="error" onClose={() => { setShowAlert(false); }} sx={{ width : '100%', marginBottom : '8px' }}>
                                No user found with the given credentials
                        </Alert>
                    </Collapse>
                    <form onSubmit={handleSubmit}>
                        {
                            tabValue === 'search_by_username' ? (
                                <FormControl margin="normal" sx={{ width : '100%' }} required>
                                    <InputLabel htmlFor="__dashboard_management__form_searchuser__username">Username</InputLabel>
                                    <OutlinedInput
                                        id="__dashboard_management__form_searchuser__username"
                                        inputRef={searchRef}
                                        inputProps={{ pattern : '[A-Za-z0-9_]+', title : 'Username can only contain alphabets, digits and underscore (_). Eg., John_123.' }}
                                        label="Username"
                                    />
                                </FormControl>
                            ) : null
                        }
                        {
                            tabValue === 'search_by_email' ? (
                                <FormControl margin="normal" sx={{ width : '100%' }} required>
                                    <InputLabel htmlFor="__dashboard_management__form_searchuser__email">Email ID</InputLabel>
                                    <OutlinedInput
                                        id="__dashboard_management__form_searchuser__email"
                                        type="email"
                                        inputRef={searchRef}
                                        label="Email ID"
                                    />
                                </FormControl>
                            ) : null
                        }
                        {
                            tabValue === 'search_by_id' ? (
                                <FormControl margin="normal" sx={{ width : '100%' }} required>
                                    <InputLabel htmlFor="__dashboard_management__form_searchuser__id">ID</InputLabel>
                                    <OutlinedInput
                                        id="__dashboard_management__form_searchuser__id"
                                        inputRef={searchRef}
                                        inputProps={{ pattern : '[0-9]+', title : 'ID can only contain integer values.' }}
                                        label="ID"
                                    />
                                </FormControl>
                            ) : null
                        }
                        <Container sx={{ display : 'flex', marginTop : '20px' }} disableGutters>
                            <LoadingButton loading={loading} type="submit" variant="contained">Search</LoadingButton>
                        </Container>
                    </form>
                </Container>
                {
                    userData ? (
                        <Container sx={{ marginTop : '60px', maxWidth : { xs : '95%', sm : '85%', md : '75%', lg : '70%' } }} disableGutters>
                            <Paper elevation={4} sx={{ backgroundColor : 'secondary.main' }}>
                                <Container sx={{ display : 'flex', flexDirection : 'column', alignItems : 'center', padding : '30px 60px', gap : '20px', color : 'secondary.contrastText', overflowWrap : 'break-word' }} disableGutters>
                                    <Typography variant="h5">Profile</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={4}>
                                            {
                                                userData.avatar ? (
                                                    <Avatar
                                                        alt={`${userData.first_name}${userData.last_name ? ` ${userData.last_name}` : ''}'s Avatar`}
                                                        src={userData.avatar}
                                                        sx={{ width : { xs : '50px', sm : '60px', md : '80px', lg : '100px' }, height : { xs : '50px', sm : '60px', md : '80px', lg : '100px' } }}
                                                    />
                                                ) : (
                                                    <Avatar
                                                        alt={`${userData.first_name}${userData.last_name ? ` ${userData.last_name}` : ''}'s Avatar`}
                                                        sx={{ width : { xs : '50px', sm : '60px', md : '80px', lg : '100px' }, height : { xs : '50px', sm : '60px', md : '80px', lg : '100px' } }}
                                                    >
                                                        {`${userData.first_name.charAt(0)}${userData.last_name ? `${userData.last_name.charAt(0)}` : ''}`}
                                                    </Avatar>
                                                )
                                            }
                                        </Grid>
                                        <Grid container item xs={8}>
                                            <Grid container item direction="column" spacing={1} justifyContent="center">
                                                <Grid item>{userData.first_name + (userData.last_name ? ` ${userData.last_name}` : '')}</Grid>
                                                <Grid item>{userData.email_id}</Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid container item direction="column" spacing={1}>
                                            <Grid item>
                                                <Typography variant="h6">Account Info</Typography>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>User ID</Grid>
                                                <Grid item xs={6}>{userData.id}</Grid>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>Username</Grid>
                                                <Grid item xs={6}>{userData.username}</Grid>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>Email Address</Grid>
                                                <Grid item xs={6}>{userData.email_id}</Grid>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>Type</Grid>
                                                <Grid item xs={6}>{userData.user_type === 's' ? 'Student' : userData.user_type === 't' ? 'Teacher' : userData.user_type === 'p' ? 'Parent' : userData.user_type === 'm' ? 'Management' : userData.user_type === 'a' ? 'Admin' : null}</Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid container item direction="column" spacing={1}>
                                            <Grid item>
                                                <Typography variant="h6">Personal Info</Typography>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>Name</Grid>
                                                <Grid item xs={6}>{userData.first_name + (userData.last_name ? ` ${userData.last_name}` : '')}</Grid>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>Date of Birth</Grid>
                                                <Grid item xs={6}>{userData.date_of_birth}</Grid>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>Gender</Grid>
                                                <Grid item xs={6}>{userData.gender === 'm' ? 'Male' : userData.gender === 'f' ? 'Female' : userData.gender === 'o' ? 'Other' : null}</Grid>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>Contact No.</Grid>
                                                <Grid item xs={6}>{userData.contact_no}</Grid>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>Address</Grid>
                                                <Grid item xs={6}>{userData.address ? userData.address : '-'}</Grid>
                                            </Grid>
                                            <Grid container item>
                                                <Grid item xs={6}>Date Joined</Grid>
                                                <Grid item xs={6}>{userData.date_joined}</Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Container>
                            </Paper>
                        </Container>
                    ) : null
                }
            </Box>
        </Container>
    );
}
