import dayjs from "dayjs";
import { SHIFT_CONFIG } from "../config/shift.config";

export function getRemainingShiftTime() {

    const now = dayjs();

    const end = dayjs()
        .hour(SHIFT_CONFIG.endHour)
        .minute(SHIFT_CONFIG.endMinute)
        .second(0);

    const diff = end.diff(now);

    if (diff <= 0) {

        return "Shift Over";

    }

    const hours = Math.floor(diff / (1000 * 60 * 60));

    const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60)
    );

    const seconds = Math.floor(
        (diff % (1000 * 60)) / 1000
    );

    return `${hours} Hr ${minutes} Min ${seconds} Sec`;

}