import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

class PdfReportService {

    download(machineData, history, runtime) {

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

        doc.text("MotorVision™", 14, 12);

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

        doc.text("Machine Operational Report", 14, 40);

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

                ["Machine Name", "Pipe Cutting Machine 01"],

                ["Machine ID", "PCM-01"],

                ["Motor Company", "Siemens"],

                ["Model", "SIMOTICS GP"],

                ["Software Version", "v1.0.0"],

                ["Generated On", dayjs().format("DD MMM YYYY hh:mm:ss A")],

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

                    "Current Frequency",

                    `${machineData.frequency} Hz`

                ],

                [

                    "Current Pipe Length",

                    `${machineData.pipeLength} mm`

                ],

                [

                    "Runtime Today",

                    `${runtime.todayRuntime} sec`

                ],

                [

                    "Motor Starts",

                    runtime.startCount

                ],

                [

                    "Alarm Status",

                    machineData.alarm

                        ? "LOW FREQUENCY"

                        : "HEALTHY"

                ],

                [

                    "Total Records",

                    history.length

                ],

                [
    "Total Pipe Length Produced",

    `${
        history.length
            ? history[history.length - 1].pipeLength
            : 0
    } mm`

]

            ]

        });

        /*
        ============================================
        OPERATIONAL HISTORY
        ============================================
        */

        autoTable(doc, {

            startY: doc.lastAutoTable.finalY + 10,

            head: [[

                "Time",

                "Motor Status",

                "Frequency",

                "Pipe Length",

                "Alarm"

            ]],

            body: history.map(row => [

                dayjs(row.timestamp).format(

                    "DD MMM HH:mm:ss"

                ),

                row.motorStatus,

                `${row.frequency} Hz`,

                `${row.pipeLength} mm`,

                row.alarm

                    ? "LOW"

                    : "OK"

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

            "MotorVision™ Industrial Monitoring Platform",

            14,

            pageHeight - 12

        );

        doc.text(

            "Powered by Saini Enterprises",

            135,

            pageHeight - 12

        );

        doc.save(

            `Machine_Report_${dayjs().format(

                "DD-MM-YYYY_HH-mm"

            )}.pdf`

        );

    }

}

export default new PdfReportService();