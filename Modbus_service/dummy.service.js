const { emitModbusData } = require("./socket");

// Machine Status
let motorStatus = "ON";

// Frequency (Hz)
let frequency = 52;

// Pipe Length (mm)
let pipeLength = 0;

// Alarm
let alarm = false;

// Direction for smooth frequency movement
let direction = -0.3;

function generateDummyData() {

    // Random machine OFF
    if (motorStatus === "ON" && Math.random() > 0.995) {

        motorStatus = "OFF";
        frequency = 0;

    }

    // Random machine ON
    if (motorStatus === "OFF" && Math.random() > 0.98) {

        motorStatus = "ON";
        frequency = 52;
        direction = -0.3;

    }

    if (motorStatus === "ON") {

        /*
        Smooth Frequency Movement

        52
        51.7
        51.4
        51.1
        50.8
        50.5
        50.2
        49.9  <-- Alarm
        */

        frequency += direction;

        if (frequency <= 47) {

            direction = 0.4;

        }

        if (frequency >= 54) {

            direction = -0.4;

        }

        frequency = Number(frequency.toFixed(1));

        // Pipe Production

        pipeLength += Math.floor(Math.random() * 70) + 50;

        if (pipeLength >= 6000) {

            pipeLength = 0;

        }

    }

    alarm =
        motorStatus === "ON" &&
        frequency < 40;

    return {

        timestamp: Date.now(),

        registers: {

            motorStatus,

            frequency,

            pipeLength,

            alarm,

            alarmMessage: alarm
                ? "Machine 1 Motor Frequency Below 40 Hz"
                : ""

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