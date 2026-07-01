import {
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";

import dayjs from "dayjs";

import { useMachine } from "../../Context/MachineContext";
import { formatPipeLength } from "../../helpers/helpers";

function ReportTable() {

    const { history } = useMachine();

    return (

        <TableContainer
            component={Paper}
            sx={{
                mt: 3,
                maxHeight: 500,
                borderRadius: 3
            }}
        >

            <Table stickyHeader>

                <TableHead>

                    <TableRow>

                        <TableCell>
                            <strong>Date & Time</strong>
                        </TableCell>

                        <TableCell align="center">
                            <strong>Motor Status</strong>
                        </TableCell>

                        <TableCell align="center">
                            <strong>Motor RPM</strong>
                        </TableCell>

                        <TableCell align="center">
                            <strong>Pipe Length (m/min)</strong>
                        </TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {history.map((row) => (
                       
                        <TableRow
                            hover
                            key={row.timestamp}
                        >
 {console.log("row",row)}
                            <TableCell>

                                {dayjs(row.timestamp).format(
                                    "DD MMM YYYY hh:mm:ss A"
                                )}

                            </TableCell>

                            <TableCell align="center">

                                <Chip

                                    size="small"

                                    label={row.motorStatus}

                                    color={
                                        row.motorStatus === "ON"
                                            ? "success"
                                            : "error"
                                    }

                                />

                            </TableCell>

                            <TableCell align="center">

                                <strong>

                                    {row.motorRPM} RPM

                                </strong>

                            </TableCell>

                            <TableCell align="center">

                                <strong>

                                    {formatPipeLength(row.pipeLength)}

                                </strong>

                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

        </TableContainer>

    );

}

export default ReportTable;