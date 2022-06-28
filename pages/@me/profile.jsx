import { useContext, useEffect, useState } from 'react';

import Head from 'next/head';
import getConfig from 'next/config';

import { Avatar, Box, Container, Divider, Grid, Typography } from '@mui/material';

import axios from '../../utils/js/axios';
import { AuthContext } from '../../utils/js/context';

const { publicRuntimeConfig } = getConfig();

export default function Profile() {
    const authContext = useContext(AuthContext);

    const [ userData, setUserData ] = useState(null);
    const [ userTypeData, setUserTypeData ] = useState(null);

    useEffect(() => {
        if (!userData || !userTypeData) {
            axios.get('api/user/@me/', { params : { 'with-type' : 'true' } })
                .then(response => {
                    if (response.status === 200) {
                        /* eslint-disable no-case-declarations */
                        switch (authContext.userData.user_type) {
                            case 's':
                                const { student, ...studentData } = response.data.data;
                                setUserData(student);
                                setUserTypeData(studentData);
                                break;
                            case 't':
                                const { teacher, ...teacherData } = response.data.data;
                                setUserData(teacher);
                                setUserTypeData(teacherData);
                                break;
                            case 'p':
                                const { parent, ...parentData } = response.data.data;
                                setUserData(parent);
                                setUserTypeData(parentData);
                                break;
                            case 'm':
                                const { management, ...managementData } = response.data.data;
                                setUserData(management);
                                setUserTypeData(managementData);
                                break;
                            case 'a':
                                const { admin, ...adminData } = response.data.data;
                                setUserData(admin);
                                setUserTypeData(adminData);
                                break;
                        }
                        /* eslint-enable */
                    }
                });
        }
    }, []); // eslint-disable-line

    return (
        <>
            <Head>
                <title>Profile | {publicRuntimeConfig.SCHOOL_NAME}</title>
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
                    {
                        userData && userTypeData ? (
                            <>
                                <Container sx={{ display : 'flex', flexDirection : 'column', alignItems : 'center', padding : '30px 60px', gap : '20px', color : 'secondary.contrastText', overflowWrap : 'break-word' }} disableGutters>
                                    <Divider textAlign="left" sx={{ width : '100%' }}>
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
                                    </Divider>
                                    <Container sx={{ marginTop : '10px', marginLeft : '10%', color : 'primary.contrastText' }} disableGutters>
                                        <Typography variant="h5">{userData.first_name + (userData.last_name ? ` ${userData.last_name}` : '')}</Typography>
                                        {userData.user_type === 's' ? 'Student' : userData.user_type === 't' ? 'Teacher' : userData.user_type === 'p' ? 'Parent' : userData.user_type === 'm' ? 'Management' : userData.user_type === 'a' ? 'Admin' : null}
                                    </Container>
                                </Container>
                                <Container sx={{ display : 'flex', flexDirection : 'column', alignItems : 'left', padding : '30px 60px', gap : '20px', color : 'secondary.contrastText', overflowWrap : 'break-word' }} disableGutters>
                                    <Container sx={{ display : 'flex', flexDirection : 'column', paddingLeft : '5%' }} disableGutters>
                                        <Grid container spacing={7.5}>
                                            <Grid container item direction="column" spacing={1}>
                                                <Grid item>
                                                    <Typography variant="h6">About</Typography>
                                                    <Divider sx={{ marginBottom : '10px' }} />
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
                                                    <Divider sx={{ marginBottom : '10px' }} />
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
                                            <Grid container item direction="column" spacing={1}>
                                                <Grid item>
                                                    <Typography variant="h6">Other Info</Typography>
                                                    <Divider sx={{ marginBottom : '10px' }} />
                                                </Grid>
                                                {
                                                    userData.user_type === 's' ? (
                                                        <>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Parent</Grid>
                                                                <Grid item xs={6}>{userTypeData.parent.first_name + (userTypeData.parent.last_name ? ` ${userTypeData.parent.last_name}` : '') + ` ${userTypeData.parent.username}`}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Grade</Grid>
                                                                <Grid item xs={6}>{userTypeData.grade.grade + (userTypeData.grade.section ? ' - ' + userTypeData.grade.section : '')}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Roll No.</Grid>
                                                                <Grid item xs={6}>{userTypeData.roll_no}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Year of Enroll</Grid>
                                                                <Grid item xs={6}>{userTypeData.year_of_enroll}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Address</Grid>
                                                                <Grid item xs={6}>{userData.address ? userData.address : '-'}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Fee</Grid>
                                                                <Grid item xs={6}>{userTypeData.fee}</Grid>
                                                            </Grid>
                                                        </>
                                                    ) : userData.user_type === 't' ? (
                                                        <>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Subject</Grid>
                                                                <Grid item xs={6}>{userTypeData.subject.name + ` ${userTypeData.subject.code}`}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Year of Joining</Grid>
                                                                <Grid item xs={6}>{userTypeData.year_of_joining}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Classes</Grid>
                                                                <Grid item xs={6}>{userTypeData.classes.length !== 0 ? userTypeData.classes.map(value => { value.grade + (value.section ? ' - ' + value.section : ''); }) : '-'}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Owns Class</Grid>
                                                                <Grid item xs={6}>{userTypeData.owns_class ? (userTypeData.grade.grade + (userTypeData.grade.section ? ' - ' + userTypeData.grade.section : '')) : '-'}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Salary</Grid>
                                                                <Grid item xs={6}>{userTypeData.salary}</Grid>
                                                            </Grid>
                                                        </>
                                                    ) : userData.user_type === 'p' ? (
                                                        <></>
                                                    ) : userData.user_type === 'm' ? (
                                                        <>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Role</Grid>
                                                                <Grid item xs={6}>{userTypeData.role}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Year of Joining</Grid>
                                                                <Grid item xs={6}>{userTypeData.year_of_joining}</Grid>
                                                            </Grid>
                                                            <Grid container item>
                                                                <Grid item xs={6}>Salary</Grid>
                                                                <Grid item xs={6}>{userTypeData.salary}</Grid>
                                                            </Grid>
                                                        </>
                                                    ) : (
                                                        <></>
                                                    )
                                                }
                                            </Grid>
                                        </Grid>
                                    </Container>
                                </Container>
                            </>
                        ) : null
                    }
                </Box>
            </Container>
        </>
    );
}
