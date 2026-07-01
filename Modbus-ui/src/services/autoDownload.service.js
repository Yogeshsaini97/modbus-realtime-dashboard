import dayjs from "dayjs";
import { SHIFT_CONFIG } from "../config/shift.config";
import historyService from "./history.service";
import runtimeService from "./runtime.service";

class AutoDownloadService {

    start() {

        console.log("Auto Download Scheduler Started");

        setInterval(() => {

            const now = dayjs();

            if (

                now.hour() === SHIFT_CONFIG.endHour &&

                now.minute() === SHIFT_CONFIG.endMinute &&

                now.second() === 0

            ) {

                console.log("Shift End Reached");

                const btn = document.getElementById(
                    "download-pdf-btn"
                );

                if (btn) {

                    console.log("Clicking Download PDF");

                    btn.click();

                    historyService.clear();

const resetRuntime = runtimeService.reset();

console.log("History Cleared");

console.log("Runtime Reset");

                } else {

                    console.log("Download Button Not Found");

                }

            }

        }, 1000);

    }

}

export default new AutoDownloadService();