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

        // ------------------------------------------------
        // Header
        // ------------------------------------------------

        doc.setFillColor(11, 17, 32);

        doc.rect(0, 0, 210, 28, "F");

        doc.setTextColor(255, 255, 255);

        doc.setFontSize(20);

        doc.text("Widhin Imap™", 14, 12);

        doc.setFontSize(10);

        doc.text("Industrial Monitoring Platform", 14, 20);

        doc.text("Powered by Saini Enterprises", 140, 20);

        // ------------------------------------------------

        doc.setTextColor(0);

        doc.setFontSize(16);

        doc.text("Machine Operational Report", 14, 40);

        // ------------------------------------------------
        // Machine Information
        // ------------------------------------------------

        doc.setFontSize(12);

        doc.text("Machine Information", 14, 52);

        autoTable(doc, {

            startY: 56,

            theme: "grid",

            head: [["Property", "Value"]],

            body: [

                ["Machine", "Pipe Cutting Machine 01"],

                ["Machine ID", "PCM-01"],

                ["Generated On", dayjs().format("DD MMM YYYY hh:mm:ss A")],

                ["Software Version", "v1.0.0"],

                ["Status", machineData.motorStatus]

            ]

        });

        // ------------------------------------------------
        // Operational Summary
        // ------------------------------------------------

        autoTable(doc, {

            startY: doc.lastAutoTable.finalY + 10,

            theme: "grid",

            head: [["Operational Summary", "Value"]],

            body: [

                ["Current Motor RPM", `${machineData.motorRPM} RPM`],

                ["Current Pipe Length", `${machineData.pipeLength} mm`],

                ["Runtime Today", `${runtime.todayRuntime} sec`],

                ["Motor Starts", runtime.startCount],

                ["Total Records", history.length],

                [

                    "Total Length Cut",

                    `${history.reduce(

                        (sum, row) => sum + row.pipeLength,

                        0

                    )} mm`

                ]

            ]

        });

        // ------------------------------------------------
        // History
        // ------------------------------------------------

        autoTable(doc, {

            startY: doc.lastAutoTable.finalY + 10,

            head: [[

                "Time",

                "Status",

                "Motor RPM",

                "Pipe Length"

            ]],

            body: history.map(row => [

                dayjs(row.timestamp).format(

                    "DD MMM HH:mm:ss"

                ),

                row.motorStatus,

                `${row.motorRPM} RPM`,

                `${row.pipeLength} mm`

            ]),

            styles: {

                fontSize: 8

            }

        });

        // ------------------------------------------------
        // Footer
        // ------------------------------------------------

        const pageHeight = doc.internal.pageSize.height;

        doc.setDrawColor(180);

        doc.line(

            14,

            pageHeight - 20,

            196,

            pageHeight - 20

        );

        doc.setFontSize(9);

        doc.text(

            "Powered by Saini Enterprises",

            14,

            pageHeight - 12

        );

        doc.text(

            "Widhin Imap™ Industrial Monitoring Platform",

            110,

            pageHeight - 12

        );

        doc.save(

            `Machine_Report_${dayjs().format("DD-MM-YYYY_HH-mm")}.pdf`

        );

    }

}

export default new PdfReportService();