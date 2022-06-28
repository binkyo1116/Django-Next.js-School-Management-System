import { cloneElement, createContext, forwardRef, useState, useRef, useContext, useEffect } from 'react';

import Image from 'next/image';

import moment from 'moment';

import { createFilterOptions } from '@mui/material/Autocomplete';
import { AdapterMoment, DatePicker, LoadingButton, LocalizationProvider } from '@mui/lab';
import { ContactPageOutlined, CheckCircleOutlined, BadgeOutlined, InfoOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import {
    Alert, AlertTitle, Autocomplete, Avatar, Box, Button, CircularProgress, Collapse, Container, FormControl,
    FormHelperText, IconButton, Input, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Snackbar,
    Step, StepLabel, Stepper, TextField, Typography
} from '@mui/material';

import { List as VirtualizedList, AutoSizer } from 'react-virtualized';

import axios from '../../../utils/js/axios';
import { countries } from '../../../utils/js/countries.js';

const _blankData = {
    username    : null,
    email       : null,
    password    : null,
    firstName   : null,
    lastName    : null,
    userType    : '',
    dateOfBirth : null,
    gender      : '',
    contactNo   : null,
    address     : null,
    avatar      : null,

    student: {
        parentUsername : null,
        class          : null,
        rollNo         : null,
        fee            : null,
    },
    teacher: {
        subject   : null,
        salary    : null,
        classes   : [],
        ownsClass : null,
    },
    management: {
        role   : null,
        salary : null,
    },

    temp: {
        step2: {
            countryCode                 : null,
            contactNoWithoutCountryCode : null,
            avatarImage                 : null,
        },
        step3: {
            invalidParentUsernameError : false,
            uniqueUsernameError        : false,
            classes                    : null,
            subjects                   : null,

            student: {
                class: null,
            },
        },
        success      : false,
        openSnackbar : false,
    }
};

const CreateUserContext = createContext(_blankData);

const CreateUserProvider = ({ children }) => {
    const contextData = {
        username    : useState(_blankData.username),
        email       : useState(_blankData.email),
        password    : useState(_blankData.password),
        firstName   : useState(_blankData.firstName),
        lastName    : useState(_blankData.lastName),
        userType    : useState(_blankData.userType),
        dateOfBirth : useState(_blankData.dateOfBirth),
        gender      : useState(_blankData.gender),
        contactNo   : useState(_blankData.contactNo),
        address     : useState(_blankData.address),
        avatar      : useState(_blankData.avatar),

        student: {
            parentUsername : useState(_blankData.student.parentUsername),
            class          : useState(_blankData.student.class),
            rollNo         : useState(_blankData.student.rollNo),
            fee            : useState(_blankData.student.fee),
        },
        teacher: {
            subject   : useState(_blankData.teacher.subject),
            salary    : useState(_blankData.teacher.salary),
            classes   : useState(_blankData.teacher.classes),
            ownsClass : useState(_blankData.teacher.ownsClass),
        },
        management: {
            role   : useState(_blankData.management.role),
            salary : useState(_blankData.management.salary),
        },

        temp: {
            step2: {
                countryCode                 : useState(_blankData.temp.step2.countryCode),
                contactNoWithoutCountryCode : useState(_blankData.temp.step2.contactNoWithoutCountryCode),
                avatarImage                 : useState(_blankData.temp.step2.avatarImage),
            },
            step3: {
                classes  : useState(_blankData.temp.step3.classes),
                subjects : useState(_blankData.temp.step3.subjects),

                student: {
                    class: useState(_blankData.temp.step3.student.class),
                },
            },
            success      : useState(_blankData.temp.success),
            openSnackbar : useState(_blankData.temp.openSnackbar),
        },

        clearContext: () => {
            contextData.username[1](_blankData.username);
            contextData.email[1](_blankData.email);
            contextData.password[1](_blankData.password);
            contextData.firstName[1](_blankData.firstName);
            contextData.lastName[1](_blankData.lastName);
            contextData.userType[1](_blankData.userType);
            contextData.dateOfBirth[1](_blankData.dateOfBirth);
            contextData.gender[1](_blankData.gender);
            contextData.contactNo[1](_blankData.contactNo);
            contextData.address[1](_blankData.address);
            contextData.avatar[1](_blankData.avatar);
            contextData.student.parentUsername[1](_blankData.student.parentUsername);
            contextData.student.class[1](_blankData.student.class);
            contextData.student.rollNo[1](_blankData.student.rollNo);
            contextData.student.fee[1](_blankData.student.fee);
            contextData.teacher.subject[1](_blankData.teacher.subject);
            contextData.teacher.salary[1](_blankData.teacher.salary);
            contextData.teacher.classes[1](_blankData.teacher.classes);
            contextData.teacher.ownsClass[1](_blankData.teacher.ownsClass);
            contextData.management.salary[1](_blankData.management.salary);
            contextData.temp.step2.countryCode[1](_blankData.temp.step2.countryCode);
            contextData.temp.step2.contactNoWithoutCountryCode[1](_blankData.temp.step2.contactNoWithoutCountryCode);
            contextData.temp.step2.avatarImage[1](_blankData.temp.step2.avatarImage);
            contextData.temp.step3.classes[1](_blankData.temp.step3.classes);
            contextData.temp.step3.subjects[1](_blankData.temp.step3.subjects);
            contextData.temp.step3.student.class[1](_blankData.temp.step3.student.class);
            contextData.temp.success[1](_blankData.temp.success);
            // contextData.temp.openSnackbar[1](_blankData.temp.openSnackbar); To be done on handling navigate to start
        },
    };

    return (
        <CreateUserContext.Provider value={contextData}>
            {children}
        </CreateUserContext.Provider>
    );
};

const steps = [{ label : 'Account Info', icon : ContactPageOutlined }, { label : 'Personal Details', icon : InfoOutlined }, { label : 'User Info', icon : BadgeOutlined }];

const AccountInfoStep = ({ handleStepperNext }) => {
    const context = useContext(CreateUserContext);

    const username = useRef(context.username[0]);
    const email = useRef(context.email[0]);
    const password = useRef(context.password[0]);
    const reEnterPassword = useRef(context.password[0]);
    const showPassword = useState(false);
    const invalidUsernameError = useState(false);
    const uniqueUsernameError = useState(false);
    const invalidEmailError = useState(false);
    const uniqueEmailError = useState(false);
    const passwordError = useState(false);
    const passwordErrorMessages = useState([]);
    const reEnterPasswordError = useState(false);

    const checkUniqueUsernameValidation = () => {
        if (username.current.value !== '') {
            axios.get('api/user/', { params : { username : username.current.value } })
                .then(response => { response.status === 200 ? uniqueUsernameError[1](true) : undefined; })
                .catch(e => { e.response.status === 404 ? uniqueUsernameError[1](false) : undefined; });
        } else uniqueUsernameError[1](false);
    };

    const checkUsernameStringValidation = () => {
        if (username.current.value !== '') {
            username.current.value.split('').map(val => {
                const cc = val.charCodeAt();
                !((48 <= cc && cc <= 57) || (65 <= cc && cc <= 90) || (cc === 95) || (97 <= cc && cc <= 122)) ? invalidUsernameError[1](true) : invalidUsernameError[1](false);
            });
        } else invalidUsernameError[1](false);
    };

    const checkUniqueEmailValidation = () => {
        if (email.current.value !== '') {
            axios.get('api/user/', { params : { email_id : String(email.current.value).toLowerCase() } })
                .then(response => { response.status === 200 ? uniqueEmailError[1](true) : undefined; })
                .catch(e => { e.response.status === 404 ? uniqueEmailError[1](false) : undefined; });
        } else uniqueEmailError[1](false);
    };

    const checkEmailStringValidation = () => {
        if (email.current.value !== '') {
            String(email.current.value).toLowerCase()
                .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) ?
                invalidEmailError[1](false) : invalidEmailError[1](true);
        } else invalidEmailError[1](false);
    };

    const checkPasswordValidation = () => {
        if (password.current.value === '') { passwordErrorMessages[1]([]); passwordError[1](false); }
        else {
            axios.post('auth/password/validate/', {
                username : typeof username.current !== 'object' ? username.current : username.current?.value,
                email_id : typeof email.current !== 'object' ? email.current : email.current?.value,
                password : password.current.value,
            })
                .then(response => { if (response.status === 200) { passwordErrorMessages[1]([]); passwordError[1](false); } })
                .catch(e => { if (e.response.status === 400) { passwordErrorMessages[1](e.response.data.error.errors); passwordError[1](true); } });
        }
    };

    const checkPasswordsEquality = () => {
        if (!reEnterPassword.current.value) {
            reEnterPasswordError[1](false);
        } else {
            if (!password.current.value) reEnterPasswordError[1](true);
            else password.current.value === reEnterPassword.current.value ? reEnterPasswordError[1](false) : reEnterPasswordError[1](true);
        }
    };

    const handleSubmit = e => {
        e.preventDefault();

        context.username[1](username.current.value);
        context.email[1](String(email.current.value).toLowerCase());
        context.password[1](password.current.value);

        handleStepperNext();
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit}>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <InputLabel htmlFor="__dashboard_admin__form_createuser_step1__username" error={invalidUsernameError[0] || uniqueUsernameError[0]}>Username</InputLabel>
                <OutlinedInput
                    id="__dashboard_admin__form_createuser_step1__username"
                    aria-describedby="__dashboard_admin__form_createuser_step1__username_helper"
                    label="Username"
                    autoComplete="username"
                    inputRef={username}
                    defaultValue={username.current}
                    error={invalidUsernameError[0] || uniqueUsernameError[0]}
                    onChange={() => { checkUniqueUsernameValidation(); checkUsernameStringValidation(); }}
                    inputProps={{ pattern : '[A-Za-z0-9_]+', title : 'Username can only contain alphabets, digits and underscore (_). Eg., John_123.' }}
                />
                <FormHelperText id="__dashboard_admin__form_createuser_step1__username_helper" error={invalidUsernameError[0] || uniqueUsernameError[0]}>
                    {invalidUsernameError[0] ? 'Username can only contain alphabets, digits and underscore (_). Eg., John_123.' : null}
                    {uniqueUsernameError[0] ? 'This Username is already taken, please try another.' : null}
                </FormHelperText>
            </FormControl>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <InputLabel htmlFor="__dashboard_admin__form_createuser_step1__email" error={invalidEmailError[0] || uniqueEmailError[0]}>Email ID</InputLabel>
                <OutlinedInput
                    id="__dashboard_admin__form_createuser_step1__email"
                    aria-describedby="__dashboard_admin__form_createuser_step1__email_helper"
                    label="Email ID"
                    type="email"
                    inputRef={email}
                    defaultValue={email.current}
                    error={invalidEmailError[0] || uniqueEmailError[0]}
                    onChange={() => { checkUniqueEmailValidation(); checkEmailStringValidation(); }}
                />
                <FormHelperText id="__dashboard_admin__form_createuser_step1__email_helper" error={invalidEmailError[0] || uniqueEmailError[0]}>
                    {invalidEmailError[0] ? 'Email ID is not valid.' : null}
                    {uniqueEmailError[0] ? 'This Email ID is already in use, please try another.' : null}
                </FormHelperText>
            </FormControl>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <InputLabel htmlFor="__dashboard_admin__form_createuser_step1__password" error={passwordError[0]}>Password</InputLabel>
                <OutlinedInput
                    id="__dashboard_admin__form_createuser_step1__password"
                    aria-describedby="__dashboard_admin__form_createuser_step1__password_helper"
                    label="Password"
                    autoComplete="new-password"
                    type={showPassword[0] ? 'text' : 'password'}
                    inputRef={password}
                    defaultValue={password.current}
                    error={passwordError[0]}
                    onChange={() => { checkPasswordValidation(); checkPasswordsEquality(); }}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={() => showPassword[1](val => !val)} edge="end">
                                {showPassword[0] ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
                <FormHelperText id="__dashboard_admin__form_createuser_step1__password_helper" error={passwordError[0]}>{passwordErrorMessages[0].join(' ')}</FormHelperText>
            </FormControl>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <InputLabel htmlFor="__dashboard_admin__form_createuser_step1__reenterpassword" error={reEnterPasswordError[0]}>Re-Enter Password</InputLabel>
                <OutlinedInput
                    id="__dashboard_admin__form_createuser_step1__reenterpassword"
                    aria-describedby="__dashboard_admin__form_createuser_step1__reenterpassword_helper"
                    label="Re-Enter Password"
                    autoComplete="new-password"
                    type={showPassword[0] ? 'text' : 'password'}
                    inputRef={reEnterPassword}
                    defaultValue={reEnterPassword.current}
                    error={reEnterPasswordError[0]}
                    onChange={checkPasswordsEquality}
                />
                <FormHelperText id="__dashboard_admin__form_createuser_step1__reenterpassword_helper" error={reEnterPasswordError[0]}>{reEnterPasswordError[0] ? 'Passwords does not Match' : ' '}</FormHelperText>
            </FormControl>
            <Container style={{ display : 'flex', flexDirection : 'row', justifyContent : 'space-between', marginTop : '20px' }}>
                <Button disabled>Back</Button>
                <Button
                    variant="contained" type="submit"
                    disabled={!([ invalidUsernameError[0], uniqueUsernameError[0], invalidEmailError[0], uniqueEmailError[0], passwordError[0], reEnterPasswordError[0] ].every(v => v === false))}
                >
                        Next
                </Button>
            </Container>
        </form>
    );
};

