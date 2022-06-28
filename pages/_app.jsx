import '../styles/globals.scss';

import { useState, useMemo, useEffect } from 'react';

import App from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { Backdrop, CircularProgress, CssBaseline, LinearProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { Navbar, Footer } from '../components';
import { lightTheme, darkTheme } from '../utils/js/theme';
import { AuthProvider, ColorModeContext, SidebarProvider } from '../utils/js/context';
import { getCookie as clientCookieGetter, setCookie as clientCookieSetter } from '../utils/js/utils';

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    const [ loading, setLoading ] = useState(false);
    const [ mode, setMode ] = useState(typeof pageProps.__darkModeEnabled === 'undefined' ? null : (pageProps.__darkModeEnabled ? 'dark' : 'light'));

    useEffect(() => {
        router.events.on('routeChangeStart', () => setLoading(true));
        router.events.on('routeChangeComplete', () => setLoading(false));
        router.events.on('routeChangeError', () => setLoading(false));
    }, []); // eslint-disable-line

    const colorMode = useMemo(() => ({ toggleColorMode : () => { setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light')); } }), []);
    const _theme = useMemo(() => { return mode === 'dark' ? darkTheme : lightTheme; }, [ mode ]);

    useEffect(() => {
        if (typeof pageProps.__darkModeEnabled === 'undefined') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                pageProps.__darkModeEnabled = true;
                setMode('dark');
            } else {
                pageProps.__darkModeEnabled = false;
                setMode('light');
            }
            router.reload();
        }
    }, []); // eslint-disable-line

    useEffect(() => {
        if (mode) {
            clientCookieSetter('__darkMode', (mode === 'dark' ? 't' : 'f'), { path : '/', expires : new Date(Date.now() + (365*24*60*60*1000)), samesite : 'lax' });
        }
    }, [ mode ]); // eslint-disable-line

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="author" content="Akshu Agarwal" />
                <meta name="description" content="A Web Application for a School Management System" />
                <meta name="keywords" content="School Managemenet System, Django, React, Next, JS, Python" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta name="theme-color" media="(prefers-color-scheme: light)" content="white" />
                <meta name="theme-color" media="(prefers-color-scheme: dark)" content="black" />
                <meta name="color-scheme" content="dark light" />
            </Head>
            {
                pageProps.__darkModeEnabled === undefined ? (
                    <Backdrop open sx={{ color : '#fff' }}>
                        <CircularProgress disableShrink variant="indeterminate" color="inherit" thickness={5.0} />
                    </Backdrop>
                ) : (
                    <ColorModeContext.Provider value={colorMode}>
                        <ThemeProvider theme={_theme}>
                            <AuthProvider>
                                <SidebarProvider>
                                    <CssBaseline />
                                    <div style={{ display : 'flex', flexDirection : 'column', minHeight : '100vh', justifyContent : 'space-between' }}>
                                        {loading ? <LinearProgress color="secondary" /> : null}
                                        <Navbar />
                                        <Component {...pageProps} />
                                        <Footer />
                                    </div>
                                </SidebarProvider>
                            </AuthProvider>
                        </ThemeProvider>
                    </ColorModeContext.Provider>
                )
            }
        </>
    );
}

MyApp.getInitialProps = async appContext => {
    const initialProps = await App.getInitialProps(appContext);
    let cookie = null;

    if (appContext.ctx.req) {
        const Cookies = require('cookies');
        const cookies = new Cookies(appContext.ctx.req, appContext.ctx.res);
        cookie = cookies.get('__darkMode');
    } else {
        cookie = clientCookieGetter('__darkMode');
    }

    if (cookie === 't') {
        return { pageProps : { __darkModeEnabled : true, ...initialProps.pageProps } };
    } else if (cookie === 'f') {
        return { pageProps : { __darkModeEnabled : false, ...initialProps.pageProps } };
    } else {
        if (typeof window !== 'undefined') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                clientCookieSetter('__darkMode', 't', { path : '/', expires : new Date(Date.now() + (365*24*60*60*1000)), samesite : 'strict' });
                return { pageProps : { __darkModeEnabled : true, ...initialProps.pageProps } };
            } else {
                clientCookieSetter('__darkMode', 'f', { path : '/', expires : new Date(Date.now() + (365*24*60*60*1000)), samesite : 'strict' });
                return { pageProps : { __darkModeEnabled : false, ...initialProps.pageProps } };
            }
        } else {
            return { pageProps : { __darkModeEnabled : undefined, ...initialProps.pageProps } };
        }
    }
};

export default MyApp;
