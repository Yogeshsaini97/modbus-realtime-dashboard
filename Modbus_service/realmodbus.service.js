const ModbusRTU = require("modbus-serial");
const { emitModbusData } = require("./socket");

const client = new ModbusRTU();

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

            "Pipe Length (mm)": pipeLength,

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

module.exports = {

    connectRealModbus

};