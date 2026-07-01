import { useEffect } from "react";
import Dashboard from "./Pages/Dashboard/Dashboard";
import autoDownloadService from "./services/autoDownload.service";


function App() {

  useEffect(() => {

    autoDownloadService.start();

}, []);
  return <Dashboard />;
}

export default App;