// eslint-disable-next-line react/display-name
const VirtualizedListboxComponent = forwardRef((props, ref) => {
    const { children, ...other } = props;
    const itemCount = Array.isArray(children) ? children.length : 0;

    return (
        <div ref={ref}>
            <div {...other} style={{ flex : '1 1 auto', height : '100vh' }}>
                <AutoSizer>
                    {({ height, width }) => (
                        <VirtualizedList
                            height={height}
                            width={width}
                            rowCount={itemCount}
                            rowHeight={40}
                            overscancount={5}
                            rowRenderer={props => {
                                return cloneElement(children[props.index], {
                                    style: props.style
                                });
                            }}
                        />
                    )}
                </AutoSizer>
            </div>
        </div>
    );
});

const PersonalInfoStep = ({ handleStepperBack, handleStepperNext }) => {
    const context = useContext(CreateUserContext);

    const firstName = useRef(context.firstName[0]);
    const lastName = useRef(context.lastName[0]);
    const userType = useState(context.userType[0]);
    const gender = useState(context.gender[0]);
    const address = useRef(context.address[0]);
    const dateOfBirth = useState(context.dateOfBirth[0]);

    const countryCode = useState(context.temp.step2.countryCode[0]);
    const contactNoWithoutCountryCode = useState(context.temp.step2.contactNoWithoutCountryCode[0]);
    const avatarImage = useState(context.temp.step2.avatarImage[0]);

    const getURIFromFile = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleSubmit = async e => {
        e.preventDefault();

        context.firstName[1](firstName.current.value);
        context.lastName[1](lastName.current.value);
        context.userType[1](userType[0]);
        context.gender[1](gender[0]);
        context.address[1](address.current.value);
        context.dateOfBirth[1](dateOfBirth[0]);
        context.contactNo[1](`+${countryCode[0].code}${contactNoWithoutCountryCode[0]}`);
        context.avatar[1](avatarImage[0] ? await getURIFromFile(avatarImage[0]) : null);

        context.temp.step2.countryCode[1](countryCode[0]);
        context.temp.step2.contactNoWithoutCountryCode[1](contactNoWithoutCountryCode[0]);
        context.temp.step2.avatarImage[1](avatarImage[0]);

        handleStepperNext();
    };

    return (
        <form onSubmit={handleSubmit}>
            <Container sx={{ display : 'flex', flexDirection : 'row', gap : '20px' }} disableGutters>
                <FormControl margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__dashboard_admin__form_createuser_step2__firstname">First Name</InputLabel>
                    <OutlinedInput
                        id="__dashboard_admin__form_createuser_step2__firstname"
                        label="First Name"
                        autoComplete="given-name"
                        inputRef={firstName}
                        defaultValue={firstName.current}
                    />
                </FormControl>
                <FormControl margin="normal" sx={{ width : '100%' }}>
                    <InputLabel htmlFor="__dashboard_admin__form_createuser_step2__lastname">Last Name</InputLabel>
                    <OutlinedInput
                        id="__dashboard_admin__form_createuser_step2__lastname"
                        label="Last Name"
                        autoComplete="family-name"
                        inputRef={lastName}
                        defaultValue={lastName.current}
                    />
                </FormControl>
            </Container>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                        label="Date of Birth"
                        autoComplete="bday"
                        value={dateOfBirth[0] ? moment(dateOfBirth[0]) : null}
                        onChange={newValue => { dateOfBirth[1](moment(newValue).toISOString()); }}
                        renderInput={params => <TextField required {...params} helperText={`Format: ${params?.inputProps?.placeholder}`} />}
                    />
                </LocalizationProvider>
            </FormControl>
            <Container sx={{ display : 'flex', flexDirection : 'row', gap : '20px' }} disableGutters>
                <FormControl margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__dashboard_admin__form_createuser_step2__usertype">User Type</InputLabel>
                    <Select
                        labelId="__dashboard_admin__form_createuser_step2__usertype"
                        label="User Type"
                        autoComplete="off"
                        value={userType[0]}
                        onChange={event => userType[1](event.target.value)}
                    >
                        <MenuItem value="s">Student</MenuItem>
                        <MenuItem value="t">Teacher</MenuItem>
                        <MenuItem value="p">Parent</MenuItem>
                        <MenuItem value="m">Management</MenuItem>
                    </Select>
                </FormControl>
                <FormControl margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__dashboard_admin__form_createuser_step2__gender">Gender</InputLabel>
                    <Select
                        labelId="__dashboard_admin__form_createuser_step2__gender"
                        label="Gender"
                        autoComplete="off"
                        value={gender[0]}
                        onChange={event => gender[1](event.target.value)}
                    >
                        <MenuItem value="m">Male</MenuItem>
                        <MenuItem value="f">Female</MenuItem>
                        <MenuItem value="o">Other</MenuItem>
                    </Select>
                </FormControl>
            </Container>
            <Container sx={{ display : 'flex', flexDirection : 'row', gap : '5px' }} disableGutters>
                <FormControl margin="normal" sx={{ width : { xs : '80%', md : '45%' } }} required>
                    <Autocomplete
                        autoHighlight
                        ListboxComponent={VirtualizedListboxComponent}
                        options={countries}
                        getOptionLabel={option => `+${option.code}` }
                        filterOptions={createFilterOptions({ ignoreCase : true, stringify : option => `+${option.code}`, trim : true })}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                        value={countryCode[0]}
                        onChange={(e, newValue) => countryCode[1](newValue)}
                        renderOption={(props, option) => (
                            <Box {...props} component="div" key={option.abbr}>
                                <Image
                                    width={15}
                                    height={10}
                                    src={`https://flagcdn.com/${option.abbr.toLowerCase()}.svg`}
                                    srcSet={`https://flagcdn.com/${option.abbr.toLowerCase()}.svg 2x`}
                                    alt=""
                                />
                                <Typography variant="subtitle1" sx={{ marginLeft : '10px' }}>+{option.code}</Typography>
                            </Box>
                        )}
                        renderInput={params => (
                            <TextField
                                {...params}
                                required
                                label="Code"
                                inputProps={{
                                    ...params.inputProps,
                                    autoComplete: 'tel-country-code',
                                }}
                            />
                        )}
                    />
                </FormControl>
                <FormControl margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__dashboard_admin__form_createuser_step2__contactno">Contact No.</InputLabel>
                    <OutlinedInput
                        id="__dashboard_admin__form_createuser_step2__contactno"
                        type="tel"
                        label="Contact No."
                        autoComplete="tel-national"
                        value={contactNoWithoutCountryCode[0]}
                        onChange={event => contactNoWithoutCountryCode[1](event.target.value)}
                        inputProps={{ minLength : 10, maxLength : 10, inputMode : 'numeric', pattern : '[0-9]+', title : 'Contact No. can only contain numbers' }}
                        sx={{ paddingLeft : 0 }}
                    />
                </FormControl>
            </Container>
            <FormControl margin="normal" sx={{ width : '100%' }}>
                <InputLabel htmlFor="__dashboard_admin__form_createuser_step2__address">Address</InputLabel>
                <OutlinedInput
                    id="__dashboard_admin__form_createuser_step2__address"
                    label="Address"
                    autoComplete="address-level4"
                    inputRef={address}
                    // defaultValue={address.current}
                    // Not sure why it is re-rendering while focusing on poppers, for now just gonna *hack* it
                    defaultValue={typeof address.current !== 'object' ? address.current : address.current?.value}
                    multiline
                    rows={3}
                    inputProps={{ maxLength : 1000 }}
                />
            </FormControl>
            <Container sx={{ display : 'flex', flexDirection : 'row', gap : '20px' }} disableGutters>
                <FormControl margin="normal" sx={{ width : '100%' }}>
                    <Container sx={{ display : 'flex', flexDirection : 'row' }} disableGutters>
                        <Container sx={{ display : 'flex', flexDirection : 'column', gap : '10px', width : '80%' }} disableGutters>
                            <Input
                                id="__dashboard_admin__form_createuser_step2__avatar_input"
                                accept="image/*"
                                type="file"
                                sx={{ display : 'none' }}
                                onChange={event => {
                                    let file = event.target.files[0];
                                    if (file) {
                                        file.__blobUrl = URL.createObjectURL(file);
                                        avatarImage[1](file);
                                    }
                                }}
                            />
                            <Button onClick={() => { document?.getElementById('__dashboard_admin__form_createuser_step2__avatar_input').click(); }}>
                                {avatarImage[0] ? 'Change Avatar' : 'Upload Avatar'}
                            </Button>
                            {avatarImage[0] ? <Button onClick={() => avatarImage[1](null)}>Remove Avatar</Button> : null}
                        </Container>
                        <Container sx={{ display : 'flex', flexDirection : 'row', justifyContent : 'space-evenly' }} disableGutters>
                            {avatarImage[0] ? <Avatar id="__dashboard_admin__form_createuser_step2__avatar_preview" alt="Avatar" src={avatarImage[0].__blobUrl} sx={{ width : '100px', height : '100px' }} /> : null}
                        </Container>
                    </Container>
                </FormControl>
            </Container>
            <Container style={{ display : 'flex', flexDirection : 'row', justifyContent : 'space-between', marginTop : '40px' }}>
                <Button onClick={handleStepperBack}>Back</Button>
                <LoadingButton variant="contained" type="submit">Next</LoadingButton>
            </Container>
        </form>
    );
};


