import { useEffect, useState } from "react";
import socket from "../Socket/Socket";

function useMachineData() {

    const [machineData, setMachineData] = useState({

        motorStatus: "OFF",

        motorRPM: 0,

        pipeLength: 0,

        timestamp: null

    });

    const [connected, setConnected] = useState(false);

    useEffect(() => {

        socket.on("connect", () => {

            console.log("Connected");

            setConnected(true);

        });

        socket.on("disconnect", () => {

            console.log("Disconnected");

            setConnected(false);

        });

        socket.on("modbus-data", (payload) => {

            console.log(payload);

            setMachineData({

                motorStatus: payload.registers.motorStatus,

                motorRPM: payload.registers.motorRPM,

                pipeLength: payload.registers.pipeLength,

                timestamp: payload.timestamp

            });

        });

        socket.on("system-reset-complete", () => {

    console.log("✅ Backend Reset Successful");

});

        return () => {

            socket.off("connect");

            socket.off("disconnect");

            socket.off("modbus-data");

        };

    }, []);

    return {

        machineData,

        connected

    };

}

export default useMachineData;