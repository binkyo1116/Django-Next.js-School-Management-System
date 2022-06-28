import { useEffect, useContext } from 'react';

import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import { AuthContext } from '../utils/js/context';

const { publicRuntimeConfig } = getConfig();

export default function Logout() {
    const router = useRouter();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if (authContext.documentLoaded) {
            if (authContext.loggedIn) {
                authContext.logoutUser();
            }
            router.push('/');
        }
    }, [ authContext.documentLoaded ]); // eslint-disable-line

    return (
        <Head>
            <title>Logout | {publicRuntimeConfig.SCHOOL_NAME}</title>
        </Head>
    );
}