const StudentAccount = ({ handleStepperBack, handleStepperNext }) => {
    const context = useContext(CreateUserContext);
    const classes = useState(context.temp.step3.classes[0]);

    useEffect(() => {
        !classes[0] ? axios.get('api/class/all/').then(response => { classes[1](response.data.data); context.temp.step3.classes[1](response.data.data); }) : undefined;
    }, []); // eslint-disable-line

    const student_ParentUsername = useRef(context.student.parentUsername[0]);
    const student_Class = useState(context.student.class[0]);
    const student_RollNo = useRef(context.student.rollNo[0]);
    const student_Fee = useRef(context.student.fee[0]);
    const student_InvalidUsernameError = useState(false);
    const student_ExistingUsernameError = useState(false);

    const checkExistingParentUsernameValidation = () => {
        if (student_ParentUsername.current.value !== '') {
            axios.get('api/user/', { params : { username : student_ParentUsername.current.value } })
                .then(response => { (response.status === 200 && response.data.data.user_type === 'p') ? student_ExistingUsernameError[1](false) : (response.status === 200 && response.data.data.user_type !== 'p' ? student_ExistingUsernameError[1](true) : undefined); })
                .catch(e => { e.response.status === 404 ? student_ExistingUsernameError[1](true) : undefined; });
        } else student_ExistingUsernameError[1](false);
    };

    const checkUsernameStringValidation = () => {
        if (student_ParentUsername.current.value !== '') {
            student_ParentUsername.current.value.split('').map(val => {
                const cc = val.charCodeAt();
                !((48 <= cc && cc <= 57) || (65 <= cc && cc <= 90) || (cc === 95) || (97 <= cc && cc <= 122)) ? student_InvalidUsernameError[1](true) : student_InvalidUsernameError[1](false);
            });
        } else student_InvalidUsernameError[1](false);
    };

    const handleSubmit = e => {
        e.preventDefault();

        context.student.parentUsername[1](student_ParentUsername.current.value);
        context.student.class[1](student_Class[0]);
        context.student.rollNo[1](student_RollNo.current.value);
        context.student.fee[1](student_Fee.current.value);

        handleStepperNext();
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit}>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <InputLabel htmlFor="__dashboard_admin__form_createuser_step3__student_parentusername" error={student_InvalidUsernameError[0] || student_ExistingUsernameError[0]}>Parent{`'`}s Username</InputLabel>
                <OutlinedInput
                    id="__dashboard_admin__form_createuser_step3__student_parentusername"
                    aria-describedby="__dashboard_admin__form_createuser_step3__student_parentusername_helper"
                    label="Parent's Username"
                    autoComplete="off"
                    inputRef={student_ParentUsername}
                    defaultValue={student_ParentUsername.current}
                    inputProps={{ pattern : '[A-Za-z0-9_]+', title : 'Username can only contain alphabets, digits and underscore (_). Eg., John_123.' }}
                    error={student_InvalidUsernameError[0] || student_ExistingUsernameError[0]}
                    onChange={() => { checkExistingParentUsernameValidation(); checkUsernameStringValidation(); }}
                />
                <FormHelperText id="__dashboard_admin__form_createuser_step3__student_parentusername_helper" error={student_InvalidUsernameError[0] || student_ExistingUsernameError[0]}>
                    {student_InvalidUsernameError[0] ? 'Username can only contain alphabets, digits and underscore (_). Eg., John_123.' : null}
                    {student_ExistingUsernameError[0] ? 'No Parent account exists with this username or existing account is not a parent account.' : null}
                </FormHelperText>
            </FormControl>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <Autocomplete
                    autoHighlight
                    options={classes[0] ? classes[0] : []}
                    getOptionLabel={option => `${option.grade}${option.section ? ` - ${option.section}` : ''}`}
                    filterOptions={createFilterOptions({ ignoreCase : true, stringify : option => `${option.grade}${option.section ? ` - ${option.section}` : ''}`, trim : true })}
                    isOptionEqualToValue={(option, value) => option.grade === value.grade && option.section === value.section}
                    value={student_Class[0]}
                    onChange={(e, newValue) => student_Class[1](newValue)}
                    renderOption={(props, option) => (
                        <Box {...props} component="div" key={option.id}>
                            <Typography variant="subtitle1" sx={{ marginLeft : '10px' }}>
                                {option.grade}{option.section ? ` - ${option.section}` : ''}
                            </Typography>
                        </Box>
                    )}
                    renderInput={params => (
                        <TextField
                            {...params}
                            required
                            label="Class"
                            inputProps={{
                                ...params.inputProps,
                                autoComplete: 'off',
                            }}
                        />
                    )}
                />
            </FormControl>
            <Container sx={{ display : 'flex', flexDirection : 'row', gap : '20px' }} disableGutters>
                <FormControl margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__dashboard_admin__form_createuser_step3__student_rollno">Roll No.</InputLabel>
                    <OutlinedInput
                        id="__dashboard_admin__form_createuser_step3__student_rollno"
                        type="number"
                        label="Roll No."
                        autoComplete="off"
                        inputRef={student_RollNo}
                    />
                </FormControl>
                <FormControl margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__dashboard_admin__form_createuser_step3__student_fee">Fee</InputLabel>
                    <OutlinedInput
                        id="__dashboard_admin__form_createuser_step3__student_fee"
                        type="number"
                        label="Fee"
                        autoComplete="off"
                        inputRef={student_Fee}
                    />
                </FormControl>
            </Container>
            <Container style={{ display : 'flex', flexDirection : 'row', justifyContent : 'space-between', marginTop : '40px' }}>
                <Button onClick={handleStepperBack}>Back</Button>
                <LoadingButton variant="contained" type="submit" disabled={student_InvalidUsernameError[0] || student_ExistingUsernameError[0]}>Submit</LoadingButton>
            </Container>
        </form>
    );
};

