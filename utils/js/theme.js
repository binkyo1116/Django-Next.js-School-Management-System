import { createTheme } from '@mui/material/styles';

const lightThemeOptions = {
    palette: {
        mode    : 'light',
        type    : 'light',
        primary : {
            main         : '#384692',
            contrastText : '#ffffff',
        },
        secondary: {
            main: '#e0e4e2',
        },
        success: {
            main: '#4caf50',
        },
        background: {
            default : '#efe2e2',
            paper   : '#384692',
        },
        text: {
            primary   : '#ffffff',
            secondary : '#ffffff',
        },
    },
    components: {
        MuiFormControl: {
            defaultProps: {
                color   : 'text',
                variant : 'outlined',
            },
        },
        MuiSvgIcon: {
            defaultProps: {
                htmlColor: '#ffffff',
            },
        },
        MuiButton: {
            defaultProps: {
                color   : 'secondary',
                variant : 'contained',
            },
        },
        MuiAlert: {
            defaultProps: {
                variant: 'filled',
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                notchedOutline: {
                    borderColor: '#ffffff',
                },
            },
        },
    },
};

const darkThemeOptions = {
    palette: {
        mode    : 'dark',
        type    : 'dark',
        primary : {
            main: '#0a0a0a',
        },
        secondary: {
            main  : '#fb1f22',
            light : '#f5494a',
        },
        background: {
            default : '#2a2a2a',
            paper   : '#0a0a0a',
        },
        error: {
            main: '#e2170b',
        },
    },
    components: {
        MuiFormControl: {
            defaultProps: {
                color   : 'text',
                variant : 'outlined',
            },
        },
        MuiSvgIcon: {
            defaultProps: {
                htmlColor: '#ffffff',
            },
        },
        MuiButton: {
            defaultProps: {
                color   : 'secondary',
                variant : 'contained',
            },
        },
        MuiAlert: {
            defaultProps: {
                variant: 'filled',
            },
        },
    },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
