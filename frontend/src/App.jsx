import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import EmotionDetectionPage from "./pages/EmotionDetectionPage";
import TherapistHomePage from "./pages/TherapistHomePage";
import PatientHomePage from "./pages/PatientHomePage";
import DailyReportForm from "./pages/DailyReportForm";
import RegisterPage from "./pages/Register"
import PatientChatBoard from "./pages/PatientChatBoard";
import Messages from "./pages/Messages";
import AQ10Form from "./pages/AQ10Form";

//These handles the URLs and where they lead to

function App() {
  return (
    <Routes>
    {/* Make page always redirect to Login.jsx page first*/}
    <Route path="/" element={<Navigate to="/login" replace />} />

    <Route path="/login" element={<Login />} />
    <Route path="/therapist-home" element={<TherapistHomePage />} />
    <Route path="/therapist" element={<EmotionDetectionPage />} />
    <Route path="/patient-home" element={<PatientHomePage />} />
    <Route path="/dailyreportform" element={<DailyReportForm />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/patient-chat" element={<PatientChatBoard />} />
    <Route path="/messages" element={<Messages />} />
    <Route path="/aq10-form" element={<AQ10Form />} />
    
</Routes>
  );
}

export default App;