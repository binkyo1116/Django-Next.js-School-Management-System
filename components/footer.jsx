import { useEffect, useState } from 'react';
import Link from 'next/link';
import getConfig from 'next/config';

import { AppBar, Container, Stack, Toolbar, Typography } from '@mui/material';

const { publicRuntimeConfig } = getConfig();

export default function Footer() {
    const [ host, setHost ] = useState('');

    useEffect(() => {
        if (!host) {
            setHost(window.location.host);
        }
    }, []); // eslint-disable-line

    return (
        <AppBar component="footer" position="relative" sx={{ backgroundImage : 'initial', marginTop : 'auto', zIndex : 1050, boxShadow : '0px -2px 4px 2px rgb(0 0 0 / 20%);' }}>
            <Toolbar>
                <Container sx={{ display : 'flex', flexDirection : 'column', alignItems : 'center', padding : '20px' }}>
                    <Container sx={{ display : 'flex', flexDirection : { xs : 'column', sm : 'row' }, paddingBottom : '10px' }}>
                        <Container sx={{ display : 'flex', flexDirection : 'column' }}>
                            <Stack spacing={1.5} direction="column" sx={{ alignItems : 'center' }}>
                                <Typography variant="h6">About Us</Typography>
                                <Typography variant="body1" sx={{ textAlign : 'center' }}>
                                    {publicRuntimeConfig.FOOTER_TEXT}
                                </Typography>
                            </Stack>
                        </Container>
                        <Container sx={{ display : 'flex', flexDirection : 'column', margin : { xs : '30px 0', sm : 0 }, alignItems : 'center' }}>
                            <Stack spacing={1.5} direction="column" sx={{ alignItems : { xs : 'center', sm : 'initial' } }}>
                                <Typography variant="h6">Our Links</Typography>
                                <Stack spacing={0.5} direction={{ xs : 'row', sm : 'column' }} sx={{ gap : { xs : '10px', sm : 0 }, justifyContent : 'center', flexWrap : 'wrap', whiteSpace : 'nowrap' }}>
                                    <Link href="/"><a>Home</a></Link>
                                    <Link href="/about"><a>About</a></Link>
                                    <Link href="/contact"><a>Contact Us</a></Link>
                                    <Link href="/terms-of-use"><a>Terms of Use</a></Link>
                                    <Link href="/privacy-policy"><a>Privacy Policy</a></Link>
                                </Stack>
                            </Stack>
                        </Container>
                    </Container>
                    <Typography variant="body1">
                    &copy; {new Date().getFullYear()}{' '}
                        <Link href="/"><a>{host}</a></Link>
                    </Typography>
                </Container>
            </Toolbar>
        </AppBar>
    );
}
