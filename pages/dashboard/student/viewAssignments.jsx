import { useEffect, useState } from 'react';

import moment from 'moment';

import { Box, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';

import axios from '../../../utils/js/axios';

export default function ViewAssignments() {
    const [ studentData, setStudentData ] = useState(null);
    const [ assignments, setAssignments ] = useState([]);

    const [ rowsPerPage, setRowsPerPage ] = useState(5);
    const [ currentPage, setCurrentPage ] = useState(0);

    useEffect(() => {
        if (!studentData) {
            axios.get('api/user/@me/', { params : { 'with-type' : 'true' } })
                .then(response => { if (response.status === 200) setStudentData(response.data.data); });
        }
    }, []); // eslint-disable-line

    useEffect(() => {
        if (studentData) {
            axios.get('api/class/assignments/', { params : { id : studentData.grade.id, 'newest-first' : 'true' } })
                .then(response => setAssignments(response.data.data));
        }
    }, [ studentData ]);

    return (
        <Container sx={{ display : 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center', padding : '8vh 0' }}>
            <Box sx={{
                display         : 'flex',
                flexDirection   : 'column',
                alignItems      : 'center',
                justifyContent  : 'center',
                flexWrap        : 'wrap',
                width           : { xs : '100%', sm : '90%' },
                borderRadius    : '7.5px',
                padding         : '50px 10px',
                backgroundColor : 'background.paper'
            }}>
                <Typography variant="h5">Assignments</Typography>
                <Container sx={{ marginTop : '30px', maxWidth : { xs : '100%', sm : '98%', md : '95%', lg : '85%' } }}>
                    <Paper elevation={3} sx={{ width : '100%', overflow : 'hidden' }}>
                        <TableContainer sx={{ maxHeight : 500 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">ID</TableCell>
                                        <TableCell align="center">Title</TableCell>
                                        <TableCell align="center">Assigned By</TableCell>
                                        <TableCell align="center">Assigned On</TableCell>
                                        <TableCell align="center">Submission Date</TableCell>
                                        <TableCell align="center">Message</TableCell>
                                        <TableCell align="center">File</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        assignments.slice(currentPage * rowsPerPage, (currentPage * rowsPerPage) + rowsPerPage).map((value, index) => (
                                            <TableRow key={index}>
                                                <TableCell align="center">{value.id}</TableCell>
                                                <TableCell align="center">{value.title}</TableCell>
                                                <TableCell align="center">
                                                    {
                                                        value.assigned_by.teacher.first_name +
                                                        (value.assigned_by.teacher.last_name ? ` ${value.assigned_by.teacher.last_name}` : '') +
                                                        ` (${value.assigned_by.teacher.username})`
                                                    }
                                                </TableCell>
                                                <TableCell align="center">{moment(value.assigned_at).format('D MMM, YYYY')}</TableCell>
                                                <TableCell align="center">{value.submission_date ? moment(value.submission_date).format('D MMM, YYYY') : '-'}</TableCell>
                                                <TableCell align="center">{value.message ? value.message : '-'}</TableCell>
                                                <TableCell align="center"><a href={value.file}>Download</a></TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                            <TablePagination
                                component="div"
                                rowsPerPageOptions={[ 5, 10, 25, 100 ]}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={event => { setRowsPerPage(event.target.value); setCurrentPage(0); }}
                                count={assignments.length}
                                page={currentPage}
                                onPageChange={(e, newPage) => setCurrentPage(newPage)}
                            />
                        </TableContainer>
                    </Paper>
                </Container>
            </Box>
        </Container>
    );
}
