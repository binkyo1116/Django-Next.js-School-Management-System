import { useEffect, useContext } from 'react';

import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import { AuthContext } from '../../utils/js/context';

const { publicRuntimeConfig } = getConfig();

export default function Dashboard() {
    const router = useRouter();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if (authContext.documentLoaded) {
            authContext.setLoading(true);
            if (!authContext.loggedIn) {
                router.replace('/login');
            } else {
                switch (authContext.userData.user_type) {
                    case 's':
                        router.replace('/dashboard/student');
                        break;
                    case 't':
                        router.replace('/dashboard/teacher');
                        break;
                    case 'p':
                        router.replace('/dashboard/parent');
                        break;
                    case 'm':
                        router.replace('/dashboard/management');
                        break;
                    case 'a':
                        router.replace('/dashboard/admin');
                        break;
                }
            }
            authContext.setLoading(false);
        }
    }, [ authContext.documentLoaded ]); // eslint-disable-line

    return (
        <Head>
            <title>Dashboard | {publicRuntimeConfig.SCHOOL_NAME}</title>
        </Head>
    );
}
