const { emitModbusData } = require("./socket");

// Register 10001
let motorStatus = "ON";

// Register 40501
let motorRPM = 2500;

// Register 40505
let pipeLength = 0;

function generateDummyData() {

    // Randomly stop the machine (about once every few minutes)
    if (motorStatus === "ON" && Math.random() > 0.995) {

        motorStatus = "OFF";
        motorRPM = 0;

    }

    // Randomly restart the machine
    if (motorStatus === "OFF" && Math.random() > 0.97) {

        motorStatus = "ON";
        motorRPM = 2500;

    }

    // Machine Running
    if (motorStatus === "ON") {

        // RPM fluctuates naturally
        motorRPM += Math.floor(Math.random() * 21) - 10;

        if (motorRPM < 2450) motorRPM = 2450;
        if (motorRPM > 2550) motorRPM = 2550;

        // Pipe length increases
        pipeLength += Math.floor(Math.random() * 120) + 80;

        // New pipe starts after reaching 6000 mm
        if (pipeLength >= 6000) {

            pipeLength = 0;

        }

    }

    return {

        timestamp: Date.now(),

        registers: {

            motorStatus,

            motorRPM,

            pipeLength

        }

    };

}

function startDummyPolling() {

    console.log("Dummy Modbus Started...");

    setInterval(() => {

        const payload = generateDummyData();

        console.clear();

        console.table(payload.registers);

        emitModbusData(payload);

    }, 1000);

}

module.exports = {

    startDummyPolling

};