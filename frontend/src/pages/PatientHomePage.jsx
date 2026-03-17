import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  LayoutDashboard,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  Download
} from 'lucide-react';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, endOfWeek, isSameMonth, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import eztherapylogo from '../assets/eztherapy transparent.png';
import AQ10Dashboard from '../components/AQ10Dashboard';

// Mock Data
const INITIAL_APPOINTMENTS = [
  {
    id: '1',
    patientId: 'p1',
    patientName: 'Alex Johnson',
    therapistId: 't1',
    therapistName: 'Dr. Sarah Chen',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed',
    type: 'video',
    videoLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: '5',
    patientId: 'p1',
    patientName: 'Alex Johnson',
    therapistId: 't1',
    therapistName: 'Dr. Sarah Chen',
    date: addDays(new Date(), 2).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed',
    type: 'video',
    videoLink: 'https://meet.google.com/session-5'
  },
  {
    id: '8',
    patientId: 'p1',
    patientName: 'Alex Johnson',
    therapistId: 't3',
    therapistName: 'Dr. Emily Watson',
    date: addDays(new Date(), 3).toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:00',
    status: 'confirmed',
    type: 'video',
    videoLink: 'https://meet.google.com/session-8'
  },
  {
    id: '12',
    patientId: 'p1',
    patientName: 'Alex Johnson',
    therapistId: 't1',
    therapistName: 'Dr. Sarah Chen',
    date: addDays(new Date(), 5).toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '17:00',
    status: 'pending',
    type: 'video',
    videoLink: 'https://meet.google.com/session-12'
  },
  {
    id: '16',
    patientId: 'p1',
    patientName: 'Alex Johnson',
    therapistId: 't3',
    therapistName: 'Dr. Emily Watson',
    date: addDays(new Date(), 7).toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '14:00',
    status: 'confirmed',
    type: 'in-person'
  }
];



const RECENT_APPOINTMENTS = [
  { id: 'a1', therapistName: 'Dr. Sarah Chen', avatar: 'https://picsum.photos/seed/sarah/200', timeAgo: '2 days ago', level: 'Senior Therapist', age: 42, education: 'Ph.D. in Clinical Psychology', department: 'Pediatric Psychology', experience: '15 Years' },
  { id: 'a2', therapistName: 'Dr. Michael Chang', avatar: 'https://picsum.photos/seed/michael/200', timeAgo: '1 week ago', level: 'Therapist', age: 35, education: 'M.S. in Counseling', department: 'Behavioral Health', experience: '8 Years' },
  { id: 'a3', therapistName: 'Dr. Emily Watson', avatar: 'https://picsum.photos/seed/emily/200', timeAgo: '2 weeks ago', level: 'Junior Therapist', age: 29, education: 'M.A. in Psychology', department: 'Developmental Therapy', experience: '3 Years' },
  { id: 'a4', therapistName: 'Dr. Robert Davis', avatar: 'https://picsum.photos/seed/robert/200', timeAgo: '1 month ago', level: 'Senior Therapist', age: 50, education: 'Psy.D.', department: 'Clinical Therapy', experience: '22 Years' },
  { id: 'a5', therapistName: 'Dr. Lisa Patel', avatar: 'https://picsum.photos/seed/lisa/200', timeAgo: '1.5 months ago', level: 'Therapist', age: 38, education: 'Ph.D. in Child Psychology', department: 'Pediatric Psychology', experience: '10 Years' }
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Message',
    description: 'You have 1 new message from Dr. Sarah Chen',
    time: '5m ago',
    unread: true,
    type: 'message'
  },
  {
    id: 2,
    title: 'Upcoming Session',
    description: 'Your session with Dr. Michael Chang starts in 30 minutes',
    time: '25m ago',
    unread: true,
    type: 'appointment'
  },
  {
    id: 3,
    title: 'Report Published',
    description: 'Your weekly progress report is now available',
    time: '2h ago',
    unread: false,
    type: 'report'
  }
];

