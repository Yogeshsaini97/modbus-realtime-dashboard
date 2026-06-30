async function pollMachineData() {

    try {

        console.clear();

        console.log("========================================");
        console.log("Reading PLC Registers...");
        console.log("========================================");

        /*
        ----------------------------------------------------
        Holding Registers
        40500 - 40520
        ----------------------------------------------------
        */

        const hr = await client.readHoldingRegisters(500, 21);

        console.log("\nHolding Registers (40500 - 40520)\n");

        hr.data.forEach((value, index) => {

            console.log(
                `40${500 + index} : ${value}`
            );

        });

        /*
        ----------------------------------------------------
        Coils
        00001 - 00020
        ----------------------------------------------------
        */

        try {

            const coils = await client.readCoils(0, 20);

            console.log("\nCoils (00001 - 00020)\n");

            coils.data.forEach((value, index) => {

                console.log(
                    `${index + 1} : ${value}`
                );

            });

        } catch (err) {

            console.log("No Coil Data");

        }

        /*
        ----------------------------------------------------
        Discrete Inputs
        10001 - 10020
        ----------------------------------------------------
        */

        try {

            const di =
                await client.readDiscreteInputs(0, 20);

            console.log("\nDiscrete Inputs (10001 - 10020)\n");

            di.data.forEach((value, index) => {

                console.log(

                    `10${String(index + 1).padStart(3, "0")} : ${value}`

                );

            });

        } catch (err) {

            console.log("No Discrete Inputs");

        }

        /*
        ----------------------------------------------------
        Input Registers
        30001 - 30020
        ----------------------------------------------------
        */

        try {

            const ir =
                await client.readInputRegisters(0, 20);

            console.log("\nInput Registers (30001 - 30020)\n");

            ir.data.forEach((value, index) => {

                console.log(
                    `30${String(index + 1).padStart(3, "0")} : ${value}`
                );

            });

        } catch (err) {

            console.log("No Input Registers");

        }

        /*
        ----------------------------------------------------
        Temporary Payload
        ----------------------------------------------------
        */

        const payload = {

            timestamp: Date.now(),

            registers: {

                motorStatus: "UNKNOWN",

                frequency: hr.data[1],

                pipeLength: hr.data[5]

            }

        };

        console.log("\nPayload\n");

        console.table(payload.registers);

        emitModbusData(payload);

    }

    catch (error) {

        console.log("Polling Error");

        console.log(error.message);

        reconnect();

    }

}