const TeacherAccount = ({ handleStepperBack, handleStepperNext }) => {
    const context = useContext(CreateUserContext);
    const classes = useState(context.temp.step3.classes[0]);
    const subjects = useState(context.temp.step3.subjects[0]);

    useEffect(() => {
        !classes[0] ? axios.get('api/class/all/').then(response => { classes[1](response.data.data); context.temp.step3.classes[1](response.data.data); }) : undefined;
        !subjects[0] ? axios.get('api/subject/all/').then(response => { subjects[1](response.data.data); context.temp.step3.subjects[1](response.data.data); }) : undefined;
    }, []); // eslint-disable-line

    const teacher_Subject = useState(context.teacher.subject[0]);
    const teacher_Classes = useState(context.teacher.classes[0]);
    const teacher_OwnsClass = useState(context.teacher.ownsClass[0]);
    const teacher_Salary = useRef(context.teacher.salary[0]);

    const handleSubmit = e => {
        e.preventDefault();

        context.teacher.subject[1](teacher_Subject[0]);
        context.teacher.classes[1](teacher_Classes[0]);
        context.teacher.ownsClass[1](teacher_OwnsClass[0]);
        context.teacher.salary[1](teacher_Salary.current.value);

        handleStepperNext();
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit}>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <Autocomplete
                    autoHighlight
                    options={subjects[0] ? subjects[0] : []}
                    getOptionLabel={option => `${option.name} (${option.code})`}
                    filterOptions={createFilterOptions({ ignoreCase : true, stringify : option => `${option.name} (${option.code})`, trim : true })}
                    isOptionEqualToValue={(option, value) => option.name === value.name && option.code === value.code}
                    value={teacher_Subject[0]}
                    onChange={(e, newValue) => teacher_Subject[1](newValue)}
                    renderOption={(props, option) => {
                        <Box {...props} component="div" key={option.id}>
                            <Typography variant="subtitle1" sx={{ marginLeft : '10px' }}>
                                {option.name} ({option.code})
                            </Typography>
                        </Box>;
                    }}
                    renderInput={params => (
                        <TextField
                            {...params}
                            required
                            label="Subject"
                            inputProps={{
                                ...params.inputProps,
                                autoComplete: 'off',
                            }}
                        />
                    )}
                />
            </FormControl>
            <FormControl margin="normal" sx={{ width : '100%' }}>
                <Autocomplete
                    autoHighlight
                    multiple
                    options={classes[0] ? classes[0] : []}
                    getOptionLabel={option => `${option.grade}${option.section ? ` ${option.section}` : ''}`}
                    filterOptions={createFilterOptions({ ignoreCase : true, stringify : option => `${option.grade}${option.section ? ` ${option.section}` : ''}`, trim : true })}
                    isOptionEqualToValue={(option, value) => option.grade === value.grade && option.section === value.section}
                    value={teacher_Classes[0]}
                    onChange={(e, newValue) => teacher_Classes[1](newValue)}
                    renderOption={(props, option) => {
                        <Box {...props} component="div" key={option.id}>
                            <Typography variant="subtitle1" sx={{ marginLeft : '10px' }}>
                                {option.grade}{option.section ? ` ${option.section}` : ''}
                            </Typography>
                        </Box>;
                    }}
                    renderInput={params => (
                        <TextField
                            {...params}
                            label="Classes"
                            inputProps={{
                                ...params.inputProps,
                                autoComplete: 'off',
                            }}
                        />
                    )}
                />
            </FormControl>
            <Container sx={{ display : 'flex', flexDirection : 'row', gap : '20px' }} disableGutters>
                <FormControl margin="normal" sx={{ width : '100%' }}>
                    <Autocomplete
                        autoHighlight
                        options={classes[0] ? classes[0] : []}
                        getOptionLabel={option => `${option.grade}${option.section ? ` ${option.section}` : ''}`}
                        filterOptions={createFilterOptions({ ignoreCase : true, stringify : option => `${option.grade}${option.section ? ` ${option.section}` : ''}`, trim : true })}
                        isOptionEqualToValue={(option, value) => option.grade === value.grade && option.section === value.section}
                        value={teacher_OwnsClass[0]}
                        onChange={(e, newValue) => teacher_OwnsClass[1](newValue)}
                        renderOption={(props, option) => {
                            <Box {...props} component="div" key={option.id}>
                                <Typography variant="subtitle1" sx={{ marginLeft : '10px' }}>
                                    {option.grade}{option.section ? ` ${option.section}` : ''}
                                </Typography>
                            </Box>;
                        }}
                        renderInput={params => (
                            <TextField
                                {...params}
                                label="Owns Class"
                                inputProps={{
                                    ...params.inputProps,
                                    autoComplete: 'off',
                                }}
                            />
                        )}
                    />
                </FormControl>
                <FormControl margin="normal" sx={{ width : '100%' }} required>
                    <InputLabel htmlFor="__dashboard_admin__form_createuser_step3__teacher_salary">Salary</InputLabel>
                    <OutlinedInput
                        id="__dashboard_admin__form_createuser_step3__teacher_salary"
                        type="number"
                        label="Salary"
                        autoComplete="off"
                        inputRef={teacher_Salary}
                    />
                </FormControl>
            </Container>
            <Container style={{ display : 'flex', flexDirection : 'row', justifyContent : 'space-between', marginTop : '40px' }}>
                <Button onClick={handleStepperBack}>Back</Button>
                <LoadingButton variant="contained" type="submit">Submit</LoadingButton>
            </Container>
        </form>
    );
};

