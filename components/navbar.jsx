import { useContext, useState } from 'react';
import getConfig from 'next/config';
import { useRouter } from 'next/router';

import { Menu as MenuIcon, DoubleArrow as DoubleArrowIcon } from '@mui/icons-material';
import { useTheme, styled } from '@mui/material/styles';
import { AppBar, Avatar, Button, Collapse, IconButton, Menu, MenuList, Stack, Switch,  Toolbar, Typography } from '@mui/material';

import { ColorModeContext, AuthContext, SidebarContext } from '../utils/js/context';

const { publicRuntimeConfig } = getConfig();

const ThemeToggleSwitch = styled(Switch)(({ theme }) => ({
    width                     : 62,
    height                    : 34,
    padding                   : 7,
    '& .MuiSwitch-switchBase' : {
        margin          : 1,
        padding         : 0,
        transform       : 'translateX(6px)',
        '&.Mui-checked' : {
            color                       : '#fff',
            transform                   : 'translateX(22px)',
            '& .MuiSwitch-thumb:before' : {
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                    '#fff',
                )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
            },
            '& + .MuiSwitch-track': {
                opacity         : 1,
                backgroundColor : theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor : theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
        width           : 32,
        height          : 32,
        '&:before'      : {
            content            : "''",
            position           : 'absolute',
            width              : '100%',
            height             : '100%',
            left               : 0,
            top                : 0,
            backgroundRepeat   : 'no-repeat',
            backgroundPosition : 'center',
            backgroundImage    : `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                '#fff',
            )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
        },
    },
    '& .MuiSwitch-track': {
        opacity         : 1,
        backgroundColor : theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        borderRadius    : 20 / 2,
    },
}));


export default function Navbar() {
    const router = useRouter();
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);
    const authContext = useContext(AuthContext);
    const sidebarContext = useContext(SidebarContext);

    const [ anchorElUser, setAnchorElUser ] = useState(null);
    const handleOpenUserMenu = event => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    const [ navMenuOpened, setNavMenuOpened ] = useState(false);
    const handleNavMenu = () => setNavMenuOpened(!navMenuOpened);


    const NavButtons = () => {
        const closeNavMenu = () => { navMenuOpened ? handleNavMenu() : null; };

        return (
            <>
                {
                    authContext.loggedIn ? (
                        <>
                            {router.pathname !== '/' ? <Button onClick={() => { closeNavMenu(); router.push('/'); }}>Home</Button> : null}
                            {!router.pathname.startsWith('/dashboard') ? <Button onClick={() => { closeNavMenu(); router.push('/dashboard'); }}>Dashboard</Button> : null}
                            {router.pathname !== '/gallery' ? <Button onClick={() => { closeNavMenu(); router.push('/gallery'); }}>Gallery</Button> : null}
                            {router.pathname !== '/about' ? <Button onClick={() => { closeNavMenu(); router.push('/about'); }}>About</Button> : null}
                            {router.pathname !== '/contact' ? <Button onClick={() => { closeNavMenu(); router.push('/contact'); }}>Contact Us</Button> : null}
                        </>
                    ) : (
                        <>
                            {router.pathname !== '/' ? <Button onClick={() => { closeNavMenu(); router.push('/'); }}>Home</Button> : null}
                            {router.pathname !== '/gallery' ? <Button onClick={() => { closeNavMenu(); router.push('/gallery'); }}>Gallery</Button> : null}
                            {router.pathname !== '/about' ? <Button onClick={() => { closeNavMenu(); router.push('/about'); }}>About</Button> : null}
                            {router.pathname !== '/contact' ? <Button onClick={() => { closeNavMenu(); router.push('/contact'); }}>Contact Us</Button> : null}
                            {router.pathname !== '/login' ? <Button onClick={() => { closeNavMenu(); router.push('/login'); }}>Login</Button> : null}
                        </>
                    )
                }
            </>
        );
    };

    return (
        <AppBar position="sticky" sx={{ backgroundImage : 'initial' }}>
            <Toolbar sx={{ display : 'flex', flexDirection : 'column' }}>
                <Toolbar sx={{ flexDirection : 'row', width : '100%' }} disableGutters>
                    <IconButton onClick={handleNavMenu} sx={{ p : 0, display : { xs : 'flex', sm : 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ display : 'flex', flexGrow : 1, margin : '5px 10px' }}>
                        {publicRuntimeConfig.SCHOOL_NAME}
                    </Typography>
                    <Stack spacing={1.5} direction="row" sx={{ alignItems : 'center' }}>
                        <ThemeToggleSwitch onClick={colorMode.toggleColorMode} checked={theme.palette.mode === 'dark' ? true : false} />
                        <Stack spacing={1.5} direction="row" sx={{ display : { xs : 'none', sm : 'flex' } }}>
                            <NavButtons />
                        </Stack>
                        {
                            authContext.loggedIn ? (
                                <>
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p : 0 }}>
                                        {
                                            authContext.userData.avatar ? (
                                                <Avatar
                                                    alt={`${authContext.userData.first_name}${authContext.userData.last_name ? ` ${authContext.userData.last_name}` : ''}'s Avatar`}
                                                    src={authContext.userData.avatar}
                                                />
                                            ) : (
                                                <Avatar alt={`${authContext.userData.first_name}${authContext.userData.last_name ? ` ${authContext.userData.last_name}` : ''}'s Avatar`}>
                                                    {`${authContext.userData.first_name.charAt(0)}${authContext.userData.last_name ? `${authContext.userData.last_name.charAt(0)}` : ''}`}
                                                </Avatar>
                                            )
                                        }
                                    </IconButton>
                                    <Menu
                                        sx={{ mt : '45px' }}
                                        anchorOrigin={{ vertical : 'top', horizontal : 'right' }}
                                        transformOrigin={{ vertical : 'top', horizontal : 'right' }}
                                        anchorEl={anchorElUser}
                                        open={Boolean(anchorElUser)}
                                        onClose={handleCloseUserMenu}
                                    >
                                        <MenuList sx={{ 'padding' : '0 10px' }}>
                                            <Stack spacing={1} direction="column">
                                                <Typography variant="subtitle1" component="p">Hi, {authContext.userData.username}</Typography>
                                                <Button onClick={() => { handleCloseUserMenu(); router.push('/@me/profile'); }}>
                                                Profile
                                                </Button>
                                                <Button onClick={() => { handleCloseUserMenu(); router.push('/logout'); }}>
                                                Logout
                                                </Button>
                                            </Stack>
                                        </MenuList>
                                    </Menu>
                                </>
                            ) : null
                        }
                    </Stack>
                </Toolbar>
                <Toolbar sx={{ display : { xs : 'flex', sm : 'none' }, minHeight : 0, width : '100%', justifyContent : 'center' }} disableGutters>
                    <Collapse in={Boolean(navMenuOpened)}>
                        <Stack direction="row" sx={{ padding : '15px', flexWrap : 'wrap', justifyContent : 'center', gap : '10px' }}>
                            <NavButtons />
                        </Stack>
                    </Collapse>
                </Toolbar>
            </Toolbar>
            {
                router.pathname.startsWith('/dashboard/') ? (
                    <Toolbar sx={{ display : { xs : 'flex', sm : 'none' } }}>
                        <IconButton onClick={() => { sidebarContext.setOpen(true); }} sx={{ p : 0, display : { xs : 'flex', sm : 'none' } }}>
                            <DoubleArrowIcon />
                        </IconButton>
                        <Typography component="div" sx={{ display : 'flex', margin : '5px 10px' }}>
                    Menu
                        </Typography>
                    </Toolbar>
                ) : null
            }
        </AppBar>
    );
}
