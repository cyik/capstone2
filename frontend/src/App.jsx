import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import TherapistPage from "./pages/TherapistPage";
import PatientPage from "./pages/PatientPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/therapist" element={<TherapistPage />} />
      <Route path="/patient" element={<PatientPage />} />
    </Routes>
  );
}

export default App;