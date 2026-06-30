const ModbusRTU = require("modbus-serial");
const { emitModbusData } = require("./socket");

const client = new ModbusRTU();

let pollingTimer = null;

const CONFIG = {

    host: "192.168.3.250",

    port: 502,

    slaveId: 1,

    pollingInterval: 1000

};

async function connectRealModbus() {

    try {

        console.log("\n=======================================");
        console.log("Connecting Modbus TCP...");
        console.log("=======================================\n");

        await client.connectTCP(CONFIG.host, {

            port: CONFIG.port

        });

        client.setID(CONFIG.slaveId);

        console.log("✅ Connected Successfully");
        console.log(`PLC Host : ${CONFIG.host}`);
        console.log(`Port     : ${CONFIG.port}`);
        console.log(`Slave ID : ${CONFIG.slaveId}`);

        startPolling();

    }

    catch (error) {

        console.log("❌ Connection Failed");
        console.log(error.message);

        reconnect();

    }

}

async function pollMachineData() {

    try {

        /*
        -----------------------------------------
        Read Holding Registers
        40500 - 40510
        -----------------------------------------
        */

        const holdingRegisters =
            await client.readHoldingRegisters(500, 11);

        /*
        -----------------------------------------
        Read Machine Status
        Coil 00001
        -----------------------------------------
        */

        const coils =
            await client.readCoils(0, 1);

        const machineStatus =
            coils.data[0]
                ? "ON"
                : "OFF";

        const frequency =
            holdingRegisters.data[4];

        const pipeLength =
            holdingRegisters.data[0];

        const alarm =
            holdingRegisters.data[10] === 1;

        const payload = {

            timestamp: Date.now(),

            registers: {

                motorStatus: machineStatus,

                frequency,

                pipeLength,

                alarm,

                alarmMessage:

                    alarm

                        ? "Machine 1 Motor Frequency Below 50 Hz"

                        : ""

            }

        };

        console.clear();

        console.log("=======================================");
        console.log(" LIVE MACHINE DATA");
        console.log("=======================================\n");

        console.table({

            "Machine Status": machineStatus,

            "Motor Frequency": `${frequency} Hz`,

            "Pipe Length": `${pipeLength} mm`,

            "Alarm": alarm ? "ACTIVE" : "HEALTHY"

        });

        if (alarm) {

            console.log("\n🚨 LOW FREQUENCY ALARM");

            console.log(
                "Machine 1 frequency dropped below 50 Hz."
            );

        }

        emitModbusData(payload);

    }

    catch (error) {

        console.log("\nPolling Error");

        console.log(error.message);

        reconnect();

    }

}

function startPolling() {

    if (pollingTimer) {

        clearInterval(pollingTimer);

    }

    pollingTimer = setInterval(() => {

        pollMachineData();

    }, CONFIG.pollingInterval);

}

function reconnect() {

    if (pollingTimer) {

        clearInterval(pollingTimer);

        pollingTimer = null;

    }

    try {

        client.close();

    }

    catch (err) {}

    console.log("\nReconnecting in 5 seconds...\n");

    setTimeout(() => {

        connectRealModbus();

    }, 5000);

}

module.exports = {

    connectRealModbus

};