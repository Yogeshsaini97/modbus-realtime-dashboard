import StorageService from "./storage.service";
import { APP_CONFIG } from "../config/app.config";

class HistoryService {

    lastSaveTime = 0;
    append(reading) {

    const now = Date.now();

    // Save only every 10 seconds
    const SAVE_INTERVAL = 60 * 1000; // 1 Minute

if (now - this.lastSaveTime < SAVE_INTERVAL) {

    return this.getHistory();

}

    this.lastSaveTime = now;

    const history = StorageService.get(

        APP_CONFIG.STORAGE_KEYS.MACHINE_HISTORY,

        []

    );

    history.push(reading);

    StorageService.save(

        APP_CONFIG.STORAGE_KEYS.MACHINE_HISTORY,

        history

    );

  

    

    return history;

}

    getHistory() {

        return StorageService.get(
            APP_CONFIG.STORAGE_KEYS.MACHINE_HISTORY,
            []
        );

    }

    clearHistory() {

        StorageService.remove(
            APP_CONFIG.STORAGE_KEYS.MACHINE_HISTORY
        );

    }

}

export default new HistoryService();
