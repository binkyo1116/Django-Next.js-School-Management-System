import Head from 'next/head';
import getConfig from 'next/config';

import { Container } from '@mui/material';

import { ImageSlider } from '../components';

import galleryMetadata from '../public/images/gallery/_metadata.json';

const { publicRuntimeConfig } = getConfig();

const GALLERY_PATH = '/images/gallery';
let IMAGES = [];
galleryMetadata.map(value => {
    IMAGES.push({ label : value.label, href : `${GALLERY_PATH}/${value.href}` });
});

export default function Home() {
    return (
        <>
            <Head>
                <title>Home | {publicRuntimeConfig.SCHOOL_NAME}</title>
            </Head>
            <Container sx={{ display : 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center', padding : '8vh 0' }}>
                <ImageSlider title="Gallery" images={IMAGES} />
                <p>This is the home page</p>
            </Container>
        </>
    );
}
