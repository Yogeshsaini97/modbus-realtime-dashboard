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

        console.log("================================");
        console.log("Connecting Modbus TCP...");
        console.log("================================");

        await client.connectTCP(CONFIG.host, {

            port: CONFIG.port

        });

        client.setID(CONFIG.slaveId);

        console.log("✅ Connected Successfully");
        console.log(`PLC : ${CONFIG.host}:${CONFIG.port}`);
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
            Read Holding Registers

            40500
            40501 -> Motor RPM
            40502
            40503
            40504
            40505 -> Pipe Length
        */

        const response =
            await client.readHoldingRegisters(500, 6);

        const registers = response.data;

        /*
            TODO

            Read Motor Status once
            register 10001 is confirmed.

            Example:

            const di = await client.readDiscreteInputs(0,1);

            const motorStatus =
                di.data[0]
                ? "ON"
                : "OFF";
        */

        const payload = {

            timestamp: Date.now(),

            registers: {

                motorStatus: "UNKNOWN",

                motorRPM: registers[1],

                pipeLength: registers[5]

            }

        };

        console.clear();

        console.table(payload.registers);

        emitModbusData(payload);

    }

    catch (error) {

        console.log("Polling Error");

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

    console.log("Reconnecting in 5 seconds...");

    setTimeout(() => {

        connectRealModbus();

    }, 5000);

}

module.exports = {

    connectRealModbus

};