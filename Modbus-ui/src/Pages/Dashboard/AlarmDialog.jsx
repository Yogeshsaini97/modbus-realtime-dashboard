import {
    Dialog,
    DialogContent,
    Typography,
    Button,
    Box,
    Divider
} from "@mui/material";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

function AlarmDialog({

    open,

    frequency,

    alarmMessage,

    onClose

}) {

    return (

        <Dialog
            open={open}
            fullWidth
            maxWidth="sm"
            disableEscapeKeyDown
            PaperProps={{
                sx:{

                    borderRadius:4,

                    background:"#1B0B0B",

                    border:"4px solid #FF3B30",

                    boxShadow:"0 0 40px rgba(255,0,0,.9)",

                    color:"#fff"

                }
            }}
        >

            <DialogContent
                sx={{

                    textAlign:"center",

                    py:5

                }}
            >

                <WarningAmberRoundedIcon
                    sx={{
                        fontSize:90,
                        color:"#FF3B30",
                        animation:"blink 1s infinite"
                    }}
                />

                <Typography
                    variant="h3"
                    fontWeight="bold"
                    color="#FF3B30"
                    mt={2}
                >

                    DANGER

                </Typography>

                <Typography
                    variant="h5"
                    fontWeight="bold"
                    mt={1}
                >

                   LOW FREQUENCY (Below 40 Hz)

                </Typography>

                <Divider
                    sx={{
                        my:3,
                        bgcolor:"#5C1C1C"
                    }}
                />

               <Typography
    fontSize={18}
    color="#DDD"
>

    {alarmMessage ||

    "Machine 1 Motor Frequency has dropped below 40 Hz. Immediate operator intervention is required."}

</Typography>

                <Box
                    sx={{

                        mt:4,

                        py:3,

                        border:"2px dashed #FF3B30",

                        borderRadius:3,

                        background:"rgba(255,0,0,.08)"

                    }}
                >

                    <Typography
                        color="gray"
                    >

                        Current Frequency

                    </Typography>

                    <Typography
                        variant="h2"
                        fontWeight="bold"
                        color="#FFD54F"
                    >

                        {frequency} Hz

                    </Typography>

                </Box>

                <Typography
                    sx={{
                        mt:3,
                        color:"#FCA5A5"
                    }}
                >

                    Immediate operator attention is required.

                </Typography>

                <Button

                    variant="contained"

                    color="error"

                    size="large"

                    sx={{

                        mt:5,

                        px:6,

                        py:1.5,

                        fontWeight:"bold"

                    }}

                    onClick={onClose}

                >

                    ACKNOWLEDGE ALARM

                </Button>

            </DialogContent>

        </Dialog>

    );

}

export { AlarmDialog};