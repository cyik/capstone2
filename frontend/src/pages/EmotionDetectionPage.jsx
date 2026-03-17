import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { 
  Calendar as CalendarIcon, 
  Users, 
  MessageSquare, 
  LayoutDashboard, 
  Search, 
  Bell, 
  LogOut,
  ScanFace,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import eztherapylogo from '../assets/eztherapy transparent.png';
import { MOCK_PATIENTS } from '../lib/mockData';
import { CheckCircle2, ChevronDown } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Patient Message',
    description: 'John Pork sent a new message regarding today\'s session',
    time: '2m ago',
    unread: true,
    type: 'message'
  },
  {
    id: 2,
    title: 'New Assessment',
    description: 'Alex Johnson has completed their weekly assessment',
    time: '12m ago',
    unread: true,
    type: 'report'
  },
  {
    id: 3,
    title: 'Meeting Alert',
    description: 'Case review starting in 15 minutes with clinical staff',
    time: '45m ago',
    unread: false,
    type: 'appointment'
  }
];

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
      className={cn(
        "p-6 mb-4 rounded-3xl border transition-all cursor-pointer",
        isSelected 
          ? "bg-indigo-50 border-indigo-200 shadow-sm" 
          : "bg-white border-slate-100 hover:border-slate-200"
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Note #{index + 1}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          className="text-rose-500 hover:text-rose-700 text-xs font-bold uppercase tracking-wider"
        >
          Delete
        </button>
      </div>

      <textarea
        placeholder="Subjective"
        value={question.subjective}
        onChange={(e) => handleChange(index, "subjective", e.target.value)}
        className="w-full mb-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 h-20 resize-none"
      />
      <textarea
        placeholder="Objective"
        value={question.objective}
        onChange={(e) => handleChange(index, "objective", e.target.value)}
        className="w-full mb-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 h-20 resize-none"
      />
      <textarea
        placeholder="Assessment"
        value={question.assessment}
        onChange={(e) => handleChange(index, "assessment", e.target.value)}
        className="w-full mb-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 h-20 resize-none"
      />
      <textarea
        placeholder="Plan"
        value={question.plan}
        onChange={(e) => handleChange(index, "plan", e.target.value)}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 h-20 resize-none"
      />

      {/* Display snapshots */}
      {question.snapshots.length > 0 && (
        <div className="flex flex-col gap-3 mt-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected Snapshots</p>
          {question.snapshots.map((snap, i) => (
            <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-50 shadow-sm">
              <img
                src={snap.dataUrl}
                alt={`snapshot-${i}`}
                className="w-32 h-20 object-cover rounded-xl"
              />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 capitalize">{snap.emotion}</span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{(snap.confidence*100).toFixed(0)}%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Captured at {snap.time}
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
  const latestDetectionRef = useRef({});

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
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const handleVideoOnPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    faceapi.matchDimensions(canvas, { width: canvas.width, height: canvas.height });

    const intervalId = setInterval(async () => {
      if (!videoRef.current) return;
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

        latestDetectionRef.current = { emotion, confidence };

        const drawBox = new faceapi.draw.DrawBox(box, {
          label: emotion.toUpperCase(),
          boxColor: "lime",
        });
        drawBox.draw(canvas);
      });
    }, 200);

    return () => clearInterval(intervalId);
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
export default function TherapistPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    { subjective: "", objective: "", assessment: "", plan: "", snapshots: [] },
  ]);
  const [activeTab, setActiveTab] = useState('behaviordetection');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success
  const [patients, setPatients] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileAction, setProfileAction] = useState('view'); // 'view' or 'edit'
  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem("username") || 'Therapist',
    role: 'Senior Therapist',
    email: `${localStorage.getItem("username") || 'therapist'}@eztherapy.com`,
    phone: '+1 987 654 321',
    address: '456 Wellness Blvd, Health District',
    bio: 'Dedicated clinical psychologist with 15+ years of experience specializing in pediatric care and autism spectrum support.',
    avatar: 'https://picsum.photos/seed/therapist/200'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/db-patients');
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error(error);
    }
  };

  const selectedPatient = patients.find(p => String(p.id) === String(selectedPatientId));

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { subjective: "", objective: "", assessment: "", plan: "", snapshots: [] },
    ]);
    setSelectedQuestionIndex(questions.length);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length === 1) return;
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
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

  const handleSaveSession = async () => {
    if (!selectedPatientId) {
      alert("Please select a patient first.");
      return;
    }

    setSaveStatus('saving');
    
    try {
      const payload = {
        patient_username: selectedPatient.name.toLowerCase().replace(' ', ''), // Using name as username for mock matching
        therapist_username: userProfile.name.toLowerCase(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        data: JSON.stringify(questions)
      };

      const response = await fetch('http://127.0.0.1:8000/api/clinical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to save session");
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      alert("Error saving session to backend.");
      setSaveStatus('idle');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Consistent with other pages */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src={eztherapylogo} alt="Logo" className="h-10 w-10 object-contain scale-200 ml-7" />
            <h1 className="text-xl font-bold tracking-tight ml-5">EZTherapy</h1>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/therapist-home' },
              { id: 'behaviordetection', label: 'Behavior Detection', icon: ScanFace, to: '/therapist' },
              { id: 'patients', label: 'Patients', icon: Users, to: '/therapist-patientpages' },
              { id: 'schedule', label: 'Schedule', icon: CalendarIcon, to: '/calendar' },
              { id: 'messages', label: 'Messages', icon: MessageSquare, to: '/messages' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.to) navigate(item.to);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                  activeTab === item.id 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Consistent Theme */}
        <header className="h-20 bg-indigo-600 border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 w-96 text-white">
            <Search size={18} className="text-white/70" />
            <input 
              type="text" 
              placeholder="Search session files..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-white/50 text-white"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "relative p-2 rounded-xl transition-all duration-300",
                  isNotificationsOpen ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
                )}
              >
                <Bell size={22} />
                <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-indigo-600" />
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right text-slate-900"
                    >
                      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full tracking-wider">
                          {MOCK_NOTIFICATIONS.filter(n => n.unread).length} New
                        </span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {MOCK_NOTIFICATIONS.map((notif) => (
                          <div 
                            key={notif.id}
                            className={cn(
                              "p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0",
                              notif.unread && "bg-indigo-50/20"
                            )}
                          >
                            <div className="flex gap-3 text-left">
                              <div className={cn(
                                "size-10 rounded-xl flex items-center justify-center shrink-0",
                                notif.type === 'message' ? "bg-emerald-50 text-emerald-600" :
                                notif.type === 'appointment' ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {notif.type === 'message' ? <MessageSquare size={18} /> :
                                 notif.type === 'appointment' ? <CalendarIcon size={18} /> : <AlertCircle size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{notif.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.description}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-wider">{notif.time}</p>
                              </div>
                              {notif.unread && (
                                <div className="mt-1 size-1.5 bg-indigo-500 rounded-full shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        className="w-full p-4 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-slate-50"
                        onClick={() => setIsNotificationsOpen(false)}
                      >
                        Mark all as read
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="h-8 w-px bg-white/20" />
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => { setProfileAction('view'); setIsProfileModalOpen(true); }}
            >
              <div className="text-right text-white">
                <p className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors uppercase">{userProfile.name}</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">{userProfile.role}</p>
              </div>
              <img 
                src={userProfile.avatar} 
                alt="Profile" 
                className="size-10 rounded-xl object-cover border-2 border-white shadow-sm ring-0 group-hover:ring-2 group-hover:ring-white transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 flex overflow-hidden">
            {/* Left Column: Questions & Notes */}
            <div className="w-[450px] border-r border-slate-200 flex flex-col bg-slate-50/50">
                <div className="p-8 border-b border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Session Analysis</h2>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Record observations for the current session.</p>
                        </div>
                    </div>

                    {/* Patient Selector Dropdown */}
                    <div className="relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Patient Context</label>
                        <button 
                            onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                {selectedPatient ? (
                                    <>
                                        <img src={selectedPatient.avatar} className="size-6 rounded-full" alt="" />
                                        <span>{selectedPatient.name}</span>
                                    </>
                                ) : (
                                    <span className="text-slate-400">Select Patient Profile...</span>
                                )}
                            </div>
                            <ChevronDown size={18} className={cn("text-slate-400 transition-transform", isPatientDropdownOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {isPatientDropdownOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                                >
                                    {patients.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedPatientId(p.id);
                                                setIsPatientDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-left text-sm font-bold transition-all"
                                        >
                                            <img src={p.avatar} className="size-8 rounded-full" alt="" />
                                            <div>
                                                <p className="text-slate-900">{p.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.severity}</p>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-3xl text-sm font-bold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Add Observation Point
                    </button>

                    <div className="pt-4">
                        <button
                            onClick={handleSaveSession}
                            disabled={saveStatus !== 'idle'}
                            className={cn(
                                "w-full py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-2",
                                saveStatus === 'success' 
                                    ? "bg-emerald-500 text-white shadow-emerald-200" 
                                    : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                            )}
                        >
                            {saveStatus === 'saving' ? (
                                <>
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving Session...
                                </>
                            ) : saveStatus === 'success' ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    Session Stored
                                </>
                            ) : (
                                "Persist Session Records"
                            )}
                        </button>
                        {saveStatus === 'success' && (
                            <p className="text-[10px] text-emerald-600 font-black text-center mt-3 uppercase tracking-widest animate-pulse">Records synchronized to patient profile</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            <AnimatePresence>
                {isProfileModalOpen && (
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                        <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsProfileModalOpen(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-md bg-white rounded-4xl overflow-hidden shadow-2xl p-8"
                        >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900">{profileAction === 'view' ? 'Staff Profile' : 'Edit Staff Details'}</h3>
                            <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                            <LayoutDashboard size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {profileAction === 'view' ? (
                            <div className="space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <img 
                                src={userProfile.avatar} 
                                alt={userProfile.name} 
                                className="size-24 rounded-3xl object-cover border-4 border-slate-50 shadow-lg mb-4"
                                />
                                <h4 className="text-xl font-bold text-slate-900">{userProfile.name}</h4>
                                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{userProfile.role}</p>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                                <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Contact</p>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm font-semibold text-slate-700">{userProfile.email}</p>
                                    <p className="text-sm font-semibold text-slate-700">{userProfile.phone}</p>
                                </div>
                                </div>
                                <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Office Location</p>
                                <p className="text-sm font-semibold text-slate-700 mt-1">{userProfile.address}</p>
                                </div>
                                <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professional Bio</p>
                                <p className="text-sm font-medium text-slate-600 italic mt-1 leading-relaxed">"{userProfile.bio}"</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                onClick={() => setProfileAction('edit')}
                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                >
                                Update Profile
                                </button>
                                <button 
                                onClick={() => setIsProfileModalOpen(false)}
                                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                Close
                                </button>
                            </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                                <input 
                                type="text" 
                                value={userProfile.name}
                                onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
                                <input 
                                type="email" 
                                value={userProfile.email}
                                onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none"
                                />
                            </div>
                            <button 
                                onClick={() => setProfileAction('view')}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4"
                            >
                                Save Changes
                            </button>
                            </div>
                        )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Right Column: Dynamic Feed */}
            <div className="flex-1 overflow-y-auto p-12 bg-white flex flex-col items-center">
                <div className="max-w-4xl w-full text-center mb-12">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Behavior Feed</h2>
                    <p className="text-slate-500 mt-3 font-medium text-lg">AI-powered facial recognition for real-time emotional diagnostics.</p>
                </div>
                
                <EmotionDetection onSnapshot={handleSnapshot} />
            </div>
        </div>

        {/* Logout Modal */}
        <AnimatePresence>
          {isLogoutModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLogoutModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-sm bg-white rounded-4xl overflow-hidden shadow-2xl p-8 text-center"
              >
                <div className="size-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                  <LogOut size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Logout</h3>
                <p className="text-slate-500 font-medium mb-8">Ready to end your session?</p>
                <div className="flex gap-4">
                  <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