const ParentAccount = ({ handleStepperNext }) => {
    useEffect(() => handleStepperNext(), []); // eslint-disable-line
    return null;
};

const ManagementAccount = ({ handleStepperBack, handleStepperNext }) => {
    const context = useContext(CreateUserContext);

    const management_Role = useRef(context.management.role[0]);
    const management_Salary = useRef(context.management.salary[0]);

    const handleSubmit = e => {
        e.preventDefault();

        context.management.role[1](management_Role.current.value);
        context.management.salary[1](management_Salary.current.value);

        handleStepperNext();
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <InputLabel htmlFor="__dashboard_admin__form_createuser_step3__management_role">Role</InputLabel>
                <OutlinedInput
                    id="__dashboard_admin__form_createuser_step3__management_role"
                    label="Role"
                    autoComplete="off"
                    inputRef={management_Role}
                />
            </FormControl>
            <FormControl margin="normal" sx={{ width : '100%' }} required>
                <InputLabel htmlFor="__dashboard_admin__form_createuser_step3__management_salary">Salary</InputLabel>
                <OutlinedInput
                    id="__dashboard_admin__form_createuser_step3__management_salary"
                    type="number"
                    label="Salary"
                    autoComplete="off"
                    inputRef={management_Salary}
                />
            </FormControl>
            <Container style={{ display : 'flex', flexDirection : 'row', justifyContent : 'space-between', marginTop : '40px' }}>
                <Button onClick={handleStepperBack}>Back</Button>
                <LoadingButton variant="contained" type="submit">Submit</LoadingButton>
            </Container>
        </form>
    );
};

