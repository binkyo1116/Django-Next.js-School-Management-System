import { useEffect, useState, useContext } from 'react';

import Head from 'next/head';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import { Backdrop, CircularProgress, Container, NoSsr } from '@mui/material';
import { DashboardOutlined as DashboardIcon, LibraryBooksOutlined as LibraryBooksIcon, PersonOutlined as PersonIcon, SchoolOutlined as SchoolIcon } from '@mui/icons-material';

import { Sidebar } from '../../../components';
import { AuthContext } from '../../../utils/js/context';

import CreateUser from './createUser';
import SearchUser from './searchUser';
import CreateClass from './createClass';
import CreateSubject from './createSubject';

const { publicRuntimeConfig } = getConfig();

export default function Admin() {
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
                id    : 'sidebar-user-manage',
                text  : 'User',
                icon  : <PersonIcon />,
                items : [
                    { type : 'listitem', id : 'search-user', text : 'Search User', pageComponent : <SearchUser /> },
                    { type : 'listitem', id : 'create-user', text : 'Create User', pageComponent : <CreateUser /> },
                ],
            },
            {
                type  : 'list',
                id    : 'sidebar-class-manage',
                text  : 'Class',
                icon  : <SchoolIcon />,
                items : [
                    { type : 'listitem', id : 'create-class', text : 'Create Class', pageComponent : <CreateClass /> },
                ],
            },
            {
                type  : 'list',
                id    : 'sidebar-subject-manage',
                text  : 'Subject',
                icon  : <LibraryBooksIcon />,
                items : [
                    { type : 'listitem', id : 'create-subject', text : 'Create Subject', pageComponent : <CreateSubject /> },
                ],
            },
        ],
        defaultItem: { id : 'dashboard', text : 'Dashboard', icon : <DashboardIcon /> },
    };

    

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

    useEffect(() => {
        if (authContext.documentLoaded) {
            if (rendering) {
                if (!authContext.loggedIn) {
                    router.replace('/login');
                } else if (authContext.userData.user_type !== 'a') {
                    router.replace('/dashboard');
                } else {
                    setRendering(false);
                }
            }
        }
    }, [ authContext.documentLoaded ]); // eslint-disable-line

    return (
        <>
            <Head>
                <title>Admin Dashboard | {publicRuntimeConfig.SCHOOL_NAME}</title>
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
