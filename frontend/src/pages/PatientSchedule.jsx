import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  MessageSquare,
  LayoutDashboard,
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
  Plus,
  ChevronDown,
  X,
  BrainCircuit,
  TrendingUp,
  Download
} from 'lucide-react';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, endOfWeek, isSameMonth, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import eztherapylogo from '../assets/eztherapy transparent.png';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Therapist Message',
    description: 'Dr. Sarah Chen sent a new message regarding your progress',
    time: '2m ago',
    unread: true,
    type: 'message'
  },
  {
    id: 2,
    title: 'New Goal Set',
    description: 'A new clinical goal has been added to your profile',
    time: '1h ago',
    unread: true,
    type: 'report'
  },
  {
    id: 3,
    title: 'Session Reminder',
    description: 'Your session with Dr. Sarah starts in 15 minutes',
    time: '45m ago',
    unread: false,
    type: 'appointment'
  }
];

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
    therapistId: 't1',
    therapistName: 'Dr. Sarah Chen',
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
    therapistId: 't1',
    therapistName: 'Dr. Sarah Chen',
    date: addDays(new Date(), 7).toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '14:00',
    status: 'confirmed',
    type: 'in-person'
  }
];

export default function PatientSchedule() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState('schedule');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileAction, setProfileAction] = useState('view');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [bookingTime, setBookingTime] = useState('10:00');

  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem("username") || 'Patient',
    role: 'Patient',
    email: `${localStorage.getItem("username") || 'patient'}@gmail.com`,
    phone: '+1 123 456 789',
    address: '123 Home Street, City',
    bio: 'Patient record for EZTherapy monitoring.',
    avatar: 'https://picsum.photos/seed/patient/200'
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role !== "patient") {
      navigate("/login");
    }
  }, [navigate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

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

  const selectedDayAppointments = appointments.filter(app => isSameDay(new Date(app.date), selectedDate));

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Consistent with Patient Home */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img src={eztherapylogo} alt="Logo" className="h-10 w-10 object-contain scale-200 ml-7" />
            <h1 className="text-xl font-bold tracking-tight ml-5">EZTherapy</h1>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/patient-home' },
              { id: 'AI chatboard', label: 'AI chatboard', icon: MessageSquare, to: '/patient-chat' },
              { id: 'schedule', label: 'My Schedule', icon: CalendarIcon, to: '/patient-calendar' },
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
                  activeTab === item.id || (item.to === '/patient-calendar' && activeTab === 'schedule')
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
        {/* Header - Consistent with Home (Indigo) */}
        <header className="h-20 bg-indigo-600 border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 w-96">
            <Search size={18} className="text-white/70" />
            <input
              type="text"
              placeholder="Search sessions..."
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
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setProfileAction('view'); setIsProfileModalOpen(true); }}>
              <div className="text-right">
                <p className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors uppercase">{userProfile.name}</p>
                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">{userProfile.role}</p>
              </div>
              <img
                src={userProfile.avatar}
                alt="Profile"
                className="size-10 rounded-xl object-cover border-2 border-white shadow-sm transition-all group-hover:ring-2 group-hover:ring-white"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Your Session Calendar</h2>
              <p className="text-slate-500 mt-1">Manage and track your upcoming therapy sessions.</p>
            </div>
            <button
               onClick={() => setIsBookingModalOpen(true)}
               className="px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              New Appointment
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Full sized Calendar - taking 8 columns */}
            <div className="col-span-8 bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">My Appointments</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-bold min-w-[120px] text-center">
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

              <div className="p-6 flex-1">
                <div className="grid grid-cols-7 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
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
                          "h-32 border-r border-b border-slate-100 p-3 transition-all text-left flex flex-col gap-2",
                          !isCurrentMonth && "bg-slate-50/30 text-slate-300",
                          isSelected && "bg-primary/5 ring-2 ring-inset ring-primary/20",
                          isCurrentMonth && "hover:bg-slate-50"
                        )}
                      >
                        <span className={cn(
                          "text-xs font-bold size-7 flex items-center justify-center rounded-lg",
                          isToday && !isSelected && "bg-primary text-white shadow-sm",
                          isSelected && "bg-primary text-white shadow-md shadow-primary/20"
                        )}>
                          {format(day, 'd')}
                        </span>
                        <div className="space-y-1 overflow-y-auto custom-scrollbar">
                          {dayApps.map((app) => (
                            <div
                              key={app.id}
                              className={cn(
                                "text-[9px] font-bold px-2 py-1 rounded shadow-sm truncate",
                                app.status === 'confirmed' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-600 border border-slate-100"
                              )}
                            >
                              {app.startTime} - Dr. Sarah Chen
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Agenda View - taking 4 columns */}
            <div className="col-span-4 space-y-6">
              <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Session Agenda</h3>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                    {format(selectedDate, 'MMM d')}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedDayAppointments.length > 0 ? (
                    selectedDayAppointments.map((app) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={app.id}
                        className="p-4 rounded-3xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                           <div className="text-center min-w-[60px]">
                              <p className="text-sm font-black text-slate-900">{app.startTime}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{app.endTime}</p>
                           </div>
                           <div className="h-10 w-px bg-slate-100" />
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{app.therapistName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {app.type === 'video' ? <Video size={12} className="text-primary" /> : <MapPin size={12} className="text-slate-400" />}
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{app.type}</span>
                              </div>
                           </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
                           <div className={cn(
                             "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase",
                             app.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                           )}>
                              {app.status === 'confirmed' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                              {app.status}
                           </div>
                           {app.type === 'video' && app.status === 'confirmed' && (
                             <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Join Meeting</button>
                           )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center">
                      <div className="size-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                        <Clock size={32} className="text-slate-200" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 italic">No sessions for this day.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Widget */}
              <div className="bg-indigo-600 rounded-4xl p-6 text-white shadow-xl shadow-indigo-200">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="size-12 bg-white/20 rounded-2xl flex items-center justify-center">
                       <TrendingUp size={24} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Your Progress</p>
                       <p className="text-xl font-bold">{appointments.length} Total Sessions</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">Prepare for Session</button>
                    <button className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-400 transition-all border border-indigo-400">Download Summary</button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
            {isBookingModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBookingModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-4xl overflow-hidden shadow-2xl p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">Book New Session</h3>
                    <button onClick={() => setIsBookingModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                  </div>
                  <div className="space-y-8">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                        <img src="https://picsum.photos/seed/sarah/200" alt="Sarah Chen" className="size-12 rounded-xl object-cover" />
                        <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Primary Therapist</p>
                            <p className="text-sm font-bold text-slate-900">Dr. Sarah Chen</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Session Date</p>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3"><CalendarIcon size={18} className="text-primary" /><span className="text-sm font-bold">{format(selectedDate, 'MMMM d, yyyy')}</span></div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Session Time</p>
                        <div className="relative">
                           <select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                             {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                               <option key={t} value={t}>{t} - {format(new Date(`2000-01-01T${t}:00`).getTime() + 3600000, 'HH:mm')}</option>
                             ))}
                           </select>
                           <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <button onClick={handleBook} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all mt-4 transform active:scale-95">Confirm Booking</button>
                  </div>
                </motion.div>
              </div>
            )}

            {isLogoutModalOpen && (
              <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogoutModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-4xl overflow-hidden shadow-2xl p-8 text-center" >
                  <div className="size-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500"><LogOut size={40} /></div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Logout</h3>
                  <p className="text-slate-500 font-medium mb-8">Are you sure you want to exit your portal?</p>
                  <div className="flex gap-4">
                    <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-2">Logout</button>
                  </div>
                </motion.div>
              </div>
            )}
        </AnimatePresence>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
