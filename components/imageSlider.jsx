import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Button, Container, ImageListItem, ImageListItemBar, MobileStepper, Typography } from '@mui/material';
import { KeyboardArrowLeft as KeyboardArrowLeftIcon, KeyboardArrowRight as KeyboardArrowRightIcon } from '@mui/icons-material';

import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export default function ImageSlider({ title, images }) {
    /*
        images = [
            {
                label: 'A',
                href: '/foo/A.xyz'
            },
            {
                label: 'B',
                href: '/bar/B.xyz'
            }
        ]
    */

    const theme = useTheme();

    const [ activeStep, setActiveStep ] = useState(0);
    const maxSteps = images.length;

    return (
        <Box sx={{
            display         : 'flex',
            flexDirection   : 'column',
            alignItems      : 'center',
            justifyContent  : 'center',
            flexWrap        : 'wrap',
            width           : '100%',
            borderRadius    : '7.5px',
            padding         : '50px 30px 0 30px',
            backgroundColor : 'background.paper'
        }}>
            <Typography variant="h5">{title}</Typography>
            <Container sx={{ marginTop : '20px', display : 'flex', flexDirection : 'column', alignItems : 'center', justifyContent : 'center' }}>
                <AutoPlaySwipeableViews
                    axis={'x'}
                    index={activeStep}
                    onChangeIndex={step => setActiveStep(step)}
                    enableMouseEvents
                >
                    {images.map((step, index) => (
                        <div key={step.label} style={{ display : 'flex', alignItems : 'center', justifyContent : 'center' }}>
                            {Math.abs(activeStep - index) <= 2 ? (
                                <ImageListItem key={index} sx={{ position : 'relative' }}>
                                    <Box
                                        component="img"
                                        sx={{
                                            maxHeight : 500,
                                            display   : 'block',
                                            overflow  : 'hidden',
                                            width     : '100%',
                                        }}
                                        src={step.href}
                                        alt={step.label}
                                    />
                                    <ImageListItemBar
                                        title={step.label}
                                    />
                                </ImageListItem>
                            ) : null}
                        </div>
                    ))}
                </AutoPlaySwipeableViews>
                <MobileStepper
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    sx={{ width : '100%', maxWidth : 600, flexGrow : 1, margin : '20px', borderRadius : '7.5px', }}
                    backButton={
                        <Button size="small" onClick={() => { setActiveStep(prevActiveStep => prevActiveStep - 1); }} disabled={activeStep === 0}>
                            <KeyboardArrowLeftIcon sx={{ color : theme.palette.mode === 'dark' ? '#fff' : '#000' }} />
                            Back
                        </Button>
                    }
                    nextButton={
                        <Button
                            size="small"
                            onClick={() => { setActiveStep(prevActiveStep => prevActiveStep + 1); }}
                            disabled={activeStep === maxSteps - 1}
                        >
                            Next
                            <KeyboardArrowRightIcon sx={{ color : theme.palette.mode === 'dark' ? '#fff' : '#000' }} />
                        </Button>
                    }
                />
            </Container>
        </Box>
    );
}
