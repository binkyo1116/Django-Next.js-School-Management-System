/*
* Add the images in the public/images/gallery directory and all the images with valid/supported
* extensions (jpg/jpeg/png/gif) will be imported automatically and displayed into the ImageList.
*/

import Head from 'next/head';
import getConfig from 'next/config';

import { Box, Container, ImageList, ImageListItem, ImageListItemBar, Typography } from '@mui/material';

import galleryMetadata from '../public/images/gallery/_metadata.json';

const { publicRuntimeConfig } = getConfig();

const GALLERY_PATH = '/images/gallery';
let IMAGES = [];
galleryMetadata.map(value => {
    IMAGES.push({ label : value.label, href : `${GALLERY_PATH}/${value.href}` });
});

export default function Gallery() {
    return (
        <>
            <Head>
                <title>Gallery | {publicRuntimeConfig.SCHOOL_NAME}</title>
            </Head>
            <Container sx={{ display : 'flex', flexDirection : 'columm', justifyContent : 'center', alignItems : 'center', padding : '8vh 0' }}>
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
                    <Typography variant="h5">Gallery</Typography>
                    <Container sx={{ marginTop : '30px', maxWidth : { xs : '100%', sm : '95%', md : '90%', lg : '85%' } }}>
                        <ImageList variant="woven" cols={2} gap={8}>
                            {
                                IMAGES.map((item, index) => (
                                    <ImageListItem key={index} sx={{ position : 'relative' }}>
                                        {/* eslint-disable @next/next/no-img-element */}
                                        <img
                                            src={item.href}
                                            alt={item.label}
                                            layout="fill"
                                        />
                                        {/* eslint-enable */}
                                        <ImageListItemBar
                                            title={item.label}
                                        />
                                    </ImageListItem>
                                ))
                            }
                        </ImageList>
                    </Container>
                </Box>
            </Container>
        </>
    );
}
