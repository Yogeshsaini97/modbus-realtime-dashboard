

import { Button } from "@mui/material";
import StatusCard from "../../Components/Cards/StatusCard";
import Header from "../../Components/Layout/Header";
import { useMachine } from "../../Context/MachineContext";
import "./Dashboard.css";
import MachineReportDialog from "../../Components/report/MachineReportDialog";
import { useState } from "react";

function Dashboard() {

    const [openReport, setOpenReport] = useState(false);
    const {

        machineData,

        connected,

        runtime,

        events

    } = useMachine();

    return (

        <div>
<Button
    variant="contained"
    onClick={() => setOpenReport(true)}
>
    Machine Report
</Button>

<MachineReportDialog
    open={openReport}
    onClose={() => setOpenReport(false)}
/>
            <Header connected={connected} />

            <div className="dashboard">

                <StatusCard
                    title="Power"
                    value={machineData.power}
                    color={
                        machineData.power === "ON"
                            ? "#22C55E"
                            : "#EF4444"
                    }
                />

                <StatusCard
                    title="Speed"
                    value={machineData.speed}
                    unit="RPM"
                    color="#3B82F6"
                />

                <StatusCard
                    title="Temperature"
                    value={machineData.temperature}
                    unit="°C"
                    color="#F59E0B"
                />

                <StatusCard
                    title="Current"
                    value={machineData.current}
                    unit="A"
                    color="#EF4444"
                />

            </div>

        </div>

    );

}

export default Dashboard;