import {

    AppBar,

    Toolbar,

    Typography,

    Box,

    Chip,
    Button

} from "@mui/material";

import dayjs from "dayjs";
import { useMachine } from "../../../Context/MachineContext";
import { useState } from "react";
import MachineReportDialog from "../../report/MachineReportDialog";
import pdfReportService from "../../report/pdfReport.service";



function Header() {

    const { connected } = useMachine();
     const [openReport, setOpenReport] = useState(false);

      const {
        machineData,
        history,
        runtime
    } = useMachine();

    return (

        <AppBar

            position="static"

            elevation={0}

            sx={{

                background: "#111827",

                borderBottom: "1px solid #334155"

            }}

        >

            <Toolbar>

                <Box>

                    <Typography variant="h6">

                        Widhin Imap

                    </Typography>

                    <Typography

                        variant="caption"

                    >

                        Industrial Monitoring Platform

                    </Typography>

                </Box>
            

                <Box sx={{ flexGrow: 1 , marginInline:"12px"}} />
    <Button
    variant="contained"
    onClick={() => setOpenReport(true)}
    sx={{  marginInline:"12px"}}
>
    View operational history
</Button>
<Button
 sx={{  marginInline:"12px"}}
    variant="contained"

    color="error"

    onClick={() =>

        pdfReportService.download(

            machineData,

            history,

            runtime

        )

    }

>

    Download PDF Report

</Button>


                <Chip

                    color={
                        connected
                            ? "success"
                            : "error"
                    }

                    label={
                        connected
                            ? "CONNECTED"
                            : "OFFLINE"
                    }

                />

                <Typography

                    sx={{

                        ml: 3

                    }}

                >

                    {dayjs().format("DD MMM YYYY")}

                </Typography>

            </Toolbar>
<MachineReportDialog
    open={openReport}
    onClose={() => setOpenReport(false)}
/>
        </AppBar>

    );

}

export default Header;