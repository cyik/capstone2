import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import EmotionDetectionPage from "./pages/EmotionDetectionPage";
import TherapistHomePage from "./pages/TherapistHomePage";
import PatientHomePage from "./pages/PatientHomePage";

//These handles the URLs and where they lead to

function App() {
  return (
    <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/therapist-home" element={<TherapistHomePage />} />
    <Route path="/therapist" element={<EmotionDetectionPage />} />
    <Route path="/patient-home" element={<PatientHomePage />} />
</Routes>
  );
}

export default App;