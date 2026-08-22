const fs = require("fs");
const path = require("path");

const storagePath = path.join(__dirname, "production-total.json");

function loadTotalPipeLength() {
    try {
        const { totalPipeLength } = JSON.parse(
            fs.readFileSync(storagePath, "utf8")
        );

        return Number.isFinite(totalPipeLength) && totalPipeLength >= 0
            ? totalPipeLength
            : 0;
    } catch {
        return 0;
    }
}

function saveTotalPipeLength(totalPipeLength) {
    fs.writeFileSync(
        storagePath,
        JSON.stringify({ totalPipeLength }),
        "utf8"
    );
}

module.exports = { loadTotalPipeLength, saveTotalPipeLength };
