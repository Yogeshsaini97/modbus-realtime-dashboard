import { useEffect, useState } from "react";

import MachineContext from "./MachineContext";

import StorageService from "../services/storage.service";
import HistoryService from "../services/history.service";
import RuntimeService from "../services/runtime.service";
import EventService from "../services/event.service";

import { APP_CONFIG } from "../config/app.config";

import socket from "../Socket/Socket";

function MachineProvider({ children }) {

    const [connected, setConnected] = useState(false);

    const [machineData, setMachineData] = useState(

        StorageService.get(

            APP_CONFIG.STORAGE_KEYS.MACHINE_STATE,

            {

                motorStatus: "OFF",

                motorRPM: 0,

                pipeLength: 0,

                timestamp: null

            }

        )

    );

    const [runtime, setRuntime] = useState(

        RuntimeService.getRuntime()

    );

    const [history, setHistory] = useState(

        HistoryService.getHistory()

    );

    const [events, setEvents] = useState(

        EventService.getEvents()

    );

    useEffect(() => {

        socket.on("connect", () => {

            setConnected(true);

        });

        socket.on("disconnect", () => {

            setConnected(false);

        });

        socket.on("modbus-data", (payload) => {

            const newState = {

                motorStatus: payload.registers.motorStatus,

                motorRPM: payload.registers.motorRPM,

                pipeLength: payload.registers.pipeLength,

                timestamp: payload.timestamp

            };

            // Previous Machine Status

            const previousStatus = machineData.motorStatus;

            // Save Latest State

            StorageService.save(

                APP_CONFIG.STORAGE_KEYS.MACHINE_STATE,

                newState

            );

            // Save History

            const updatedHistory =

                HistoryService.append(newState);

            // Runtime

            const updatedRuntime =

                RuntimeService.update(

                    newState.motorStatus

                );

            // Events

            let updatedEvents = events;

            if (

                previousStatus !== newState.motorStatus

            ) {

                updatedEvents = EventService.add(

                    newState.motorStatus === "ON"

                        ? "Motor Started"

                        : "Motor Stopped"

                );

            }

            setMachineData(newState);

            setHistory(updatedHistory);

            setRuntime(updatedRuntime);

            setEvents(updatedEvents);

        });

        return () => {

            socket.off("connect");

            socket.off("disconnect");

            socket.off("modbus-data");

        };

    }, [machineData, events]);

    return (

        <MachineContext.Provider

            value={{

                connected,

                machineData,

                runtime,

                history,

                events

            }}

        >

            {children}

        </MachineContext.Provider>

    );

}

export default MachineProvider;