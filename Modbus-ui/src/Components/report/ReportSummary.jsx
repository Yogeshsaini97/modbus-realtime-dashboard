import {
    Grid,
    Paper,
    Typography,
    Chip
} from "@mui/material";

import dayjs from "dayjs";

import { useMachine } from "../../Context/MachineContext";

function ReportSummary() {

    const {
        machineData,
        history,
        runtime
    } = useMachine();

    const cards = [

        {
            title: "Report Date",
            value: dayjs().format("DD MMM YYYY")
        },

        {
            title: "Generated At",
            value: dayjs().format("hh:mm:ss A")
        },

        {
            title: "Total Records",
            value: history.length
        },

        {
            title: "Motor Starts",
            value: runtime.startCount || 0
        },

        {
            title: "Runtime Today",
            value: `${runtime.todayRuntime || 0} sec`
        },

        {
            title: "Current RPM",
            value: `${machineData.motorRPM} RPM`
        },

        {
            title: "Current Pipe Length",
            value: `${machineData.pipeLength} mm`
        }

    ];

    return (

        <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
        >

            {/* Motor Status Card */}

            <Grid item xs={12} sm={6} md={3}>

                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        textAlign: "center",
                        height: "100%",
                        transition: ".3s",
                        "&:hover": {
                            transform: "translateY(-3px)"
                        }
                    }}
                >

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Motor Status
                    </Typography>

                    <Chip
                        label={machineData.motorStatus}
                        color={
                            machineData.motorStatus === "ON"
                                ? "success"
                                : "error"
                        }
                        sx={{
                            mt: 2,
                            fontWeight: "bold"
                        }}
                    />

                </Paper>

            </Grid>

            {/* Remaining Cards */}

            {cards.map((card) => (

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    key={card.title}
                >

                    <Paper
                        elevation={3}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            textAlign: "center",
                            height: "100%",
                            transition: ".3s",
                            "&:hover": {
                                transform: "translateY(-3px)"
                            }
                        }}
                    >

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >

                            {card.title}

                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                mt: 1,
                                fontWeight: 700
                            }}
                        >

                            {card.value}

                        </Typography>

                    </Paper>

                </Grid>

            ))}

        </Grid>

    );

}

export default ReportSummary;