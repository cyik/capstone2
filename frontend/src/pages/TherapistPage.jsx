import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import logo from "../assets/eztherapy transparent.png";

// Single Question Section Component
function QuestionSection({
  question,
  index,
  handleChange,
  isSelected,
  onSelect,
  onDelete
}) {
  return (
    <div
      onClick={() => onSelect(index)}
      className={`border p-4 mb-4 rounded-lg shadow-sm cursor-pointer transition-all ${
        isSelected ? "bg-blue-100 ring-2 ring-blue-300" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-lg">Question #{index + 1}</span>
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent selecting
            onDelete(index);
          }}
          className="text-red-500 hover:text-red-700 font-bold"
        >
          Delete
        </button>
      </div>

      <input
        type="text"
        placeholder={`Question #${index + 1} Title`}
        value={question.title}
        onChange={(e) => handleChange(index, "title", e.target.value)}
        className="w-full mb-2 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <textarea
        placeholder="Description"
        value={question.description}
        onChange={(e) => handleChange(index, "description", e.target.value)}
        className="w-full mb-2 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <textarea
        placeholder="Extra Notes"
        value={question.notes}
        onChange={(e) => handleChange(index, "notes", e.target.value)}
        className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      {/* Display snapshots */}
      {question.snapshots.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {question.snapshots.map((snap, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 p-1 rounded">
              <img
                src={snap.dataUrl}
                alt={`snapshot-${i}`}
                className="w-48 rounded shadow"
              />
              <div className="flex flex-col text-sm">
                <span>
                  <strong>Emotion:</strong> {snap.emotion} ({(snap.confidence*100).toFixed(1)}%)
                </span>
                <span>
                  <strong>Time:</strong> {snap.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// EmotionDetection + Snapshot Component
function EmotionDetection({ onSnapshot }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const latestDetectionRef = useRef({}); // store last detected emotion

  useEffect(() => {
    loadModels().then(startVideo);
  }, []);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const handleVideoOnPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    faceapi.matchDimensions(canvas, { width: canvas.width, height: canvas.height });

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const resized = faceapi.resizeResults(detections, { width: canvas.width, height: canvas.height });

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      resized.forEach((detection) => {
        const box = detection.detection.box;
        const expressions = detection.expressions;
        const emotion = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );
        const confidence = expressions[emotion];

        // Store latest detection globally
        latestDetectionRef.current = { emotion, confidence };

        const drawBox = new faceapi.draw.DrawBox(box, {
          label: emotion.toUpperCase(),
          boxColor: "lime",
        });
        drawBox.draw(canvas);
      });
    }, 200);
  };

  const handleTakeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const snapshotCanvas = document.createElement("canvas");
    snapshotCanvas.width = video.videoWidth;
    snapshotCanvas.height = video.videoHeight;
    const ctx = snapshotCanvas.getContext("2d");

    ctx.drawImage(video, 0, 0);
    ctx.drawImage(canvas, 0, 0);

    const dataUrl = snapshotCanvas.toDataURL("image/png");

    if (onSnapshot) {
      const now = new Date();
      onSnapshot({
        dataUrl,
        emotion: latestDetectionRef.current.emotion || "N/A",
        confidence: latestDetectionRef.current.confidence || 0,
        time: now.toLocaleTimeString(),
      });
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative inline-block">
        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoOnPlay}
          className="rounded-lg shadow-lg"
          width="640"
          height="480"
        />
        <canvas ref={canvasRef} className="absolute top-0 left-0 rounded-lg" />
      </div>

      {/* Circular snapshot button */}
      <button
        onClick={handleTakeSnapshot}
        className="w-16 h-16 mt-4 rounded-full bg-red-500 hover:bg-red-600 shadow-lg flex justify-center items-center text-white text-2xl"
      >
        📷
      </button>
    </div>
  );
}

// Main Therapist Page
function TherapistPage() {
  const [questions, setQuestions] = useState([
    { title: "", description: "", notes: "", snapshots: [] },
  ]);

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { title: "", description: "", notes: "", snapshots: [] },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
    // Adjust selection
    if (selectedQuestionIndex >= updated.length) {
      setSelectedQuestionIndex(updated.length - 1);
    }
  };

  const handleSnapshot = (snapshotData) => {
    if (selectedQuestionIndex === null) return;

    const updated = [...questions];
    updated[selectedQuestionIndex].snapshots.push(snapshotData);
    setQuestions(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-4 px-6 shadow-md w-full flex items-center gap-4">
        <img src={logo} alt="logo" className="w-12 sm:w-20 h-auto object-contain" />
        <h1 className="text-2xl font-bold">Therapist Dashboard</h1>
      </header>

      {/* Main content: 2-column layout */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Left: Questions (full left side) */}
        <div className="flex-1 overflow-y-auto">
          {questions.map((q, i) => (
            <QuestionSection
              key={i}
              question={q}
              index={i}
              handleChange={handleQuestionChange}
              isSelected={selectedQuestionIndex === i}
              onSelect={(idx) => setSelectedQuestionIndex(idx)}
              onDelete={handleDeleteQuestion}
            />
          ))}
          <button
            onClick={handleAddQuestion}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New Question
          </button>
        </div>

        {/* Right: Livefeed */}
        <div className="flex-1 flex justify-center items-center">
          <EmotionDetection onSnapshot={handleSnapshot} />
        </div>
      </div>
    </div>
  );
}

export default TherapistPage;