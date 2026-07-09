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

    pollingInterval: 60000

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
        40501 - 40511
        -----------------------------------------
        */

        const holdingRegisters =
            await client.readHoldingRegisters(500, 11);

        /*
        -----------------------------------------
        Read Current Pipe Length (40120)
        -----------------------------------------
        */

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

        /*
        -----------------------------------------
        REGISTER DEBUG
        -----------------------------------------
        */

        console.log("\n========================================");
        console.log("PLC REGISTER DEBUG");
        console.log("========================================");
        console.log("40120 Raw Pipe Length :", pipeLength);
        console.log("40505 Frequency       :", frequency);
        console.log("40511 Alarm Register  :", holdingRegisters.data[10]);
        console.log("Machine Status        :", machineStatus);
        console.log("========================================\n");

        /*
        -----------------------------------------
        RESET BASELINE
        -----------------------------------------
        */

        if (resetRequested) {

            pipeLengthOffset = pipeLength;

            previousPipeLength = 0;

            totalPipeLength = 0;

            resetRequested = false;

            console.log("\n====================================");
            console.log("NEW PRODUCTION STARTED");
            console.log("Baseline Offset :", pipeLengthOffset);
            console.log("====================================\n");

        }

        console.log("Raw Pipe Length        :", pipeLength);
        console.log("Pipe Length Offset     :", pipeLengthOffset);

        pipeLength = Math.max(

            0,

            pipeLength - pipeLengthOffset

        );

        console.log("Displayed Pipe Length  :", pipeLength);

        /*
        -----------------------------------------
        TOTAL PRODUCTION
        -----------------------------------------
        */

        console.log("\n====================================");
        console.log("PRODUCTION TRACKING");
        console.log("====================================");
        console.log("Previous Pipe Length :", previousPipeLength);
        console.log("Current Pipe Length  :", pipeLength);
        console.log("Current Total        :", totalPipeLength);

        // First reading

        /*
-----------------------------------------
TOTAL PRODUCTION
-----------------------------------------
*/

/*
-----------------------------------------
TOTAL PRODUCTION
-----------------------------------------
*/

console.log("\n====================================");
console.log("PRODUCTION TRACKING");
console.log("====================================");

console.log("Previous Pipe Length :", previousPipeLength);
console.log("Current Pipe Length  :", pipeLength);

// First Reading
if (previousPipeLength === 0) {

    previousPipeLength = pipeLength;

    console.log("First Reading");

}

// Pipe is increasing
else if (pipeLength >= previousPipeLength) {

    const difference = pipeLength - previousPipeLength;

    totalPipeLength += difference;

    console.log(`Pipe Increased : +${difference} mm`);

}

// Pipe completed and restarted
else {

    console.log("New Pipe Detected");

    totalPipeLength += pipeLength;

    console.log(`Added New Pipe Length : +${pipeLength} mm`);

}

previousPipeLength = pipeLength;

console.log("------------------------------------");
console.log("Updated Previous :", previousPipeLength);
console.log("Updated Total    :", totalPipeLength);
console.log("====================================\n");

        const alarm =
            holdingRegisters.data[10] === 1;

        /*
        -----------------------------------------
        COMPLETE DEBUG TABLE
        -----------------------------------------
        */

        console.clear();

        console.table({

            "Machine Status": machineStatus,

            "Frequency (Hz)": frequency,

            "40120 Raw Value": currentPipeRegister.data[0],

            "Pipe Offset": pipeLengthOffset,

            "Displayed Pipe": pipeLength,

            "Previous Pipe": previousPipeLength,

         "Total Produced": totalPipeLength,

            "Alarm Register": holdingRegisters.data[10],

            "Alarm Status": alarm

        });

        /*
        -----------------------------------------
        Payload
        -----------------------------------------
        */

        const payload = {

            timestamp: Date.now(),

            registers: {

    motorStatus: machineStatus,

    frequency,

    pipeLength,

    totalPipeLength,

    alarm,

    alarmMessage:

        alarm

            ? "Machine 1 Motor Frequency Below 40 Hz"

            : ""

}
        };

        console.log("\n====================================");
        console.log("PAYLOAD TO REACT");
        console.log("====================================");

        console.dir(payload, { depth: null });

        console.log("====================================\n");

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