const UserInfoStep = ({ handleStepperBack, handleStepperNext }) => {
    const context = useContext(CreateUserContext);

    return (
        <>
            {context.userType[0] === 's' ? <StudentAccount handleStepperBack={handleStepperBack} handleStepperNext={handleStepperNext} /> : null}
            {context.userType[0] === 't' ? <TeacherAccount handleStepperBack={handleStepperBack} handleStepperNext={handleStepperNext} /> : null}
            {context.userType[0] === 'p' ? <ParentAccount handleStepperNext={handleStepperNext} /> : null}
            {context.userType[0] === 'm' ? <ManagementAccount handleStepperBack={handleStepperBack} handleStepperNext={handleStepperNext} /> : null}
        </>
    );
};

const FinalStep = ({ handleStart }) => {
    const context = useContext(CreateUserContext);
    const displaySuccess = useState(false);
    const alertData = useState({ show : false, severity : '', title : '', message : '' });

    useEffect(() => { if (context.temp.success[0]) {
        displaySuccess[1](true); context.temp.openSnackbar[1](true); context.clearContext();
    } }, [ context.temp.success[0] ]); // eslint-disable-line

    useEffect(() => {
        if (!context.temp.success[0]) {
            let URL = null;
            let userData = {
                username      : context.username[0],
                email_id      : context.email[0],
                password      : context.password[0],
                first_name    : context.firstName[0],
                last_name     : context.lastName[0],
                user_type     : context.userType[0],
                date_of_birth : context.dateOfBirth[0],
                gender        : context.gender[0],
                contact_no    : context.contactNo[0],
                address       : context.address[0],
                avatar        : context.avatar[0],
            };
            switch (context.userType[0]) {
                case 's':
                    URL = 'student';
                    userData = {
                        ...userData,
                        parent         : context.student.parentUsername[0],
                        grade          : context.student.class[0]?.id,
                        roll_no        : context.student.rollNo[0],
                        year_of_enroll : new Date().getFullYear(),
                        fee            : context.student.fee[0],
                    };
                    break;
                case 't':
                    URL = 'teacher';
                    userData = {
                        ...userData,
                        subject         : context.teacher.subject[0]?.id,
                        year_of_joining : new Date().getFullYear(),
                        salary          : context.teacher.salary[0],
                        classes         : context.teacher.classes[0]?.map(val => val.id),
                        owns_class      : context.teacher.ownsClass[0]?.id,
                    };
                    break;
                case 'p':
                    URL = 'parent';
                    userData = {
                        ...userData,
                    };
                    break;
                case 'm':
                    URL = 'management';
                    userData = {
                        ...userData,
                        year_of_joining : new Date().getFullYear(),
                        role            : context.management.role[0],
                        salary          : context.management.salary[0],
                    };
                    break;
            }

            axios.post(`admin/user/${URL}/`, userData).then(response => {
                if (response.status === 201) {
                    context.temp.success[1](true);
                    alertData[1]({ show : true, severity : 'success', title : 'Success', message : 'Created User Successfully' });
                }
            }).catch(e => {
                if (e.response.status === 400) {
                    alertData[1]({ show : true, severity : 'error', title : 'Error - Failed to create user', message : e.response.data.error.error_message });
                }
            });
        }
    }, []); // eslint-disable-line

    return (
        <Container sx={{ display : 'flex', flexDirection : 'column', gap : '40px', alignItems : 'center' }} disableGutters>
            <Collapse in={alertData[0].show} sx={{ width : '100%' }}>
                <Alert severity={alertData[0].severity} sx={{ width : '100%' }}>
                    <AlertTitle>{alertData[0].title}</AlertTitle>
                    {alertData[0].message}
                </Alert>
            </Collapse>
            {!alertData[0].show ? <CircularProgress color="secondary" /> : null}
            {displaySuccess[0] ? <Button onClick={() => { handleStart(); if (context.temp.openSnackbar[0]) context.temp.openSnackbar[1](_blankData.temp.openSnackbar); }}>Create Another User</Button> : null}
        </Container>
    );
};