export default function PatientHomePage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  React.useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== "patient") {
      navigate("/login");
    }
  }, [navigate]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingTime, setBookingTime] = useState('10:00');

  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [selectedTherapistProfile, setSelectedTherapistProfile] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [aq10Data, setAq10Data] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileAction, setProfileAction] = useState('view'); // 'view' or 'edit'
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem("username") || 'Patient',
    role: 'Therapy Patient',
    email: `${localStorage.getItem("username") || 'patient'}@example.com`,
    phone: '+1 234 567 890',
    address: '123 Therapy Lane, Wellness City',
    bio: 'Looking for progressive growth and emotional stability.',
    avatar: 'https://picsum.photos/seed/patient/200'
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const selectedDayAppointments = appointments.filter(app => isSameDay(new Date(app.date), selectedDate));

  const handleBook = () => {
    const newApp = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: 'p1',
      patientName: userProfile.name,
      therapistId: 't1',
      therapistName: 'Dr. Sarah Chen',
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: bookingTime,
      endTime: format(new Date(`2000-01-01T${bookingTime}:00`).getTime() + 3600000, 'HH:mm'),
      status: 'confirmed',
      type: 'video',
      videoLink: 'https://meet.google.com/new-meeting'
    };
    setAppointments([...appointments, newApp]);
    setIsBookingModalOpen(false);
  };

  const handleOpenExportModal = async () => {
    setIsExportModalOpen(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/aq10/john_pork');
      if (response.ok) {
        const data = await response.json();
        setAq10Data(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch AQ10 data for export', error);
    }
  };

  const downloadExcel = () => {
    if (!aq10Data.length) return;
    const headers = ['Date', 'AQ10 Score'];
    const rows = aq10Data.map(d => [d.date, d.score]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AQ10_Score_Report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const stats = [
    { label: 'Sessions Done', value: '5', icon: CalendarIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'AQ-10 Quizzes Completed', value: '3', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Behavior Progress', value: '+12%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">

            <img src={eztherapylogo} alt="Logo" className="h-10 w-10 object-contain scale-200 ml-7" />

            <h1 className="text-xl font-bold tracking-tight ml-5">EZTherapy</h1>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'AI chatboard', label: 'AI chatboard', icon: MessageSquare, to: '/patient-chat' },
              { id: 'schedule', label: 'Schedule', icon: CalendarIcon, to: '/patient-calendar' },
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
                    ? "bg-primary text-white shadow-md shadow-primary/10"
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
        {/* Top Header */}
        <header className="h-20 bg-indigo-600 border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 w-96 ml-8">
            <Search size={18} className="text-white/70" />
            <input
              type="text"
              placeholder="Search your sessions..."
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/50"
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
                      className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right"
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
                            <div className="flex gap-3">
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
                        Check all notifications
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setProfileAction('view'); setIsProfileModalOpen(true); }}>
              <div className="text-right">
                <p className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors uppercase">{userProfile.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">{userProfile.role}</p>
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

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Welcome Section */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {userProfile.name}</h2>
              <p className="text-slate-500 mt-1">You have {appointments.length} total sessions tracked.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/aq10-form')}
                className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-2"
              >
                <BrainCircuit size={18} />
                Daily AQ-10 Quiz
              </button>
              <button
                onClick={handleOpenExportModal}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                <Download size={18} />
                Export Report
              </button>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                + New Appointment
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isBookingModalOpen && (
              <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsBookingModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-lg bg-white rounded-4xl overflow-hidden shadow-2xl p-8"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">Book New Session</h3>
                    <button onClick={() => setIsBookingModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                      <LayoutDashboard size={20} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Therapist Info */}
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                      <img src="https://picsum.photos/seed/sarah/200" alt="Sarah Chen" className="size-12 rounded-xl object-cover" />
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Primary Therapist</p>
                        <p className="text-sm font-bold text-slate-900">Dr. Sarah Chen</p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">Session Date</p>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <CalendarIcon size={18} className="text-primary" />
                          <span className="text-sm font-bold">{format(selectedDate, 'MMMM d, yyyy')}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">Session Time</p>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                            <option key={t} value={t}>{t} - {format(new Date(`2000-01-01T${t}:00`).getTime() + 3600000, 'HH:mm')}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleBook}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors mt-4"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {isViewAllModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsViewAllModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-lg bg-white rounded-4xl overflow-hidden shadow-2xl p-8"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">All Recent Appointments</h3>
                    <button onClick={() => setIsViewAllModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                      <LayoutDashboard size={20} className="text-slate-400" />
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {RECENT_APPOINTMENTS.map((apt) => (
                      <div key={apt.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all cursor-pointer">
                        <img
                          src={apt.avatar}
                          alt={apt.therapistName}
                          className="size-12 rounded-xl object-cover border-2 border-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <button onClick={() => { setIsViewAllModalOpen(false); setSelectedTherapistProfile(apt); }} className="text-sm font-bold text-slate-900 hover:text-indigo-600 hover:underline text-left">
                            {apt.therapistName}
                          </button>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{apt.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-500">{apt.timeAgo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {selectedTherapistProfile && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedTherapistProfile(null)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-sm bg-white rounded-4xl overflow-hidden shadow-2xl p-8"
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={selectedTherapistProfile.avatar}
                      alt={selectedTherapistProfile.therapistName}
                      className="size-24 rounded-2xl object-cover border-4 border-slate-100 mb-4 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <h3 className="text-xl font-bold text-slate-900">{selectedTherapistProfile.therapistName}</h3>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-1 mb-4">{selectedTherapistProfile.level}</p>
                    <div className="w-full space-y-3 mt-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Age</p>
                          <p className="text-sm font-medium text-slate-700">{selectedTherapistProfile.age}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Experience</p>
                          <p className="text-sm font-medium text-slate-700">{selectedTherapistProfile.experience}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Education</p>
                        <p className="text-sm font-medium text-slate-700">{selectedTherapistProfile.education}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                        <p className="text-sm font-medium text-slate-700">{selectedTherapistProfile.department}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Last Session</p>
                        <p className="text-sm font-medium text-slate-700">{selectedTherapistProfile.timeAgo}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Contact</p>
                        <button onClick={() => navigate('/messages')} className="text-sm font-bold text-indigo-600 hover:underline">Send Message</button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTherapistProfile(null)} className="mt-6 w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                    Close Profile
                  </button>
                </motion.div>
              </div>
            )}

            {isExportModalOpen && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsExportModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-2xl bg-white rounded-4xl overflow-hidden shadow-2xl p-8"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Export AQ-10 Report</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Review your score tracking data before exporting</p>
                    </div>
                    <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                      <LayoutDashboard size={20} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-2 max-h-[50vh] overflow-y-auto mb-6">
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">AQ-10 Score</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white rounded-xl">
                        {aq10Data.length === 0 ? (
                          <tr><td colSpan="3" className="p-8 text-center text-sm font-semibold text-slate-400">No data available</td></tr>
                        ) : (
                          aq10Data.map((d, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 text-sm font-bold text-slate-700">{format(new Date(d.date), 'MMMM d, yyyy')}</td>
                              <td className="p-3 text-sm font-black text-indigo-600">{d.score} / 10</td>
                              <td className="p-3">
                                {d.score > 6 ? (
                                  <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-md">Elevated</span>
                                ) : (
                                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-md">Normal</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
                    <button onClick={() => setIsExportModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={downloadExcel} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors flex items-center gap-2">
                      <Download size={18} />
                      Download Spreadsheet
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {isProfileModalOpen && (
              <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
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
                    <h3 className="text-2xl font-bold text-slate-900">{profileAction === 'view' ? 'Your Profile' : 'Edit Profile'}</h3>
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Information</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-semibold text-slate-700">{userProfile.email}</p>
                            <p className="text-sm font-semibold text-slate-700">{userProfile.phone}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Address</p>
                          <p className="text-sm font-semibold text-slate-700 mt-1">{userProfile.address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">About Me</p>
                          <p className="text-sm font-medium text-slate-600 italic mt-1 leading-relaxed">"{userProfile.bio}"</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setProfileAction('edit')}
                          className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                        >
                          Edit Profile Details
                        </button>
                        <button
                          onClick={() => setIsProfileModalOpen(false)}
                          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                        >
                          Close View
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                        <input
                          type="text"
                          defaultValue={userProfile.name}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
                        <input
                          type="email"
                          defaultValue={userProfile.email}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                        <input
                          type="text"
                          defaultValue={userProfile.phone}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Personal Bio</label>
                        <textarea
                          rows="3"
                          defaultValue={userProfile.bio}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-4 mt-8">
                        <button
                          type="button"
                          onClick={() => setProfileAction('view')}
                          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                        >
                          Discard Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Update logic would go here
                            setProfileAction('view');
                          }}
                          className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                        >
                          Save Profile
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              </div>
            )}

            {isLogoutModalOpen && (
              <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
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
                  <p className="text-slate-500 font-medium mb-8">Are you sure you want to <span className="text-rose-600 font-black">Logout</span>?</p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsLogoutModalOpen(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("username");
                        localStorage.removeItem("role");
                        navigate("/login");
                      }}
                      className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Grid: Calendar & Patients */}
          <div className="grid grid-cols-12 gap-8">
            {/* Calendar Section */}
            <div className="col-span-8 space-y-6">
              <AQ10Dashboard username="john_pork" />

              <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Appointment Calendar</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="text-sm font-bold min-w-30 text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 border-t border-l border-slate-100">
                    {calendarDays.map((day, idx) => {
                      const dayApps = appointments.filter(app => isSameDay(new Date(app.date), day));
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrentMonth = isSameMonth(day, monthStart);
                      const isToday = isSameDay(day, new Date());

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "h-24 border-r border-b border-slate-100 p-2 transition-all text-left flex flex-col gap-1",
                            !isCurrentMonth && "bg-slate-50/50 text-slate-300",
                            isSelected && "bg-primary/5 ring-2 ring-inset ring-primary/20",
                            isCurrentMonth && "hover:bg-slate-50"
                          )}
                        >
                          <span className={cn(
                            "text-xs font-bold size-6 flex items-center justify-center rounded-lg",
                            isToday && !isSelected && "bg-primary text-white",
                            isSelected && "bg-primary text-white"
                          )}>
                            {format(day, 'd')}
                          </span>
                          <div className="space-y-1">
                            {dayApps.slice(0, 2).map((app) => (
                              <div
                                key={app.id}
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded truncate",
                                  app.status === 'confirmed' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                                )}
                              >
                                {app.startTime} - {app.therapistName}
                              </div>
                            ))}
                            {dayApps.length > 2 && (
                              <div className="text-[9px] font-bold text-slate-400 pl-1">
                                +{dayApps.length - 2} more
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Day Agenda */}
              <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">
                    Agenda for {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {selectedDayAppointments.length} Appointments
                  </span>
                </div>

                <div className="space-y-4">
                  {selectedDayAppointments.length > 0 ? (
                    selectedDayAppointments.map((app) => (
                      <div key={app.id} className="flex items-center gap-6 p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all group">
                        <div className="w-20 text-center">
                          <p className="text-sm font-bold text-slate-900">{app.startTime}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{app.endTime}</p>
                        </div>
                        <div className="h-10 w-px bg-slate-100" />
                        <div className="flex-1 flex items-center gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{app.therapistName}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                {app.type === 'video' ? <Video size={12} className="text-primary" /> : <MapPin size={12} />}
                                {app.type}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                <CheckCircle2 size={12} />
                                {app.status}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                          View Details
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      <Clock size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">No appointments for this day</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Patients & Activity Sidebar */}
            <div className="col-span-4 space-y-8">
              {/* Recent Appointments */}
              <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Recent Appointments</h3>
                  <button onClick={() => setIsViewAllModalOpen(true)} className="text-xs font-bold text-primary hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {RECENT_APPOINTMENTS.slice(0, 4).map((apt) => (
                    <div key={apt.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer">
                      <img
                        src={apt.avatar}
                        alt={apt.therapistName}
                        className="size-12 rounded-xl object-cover border-2 border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <button onClick={() => setSelectedTherapistProfile(apt)} className="text-sm font-bold text-slate-900 hover:text-indigo-600 hover:underline text-left">
                          {apt.therapistName}
                        </button>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{apt.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-500">{apt.timeAgo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
                <div className="space-y-6">
                  {[
                    { type: 'message', text: 'Dr. Sarah Chen sent a new message', time: '10m ago' },
                    { type: 'report', text: 'Daily assessment completed', time: '1h ago' },
                    { type: 'session', text: 'Upcoming session today at 10:00 AM', time: '3h ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="relative">
                        <div className="size-2 rounded-full bg-primary mt-1.5" />
                        {i !== 2 && <div className="absolute top-4 left-[3.5px] w-px h-10 bg-slate-100" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{activity.text}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}