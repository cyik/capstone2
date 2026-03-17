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
import TherapistPatientList from "./pages/TherapistPatientList";
import TherapistSchedule from "./pages/TherapistSchedule";
import PatientSchedule from "./pages/PatientSchedule";

//Important Bruh read this: These handles the URLs and where they lead to XD

// This is our "Security Guard" for the frontend
// It checks if you are logged in and if you have the right role before letting access a page 
const ProtectedRoute = ({ children, allowedRole = null }) => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  if (!username) {
    // Not logged in? Send the user back to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Wrong role? Stops the user from accessing pages that their role doesn't allow
    return <Navigate to={role === "therapist" ? "/therapist-home" : "/patient-home"} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Therapist Routes */}
      <Route path="/therapist-home" element={<ProtectedRoute allowedRole="therapist"><TherapistHomePage /></ProtectedRoute>} />
      <Route path="/therapist" element={<ProtectedRoute allowedRole="therapist"><EmotionDetectionPage /></ProtectedRoute>} />
      <Route path="/therapist-patientpages" element={<ProtectedRoute allowedRole="therapist"><TherapistPatientList /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute allowedRole="therapist"><TherapistSchedule /></ProtectedRoute>} />

      {/* Protected Patient Routes */}
      <Route path="/patient-home" element={<ProtectedRoute allowedRole="patient"><PatientHomePage /></ProtectedRoute>} />
      <Route path="/patient-chat" element={<ProtectedRoute allowedRole="patient"><PatientChatBoard /></ProtectedRoute>} />
      <Route path="/patient-calendar" element={<ProtectedRoute allowedRole="patient"><PatientSchedule /></ProtectedRoute>} />
      <Route path="/aq10-form" element={<ProtectedRoute allowedRole="patient"><AQ10Form /></ProtectedRoute>} />
      <Route path="/dailyreportform" element={<ProtectedRoute allowedRole="patient"><DailyReportForm /></ProtectedRoute>} />

      {/* Shared Protected Routes (Both can message) */}
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;