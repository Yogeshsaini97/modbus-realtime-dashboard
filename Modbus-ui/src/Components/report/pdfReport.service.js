import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { formatPipeLength, formatRuntime } from "../../helpers/helpers";
import operatorService from "../../services/operator.service";


class PdfReportService {
   

    download(machineData, history, runtime) {

         const operatorName = operatorService.get();

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

    ["Machine Name", "Braiding Machine No. 17"],

    ["Machine ID", "Machine number 17"],

    ["Operator Name", operatorName],

    ["Motor Company", "N/A"],

    ["Model", "N/A"],

    ["Software Version", "v1.0.0"],

    ["Report Generated On", dayjs().format("DD MMM YYYY hh:mm:ss A")],

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

                    "current motor frequency(HZ)",

                    `${machineData.frequency} Hz`

                ],

                [

                    "TotalPipe Length produced",

                    `${formatPipeLength(machineData.totalPipeLength)}`

                ],

                [

                    "Runtime Today",

                    `${formatRuntime(runtime?.todayRuntime)}`

                ],

                [

                    "Machine Start Count",

                    runtime.startCount

                ],

                [

                    "Alarm Status",

                    machineData.alarm

                        ? "LOW FREQUENCY"

                        : "HEALTHY"

                ],

                [

                    "Total Records Saved",

                    history.length

                ],

                [
    "Total Pipe Length Produced",

    `${
       formatPipeLength( history.length
            ? history[history.length - 1].pipeLength
            : 0
                 ) } `

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

                "Motor Status Recorded",

                "Frequency Recorded",

                "Total Pipe Length",

                "Alarm"

            ]],

            body: history.map(row => [

                dayjs(row.timestamp).format(

                    "DD MMM HH:mm:ss"

                ),

                row.motorStatus,

                `${row.frequency} Hz`,

                `${formatPipeLength(row.totalPipeLength)}`,

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

doc.save(

    `${safeOperator}_${dayjs().format(

        "DD-MM-YYYY_HH-mm"

    )}_Report.pdf`

);

    }

}

export default new PdfReportService();