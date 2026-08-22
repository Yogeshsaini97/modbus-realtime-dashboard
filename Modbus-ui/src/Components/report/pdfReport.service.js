import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { formatPipeLength, formatRuntime, getShiftElapsedTime } from "../../helpers/helpers";
import operatorService from "../../services/operator.service";


class PdfReportService {

    getStoppages(history, reportGeneratedAt) {
        const readings = [...history]
            .map((reading) => ({
                ...reading,
                recordedAt: dayjs(reading.timestamp).valueOf(),
                status: String(reading.motorStatus || "").toUpperCase()
            }))
            .filter((reading) => Number.isFinite(reading.recordedAt))
            .sort((first, second) => first.recordedAt - second.recordedAt);

        const stoppages = [];
        let previousStatus = null;
        let stoppedAt = null;

        readings.forEach((reading) => {
            if (previousStatus === "ON" && reading.status === "OFF") {
                stoppedAt = reading.recordedAt;
            }

            if (
                previousStatus === "OFF" &&
                reading.status === "ON" &&
                stoppedAt !== null
            ) {
                stoppages.push({
                    stoppedAt,
                    resumedAt: reading.recordedAt,
                    durationSeconds: Math.max(
                        0,
                        Math.floor((reading.recordedAt - stoppedAt) / 1000)
                    ),
                    isOngoing: false
                });

                stoppedAt = null;
            }

            previousStatus = reading.status;
        });

        if (previousStatus === "OFF" && stoppedAt !== null) {
            stoppages.push({
                stoppedAt,
                resumedAt: null,
                durationSeconds: Math.max(
                    0,
                    Math.floor((reportGeneratedAt - stoppedAt) / 1000)
                ),
                isOngoing: true
            });
        }

        return stoppages;
    }
   

    download(
    machineData,
    history,
    runtime,
    currentInterval,
    intervalData
) {

         const operatorName = operatorService.get();
        const reportGeneratedAt = Date.now();
        const stoppages = this.getStoppages(history, reportGeneratedAt);

        if (!history.length) {

            alert("No records found.");

            return;

        }

        const doc = new jsPDF();

        /*
        ============================================
        HEADER
        ============================================
        */

        doc.setFillColor(11, 17, 32);

        doc.rect(0, 0, 210, 28, "F");

        doc.setTextColor(255, 255, 255);

        doc.setFontSize(20);

        doc.text("Vansh Industries", 14, 12);

        doc.setFontSize(10);

        doc.text("Industrial Monitoring Platform", 14, 20);

        doc.text("Powered by Saini Enterprises", 128, 20);

        /*
        ============================================
        TITLE
        ============================================
        */

        doc.setTextColor(0);

        doc.setFontSize(16);

        doc.text("Production Shift Report", 14, 40);

        /*
        ============================================
        MACHINE INFORMATION
        ============================================
        */

        autoTable(doc, {

            startY: 48,

            theme: "grid",

            head: [["Property", "Value"]],

            body: [

    ["Machine Name", "Braiding Machine No. 34"],

    ["Machine ID", "Machine number 17"],

    ["Assigned Operator", operatorName],

    [
    "Current Shift",
    `${currentInterval.start} to ${currentInterval.end}`
],

    ["Report Generated On", dayjs(reportGeneratedAt).format("DD MMM YYYY HH:mm:ss")],

    ["Machine Status", machineData.motorStatus]

]

        });

        
        /*
        ============================================
        PRODUCTION SUMMARY
        ============================================
        */

        autoTable(doc, {

            startY: doc.lastAutoTable.finalY + 10,

            theme: "grid",

            head: [["Production Summary", "Value"]],

           body: [

[
    "Total Pipe Produced In This Shift",
    formatPipeLength(intervalData.production)
],

[
    "Actual Runtime This Shift",
    formatRuntime(runtime.todayRuntime) || 0
],

[
    "Total Shift Time",
    getShiftElapsedTime(currentInterval)
],

[
    "Machine Starts Count",
    intervalData.startCount
],

[
    "Machine Stops Count",
    intervalData.stopCount
],

[
    "Current Motor Frequency",
    `${machineData.frequency} Hz`
],

[
    "Alarm Status",
    machineData.alarm
        ? "Low Frequency"
        : "Healthy"
],

[
    "Records Captured",
    history.length
]

]

        });

        /*
        ============================================
        MACHINE STOPPAGE HISTORY
        ============================================
        */

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,

            theme: "grid",

            head: [[
                "Machine Stopped At",
                "Machine Resumed At",
                "Stopped For"
            ]],

            body: stoppages.length
                ? stoppages.map((stoppage) => [
                    dayjs(stoppage.stoppedAt).format("DD MMM YYYY HH:mm:ss"),
                    stoppage.isOngoing
                        ? "Still stopped at report generation"
                        : dayjs(stoppage.resumedAt).format("DD MMM YYYY HH:mm:ss"),
                    `${formatRuntime(stoppage.durationSeconds)}${
                        stoppage.isOngoing ? " (ongoing)" : ""
                    }`
                ])
                : [["No machine stoppages recorded", "-", "-"]],

            styles: {
                fontSize: 8
            }
        });


        /*
        ============================================
        OPERATIONAL HISTORY
        ============================================
        */

autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,

    theme: "grid",

    head: [[
        "Time",
        "Motor Status",
        "Frequency",
        "Total Pipe Produced",
        "Alarm Status"
    ]],

    body: history.map(row => [

        dayjs(row.timestamp).format(
            "DD MMM HH:mm:ss"
        ),

        row.motorStatus,

        `${row.frequency} Hz`,

        formatPipeLength(row.totalPipeLength),

        row.alarm
            ? "Low Frequency"
            : "Healthy"

    ]),

    styles: {
        fontSize: 8
    }
});

        /*
        ============================================
        FOOTER
        ============================================
        */

        const pageHeight =

            doc.internal.pageSize.height;

        doc.setDrawColor(180);

        doc.line(

            14,

            pageHeight - 20,

            196,

            pageHeight - 20

        );

        doc.setFontSize(9);

        doc.text(

            "Vansh Industries - Industrial Monitoring Platform",

            14,

            pageHeight - 12

        );

        doc.text(

            "Powered by Saini Enterprises",

            135,

            pageHeight - 12

        );

       const safeOperator = operatorName
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");

    const pages = doc.internal.getNumberOfPages();

for (let i = 1; i <= pages; i++) {

    doc.setPage(i);

    doc.setFontSize(8);

    doc.text(

        `Page ${i} of ${pages}`,

        170,

        290

    );

}


doc.save(
`${safeOperator}_Shift_Report_${dayjs().format(
    "DD-MM-YYYY_HH-mm"
)}.pdf`

);

    }

}

export default new PdfReportService();