export default function CreateUser() {
    const [ activeStep, setActiveStep ] = useState(1);

    const handleStart = () => { setActiveStep(1); };
    const handleStepperBack = () => { setActiveStep(val => val - 1); };
    const handleStepperNext = () => { setActiveStep(val => val + 1); };

    return (
        <CreateUserProvider>
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
                    <Typography variant="h5">Create User</Typography>
                    <Container sx={{ marginTop : '30px', width : { xs : '100%', sm : '75%' } }} disableGutters>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {
                                steps.map((value, index) => {
                                    return (
                                        <Step key={index} index={index}>
                                            <StepLabel StepIconComponent={
                                                activeStep > index + 1 ?
                                                    () => { return <CheckCircleOutlined color="success" />; } :
                                                    (activeStep === index + 1 ? () => { return <value.icon color="info" />; } : value.icon )
                                            }>
                                                {value.label}
                                            </StepLabel>
                                        </Step>
                                    );
                                })
                            }
                        </Stepper>
                    </Container>
                    <Container sx={{ marginTop : '30px', maxWidth : { xs : '100%', sm : '95%', md : '70%', lg : '55%' } }}>
                        {activeStep === 1 ? <AccountInfoStep handleStepperNext={handleStepperNext} /> : null}
                        {activeStep === 2 ? <PersonalInfoStep handleStepperBack={handleStepperBack} handleStepperNext={handleStepperNext} /> : null}
                        {activeStep === 3 ? <UserInfoStep handleStepperBack={handleStepperBack} handleStepperNext={handleStepperNext} /> : null}
                        {activeStep === 4 ? <FinalStep handleStart={handleStart} /> : null}
                    </Container>
                    <CreateUserContext.Consumer>
                        {
                            value => (
                                <Snackbar open={value.temp.openSnackbar[0]} autoHideDuration={6000} onClose={() => { value.temp.openSnackbar[1](false); }}>
                                    <Alert severity="success" onClose={() => { value.temp.openSnackbar[1](false); }} sx={{ width : '100%' }}>Created User Successfully</Alert>
                                </Snackbar>
                            )
                        }
                    </CreateUserContext.Consumer>
                </Box>
            </Container>
        </CreateUserProvider>
    );
}
