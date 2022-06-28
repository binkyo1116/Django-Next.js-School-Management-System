import { createContext, useEffect, useState } from 'react';
import axios from '../axios';
import { Backdrop, CircularProgress } from '@mui/material';

const _blankData = {
    loggedIn : false,
    userData : {
        'id'            : 0,
        'username'      : '',
        'first_name'    : '',
        'last_name'     : null,
        'email_id'      : '',
        'avatar'        : null,
        'user_type'     : '',
        'access_token'  : '',
        'refresh_token' : '',
    },
    isLoading         : false,
    documentLoaded    : false,
    setLoggedIn       : () => {},
    setUserData       : () => {},
    setLoading        : () => {},
    setDocumentLoaded : () => {},
    checkIfLoggedIn   : () => {},
    loginUser         : () => {},
    logoutUser        : () => {},
};

const AuthContext = createContext(_blankData);

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [ loggedIn, setLoggedIn ] = useState(_blankData.loggedIn);
    const [ userData, setUserData ] = useState(_blankData.userData);
    const [ loading, setLoading ] = useState(false);
    const [ documentLoaded, setDocumentLoaded ] = useState(false);

    const checkIfLoggedIn = () => {
        setLoading(true);

        axios.get('auth/authenticate/').then(response => {
            if (response.status === 200) {
                setLoggedIn(true);
                setUserData(response.data.data);
            }
            setLoading(false);
            setDocumentLoaded(true);
            return response.status;
        }).catch(e => {
            setLoggedIn(_blankData.loggedIn);
            setUserData(_blankData.userData);
            setLoading(false);
            setDocumentLoaded(true);
            return e.response ? e.response.status : null;
        });
    };

    useEffect(() => {
        checkIfLoggedIn();
    }, []);

    const loginUser = params => {
        setLoading(true);

        axios.post('auth/authenticate/', params).then(response => {
            if (response.status === 200) {
                setLoggedIn(true);
                setUserData(response.data.data);
            }
            setLoading(false);
            return response.status;
        }).catch(e => {
            setLoggedIn(_blankData.loggedIn);
            setUserData(_blankData.userData);
            setLoading(false);
            return e.response ? e.response.status : null;
        });
    };

    const logoutUser = () => {
        setLoading(true);

        axios.post('auth/unauthenticate/').then(response => {
            if (response.status === 205) {
                setLoggedIn(_blankData.loggedIn);
                setUserData(_blankData.userData);
                setLoading(false);
            }
            return response.status;
        }).catch(e => {
            setLoading(false);
            return e.response ? e.response.status : null;
        });
    };

    const contextData = {
        loggedIn          : loggedIn,
        userData          : userData,
        isLoading         : loading,
        documentLoaded    : documentLoaded,
        setLoggedIn       : setLoggedIn,
        setUserData       : setUserData,
        setLoading        : setLoading,
        setDocumentLoaded : setDocumentLoaded,
        checkIfLoggedIn   : checkIfLoggedIn,
        loginUser         : loginUser,
        logoutUser        : logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {
                contextData.isLoading ? (
                    <Backdrop open sx={{ color : '#fff' }}>
                        <CircularProgress disableShrink variant="indeterminate" color="inherit" thickness={5.0} />
                    </Backdrop>
                ) : children
            }
        </AuthContext.Provider>
    );
};
