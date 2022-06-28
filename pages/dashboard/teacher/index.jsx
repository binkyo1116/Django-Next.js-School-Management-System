import { useEffect, useState, useContext } from 'react';

import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import { Backdrop, CircularProgress, Container, NoSsr } from '@mui/material';
import { DashboardOutlined as DashboardIcon, FolderOpenOutlined as FolderOpenIcon } from '@mui/icons-material';

import { Sidebar } from '../../../components';
import { AuthContext } from '../../../utils/js/context';

import CreateAssignment from './createAssignment';

const { publicRuntimeConfig } = getConfig();

export default function Teacher() {
    const router = useRouter();
    const authContext = useContext(AuthContext);

    const [ rendering, setRendering ] = useState(true);

    const [ currentComponent, setCurrentComponent ] = useState(null);

    const shallowRedirectToPage = to => {
        return router.push({ pathname : router.pathname, query : { page : to } }, undefined, { shallow : true });
    };

    const pages = {
        items: [
            {
                type  : 'list',
                id    : 'sidebar-assignments-manage',
                text  : 'Assignments',
                icon  : <FolderOpenIcon />,
                items : [
                    { type : 'listitem', id : 'create-assignment', text : 'Create Assignment', pageComponent : <CreateAssignment /> },
                ],
            },
        ],
        defaultItem: { id : 'dashboard', text : 'Dashboard', icon : <DashboardIcon /> },
    };

    useEffect(() => {
        if (authContext.documentLoaded) {
            if (rendering) {
                if (!authContext.loggedIn) {
                    router.replace('/login');
                } else if (authContext.userData.user_type !== 't') {
                    router.replace('/dashboard');
                } else {
                    setRendering(false);
                }
            }
        }
    }, [ authContext.documentLoaded ]); // eslint-disable-line

    useEffect(() => {
        if (!router.query.page) { // No page query exists
            shallowRedirectToPage(pages.defaultItem.id);
            setCurrentComponent(pages.defaultItem.pageComponent);
        } else {
            if (router.query.page === pages.defaultItem.id) { // Page query exists and is equal to default page
                setCurrentComponent(pages.defaultItem.pageComponent);
                return;
            } else { // Page query exists but is not equal to default page
                for (let i = 0; i < pages.items.length; i++) {
                    if (pages.items[i].type === 'list') { // Found sublist while iterating
                        for (let j = 0; j < pages.items[i].items.length; j++) {
                            if (pages.items[i].items[j].type === 'listitem') { // Found item inside sublist
                                if (router.query.page === pages.items[i].items[j].id) { // Page query matches to an item in sublist
                                    setCurrentComponent(pages.items[i].items[j].pageComponent);
                                    return;
                                }
                            }
                        }
                    } else if (pages.items[i].type === 'listitem') { // Found item while iterating
                        if (router.query.page === pages.items[i].id) { // Page query matches to the item
                            setCurrentComponent(pages.items[i].pageComponent);
                            return;
                        }
                    }
                }
            }
        }
    }, [ router.query.page ]); // eslint-disable-line

    return (
        <>
            <Head>
                <title>Teacher Dashboard | {publicRuntimeConfig.SCHOOL_NAME}</title>
            </Head>
            <Container style={{ display : 'flex', flexDirection : 'row', flexGrow : 1, width : '100vw', maxWidth : '100%' }} disableGutters>
                <NoSsr fallback={(
                    <Backdrop open sx={{ color : '#fff' }}>
                        <CircularProgress disableShrink variant="indeterminate" color="inherit" thickness={5.0} />
                    </Backdrop>
                )}>
                    { !rendering ? <Sidebar pages={pages} /> : null }
                    { !rendering ? currentComponent : null }
                </NoSsr>
            </Container>
        </>
    );
}
