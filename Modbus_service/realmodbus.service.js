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

    } catch (error) {

        console.log("❌ Connection Failed");
        console.log(error.message);

        reconnect();

    }

}

async function pollMachineData() {

    try {

        console.clear();

        console.log("=======================================");
        console.log("      PLC REGISTER SCANNER");
        console.log("=======================================\n");

        /*
        ======================================================
        HOLDING REGISTERS
        40500 - 40520
        ======================================================
        */

        try {

            const hr = await client.readHoldingRegisters(500, 21);

            console.log("📘 HOLDING REGISTERS");

            console.log("---------------------------------------");

            hr.data.forEach((value, index) => {

                console.log(

                    `40${500 + index}  =  ${value}`

                );

            });

        } catch (err) {

            console.log("Holding Registers Error");

            console.log(err.message);

        }

        /*
        ======================================================
        COILS
        00001 - 00020
        ======================================================
        */

        try {

            const coils = await client.readCoils(0, 20);

            console.log("\n📗 COILS");

            console.log("---------------------------------------");

            coils.data.forEach((value, index) => {

                console.log(

                    `${String(index + 1).padStart(5, "0")} = ${value}`

                );

            });

        } catch (err) {

            console.log("\nNo Coil Data");

        }

        /*
        ======================================================
        DISCRETE INPUTS
        10001 - 10020
        ======================================================
        */

        try {

            const inputs =

                await client.readDiscreteInputs(0, 20);

            console.log("\n📙 DISCRETE INPUTS");

            console.log("---------------------------------------");

            inputs.data.forEach((value, index) => {

                console.log(

                    `10${String(index + 1).padStart(3, "0")} = ${value}`

                );

            });

        } catch (err) {

            console.log("\nNo Discrete Inputs");

        }

        /*
        ======================================================
        INPUT REGISTERS
        30001 - 30020
        ======================================================
        */

        try {

            const ir =

                await client.readInputRegisters(0, 20);

            console.log("\n📕 INPUT REGISTERS");

            console.log("---------------------------------------");

            ir.data.forEach((value, index) => {

                console.log(

                    `30${String(index + 1).padStart(3, "0")} = ${value}`

                );

            });

        } catch (err) {

            console.log("\nNo Input Registers");

        }

        /*
        ======================================================
        TEMPORARY PAYLOAD
        ======================================================
        */

        const hr = await client.readHoldingRegisters(500, 21);

        const payload = {

            timestamp: Date.now(),

            registers: {

                motorStatus: "UNKNOWN",

                frequency: hr.data[1],

                pipeLength: hr.data[5]

            }

        };

        console.log("\n=======================================");
        console.log("CURRENT PAYLOAD");
        console.log("=======================================\n");

        console.table(payload.registers);

        emitModbusData(payload);

    } catch (error) {

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

    } catch (err) {}

    console.log("\nReconnecting in 5 seconds...\n");

    setTimeout(() => {

        connectRealModbus();

    }, 5000);

}

module.exports = {

    connectRealModbus

};