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
import Schedule from "./pages/Schedule";

import ProtectedRoute from "./components/ProtectedRoute";
//These handles the URLs and where they lead to

function App() {
  return (
    <Routes>
    {/* Make page always redirect to Login.jsx page first*/}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />

    <Route path="/therapist-home" element={<ProtectedRoute> <TherapistHomePage /> </ProtectedRoute>} />
    <Route path="/therapist" element={<ProtectedRoute> <EmotionDetectionPage /> </ProtectedRoute>} />
    <Route path="/patient-home" element={<ProtectedRoute> <PatientHomePage /> </ProtectedRoute>} />
    <Route path="/dailyreportform" element={<ProtectedRoute> <DailyReportForm /> </ProtectedRoute>} />
    <Route path="/patient-chat" element={<ProtectedRoute> <PatientChatBoard /> </ProtectedRoute>} />
    <Route path="/messages" element={<ProtectedRoute> <Messages /> </ProtectedRoute>} />
    <Route path="/aq10-form" element={<ProtectedRoute> <AQ10Form /> </ProtectedRoute>} />
    <Route path="/calendar" element={<ProtectedRoute> <Schedule /> </ProtectedRoute>} />

</Routes>
  );
}

export default App;