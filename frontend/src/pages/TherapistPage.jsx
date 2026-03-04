import logo from "../assets/eztherapy transparent.png";
import EmotionDetection from "./EmotionDetection";

function Therapist() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-4 px-6 shadow-md flex items-center gap-4">
  {/* Logo */}
  <img
    src={logo}
    alt="logo"
    className="w-12 sm:w-30 h-auto object-contain"
  />

  {/* Title */}
  <h1 className="text-2xl font-bold">Therapist Dashboard</h1>
</header>

      {/* Page Content */}
      <main className="p-6">
        <p>Welcome to your therapist dashboard!</p>
        <EmotionDetection />
      </main>
    </div>
  );
}

export default Therapist;