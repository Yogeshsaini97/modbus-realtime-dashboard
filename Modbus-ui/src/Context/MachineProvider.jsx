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

                frequency: 0,

                pipeLength: 0,

                alarm: false,

                alarmMessage: "",

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

                frequency: payload.registers.frequency,

                pipeLength: payload.registers.pipeLength,

                alarm: payload.registers.alarm,

                alarmMessage: payload.registers.alarmMessage,

                timestamp: payload.timestamp

            };

            const previousStatus = machineData.motorStatus;

            const previousAlarm = machineData.alarm;

            StorageService.save(

                APP_CONFIG.STORAGE_KEYS.MACHINE_STATE,

                newState

            );

            const updatedHistory =

                HistoryService.append(newState);

            const updatedRuntime =

                RuntimeService.update(

                    newState.motorStatus

                );

            let updatedEvents = events;

            // Motor Events

            if (previousStatus !== newState.motorStatus) {

                updatedEvents = EventService.add(

                    newState.motorStatus === "ON"

                        ? "Machine Started"

                        : "Machine Stopped"

                );

            }

            // Alarm Trigger

            if (!previousAlarm && newState.alarm) {

                updatedEvents = EventService.add(

                    "⚠ Low Frequency Alarm"

                );

            }

            // Alarm Cleared

            if (previousAlarm && !newState.alarm) {

                updatedEvents = EventService.add(

                    "✅ Frequency Back To Normal"

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