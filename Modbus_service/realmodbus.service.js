const ModbusRTU = require("modbus-serial");
const { emitModbusData } = require("./socket");

const client = new ModbusRTU();

/*
-----------------------------------------
Production Tracking
-----------------------------------------
*/

let previousPipeLength = 0;

let totalPipeLength = 0;

let pipeLengthOffset = 0;

let resetRequested = false;

let pollingTimer = null;

const CONFIG = {

    // CONNECTION TYPE
    connectionType: "TCP", // "TCP" or "RTU"

    // TCP SETTINGS
    tcp: {
        host: "192.168.3.250",
        port: 502
    },

    // SERIAL SETTINGS
    serial: {
        port: "COM2",
        baudRate: 9600,
        dataBits: 8,
        parity: "none",
        stopBits: 1
    },

    // COMMON
    slaveId: 1,

    pollingInterval: 1000

};

async function connectRealModbus() {

    try {

        console.log("================================");
        console.log("Connecting PLC...");
        console.log("================================");

        if (CONFIG.connectionType === "TCP") {

            console.log("Connection Type : TCP/IP");

            await client.connectTCP(

                CONFIG.tcp.host,

                {

                    port: CONFIG.tcp.port

                }

            );

        } else {

            console.log("Connection Type : Serial (RTU)");

            await client.connectRTUBuffered(

                CONFIG.serial.port,

                {

                    baudRate: CONFIG.serial.baudRate,

                    dataBits: CONFIG.serial.dataBits,

                    parity: CONFIG.serial.parity,

                    stopBits: CONFIG.serial.stopBits

                }

            );

        }

        client.setID(CONFIG.slaveId);

        console.log("✅ PLC Connected");

        if (CONFIG.connectionType === "TCP") {

            console.log(`Host     : ${CONFIG.tcp.host}`);
            console.log(`Port     : ${CONFIG.tcp.port}`);

        } else {

            console.log(`COM Port : ${CONFIG.serial.port}`);
            console.log(`BaudRate : ${CONFIG.serial.baudRate}`);

        }

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

            const currentPipeRegister =
    await client.readHoldingRegisters(120, 1);

            

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

       let pipeLength =
    currentPipeRegister.data[0];

    if (resetRequested) {

    pipeLengthOffset = pipeLength;

    previousPipeLength = 0;

    totalPipeLength = 0;

    resetRequested = false;

    console.log("\n====================================");

    console.log("NEW PRODUCTION STARTED");

    console.log("Baseline :", pipeLengthOffset);

    console.log("====================================\n");

}

pipeLength = Math.max(

    0,

    pipeLength - pipeLengthOffset

);

/*
-----------------------------------------
Pipe Production Tracking
-----------------------------------------
*/

/*
-----------------------------------------
TOTAL PRODUCTION
-----------------------------------------
*/

// First reading
if (previousPipeLength === 0) {

    previousPipeLength = pipeLength;

}

// Pipe increased
if (pipeLength > previousPipeLength) {

    totalPipeLength += (pipeLength - previousPipeLength);

}

// Pipe reset to zero (new pipe)
if (pipeLength < previousPipeLength) {

    totalPipeLength += pipeLength;

}

previousPipeLength = pipeLength;

const alarm =
    holdingRegisters.data[10] === 1;

        /*
        -----------------------------------------
        DEBUG OUTPUT
        -----------------------------------------
        */

        console.clear();

        console.log("========================================");
        console.log("      LIVE PLC REGISTER MONITOR");
        console.log("========================================\n");

        console.log("📘 HOLDING REGISTERS");

        console.log("----------------------------------------");

        holdingRegisters.data.forEach((value, index) => {

            console.log(

                `40${500 + index} = ${value}`

            );

        });

        console.log("\n📗 COILS");

        console.log("----------------------------------------");

        coils.data.forEach((value, index) => {

            console.log(

                `${String(index + 1).padStart(5, "0")} = ${value}`

            );

        });

        console.log("\n========================================");
        console.log(" INTERPRETED MACHINE DATA");
        console.log("========================================");

        console.table({

    "Machine Status": machineStatus,

    "Frequency (Hz)": frequency,

    "Current Pipe (mm)": pipeLength,

    "Total Produced (mm)": totalPipeLength + pipeLength,

    "Alarm Register": holdingRegisters.data[10],

    "Alarm Status": alarm

});
        if (alarm) {

            console.log("\n🚨 LOW FREQUENCY ALARM ACTIVE");

        } else {

            console.log("\n✅ MACHINE HEALTHY");

        }

        /*
        -----------------------------------------
        Payload to React
        -----------------------------------------
        */

        const payload = {

            timestamp: Date.now(),

           registers: {

    motorStatus: machineStatus,

    frequency,

    pipeLength,

    totalPipeLength: totalPipeLength + pipeLength,

    alarm,

    alarmMessage:

        alarm

            ? "Machine 1 Motor Frequency Below 40 Hz"

            : ""

}

        };

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

function resetProductionReal() {

    console.log("\n====================================");

    console.log("SYSTEM RESET REQUEST RECEIVED");

    console.log("====================================");

    previousPipeLength = 0;

    totalPipeLength = 0;

    resetRequested = true;

    console.log("Waiting for next PLC reading...");

}

module.exports = {

    connectRealModbus,

    resetProductionReal

};