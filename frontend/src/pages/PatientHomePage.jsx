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
  TrendingUp
} from 'lucide-react';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, endOfWeek, isSameMonth, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import eztherapylogo from '../assets/eztherapy transparent.png';

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
    id: '2',
    patientId: 'p2',
    patientName: 'Mia Jones',
    therapistId: 't1',
    therapistName: 'Dr. Sarah Chen',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '14:00',
    status: 'confirmed',
    type: 'in-person'
  },
  {
    id: '3',
    patientId: 'p3',
    patientName: 'Noah Williams',
    therapistId: 't1',
    therapistName: 'Dr. Sarah Chen',
    date: addDays(new Date(), 1).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    type: 'video',
    videoLink: 'https://meet.google.com/noah-session'
  },
  {
    id: '4',
    patientId: 'p3',
    patientName: 'Emma Williams',
    therapistId: 't1',
    therapistName: 'Dr. Sarah Chen',
    date: addDays(new Date(), 1).toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '14:00',
    status: 'confirmed',
    type: 'video',
    videoLink: 'https://meet.google.com/noah-session'
  }
  
];

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Alex Johnson', age: 8, status: 'Stable & Calm', lastActive: '2h ago', avatar: 'https://picsum.photos/seed/p1/200' },
  { id: 'p2', name: 'Mia Jones', age: 6, status: 'Needs Attention', lastActive: '5m ago', avatar: 'https://picsum.photos/seed/p2/200' },
  { id: 'p3', name: 'Noah Williams', age: 10, status: 'Stable & Calm', lastActive: '1d ago', avatar: 'https://picsum.photos/seed/p3/200' },
  { id: 'p4', name: 'Emma Davis', age: 7, status: 'Warning: Declining Trend', lastActive: '1h ago', avatar: 'https://picsum.photos/seed/p4/200' },
];

export default function TherapistHomePage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingTime, setBookingTime] = useState('10:00');
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);

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
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
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

  const stats = [
    { label: 'Sessions Today', value: '8', icon: CalendarIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Reports', value: '3', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg. Progress', value: '+12%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-indigo-600 border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 w-96">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients, appointments..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-white">John Pork</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Therapy Patient</p>
              </div>
              <img 
                src="https://picsum.photos/seed/sarah/200" 
                alt="Profile" 
                className="size-10 rounded-xl object-cover border-2 border-white shadow-sm"
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
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, John</h2>
              <p className="text-slate-500 mt-1">You have 8 appointments scheduled for today.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
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
                    {/* Patient Selection */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">Select Patient</p>
                      <div className="grid grid-cols-4 gap-4">
                        {MOCK_PATIENTS.map(patient => (
                          <button
                            key={patient.id}
                            onClick={() => setSelectedPatient(patient)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                              selectedPatient.id === patient.id ? "border-primary bg-primary/5" : "border-slate-100 bg-white"
                            )}
                          >
                            <img 
                              src={patient.avatar} 
                              alt={patient.name} 
                              className="size-12 rounded-xl object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className={cn(
                              "text-[10px] font-bold text-center truncate w-full",
                              selectedPatient.id === patient.id ? "text-primary" : "text-slate-600"
                            )}>
                              {patient.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
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
                                {app.startTime} {app.patientName}
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
                          <img 
                            src={`https://picsum.photos/seed/${app.patientId}/200`} 
                            alt={app.patientName} 
                            className="size-10 rounded-xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{app.patientName}</p>
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
              {/* Patient List */}
              <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Recent Patients</h3>
                  <button onClick={() => navigate('/admin')} className="text-xs font-bold text-primary hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  {MOCK_PATIENTS.map((patient) => (
                    <div key={patient.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer">
                      <img 
                        src={patient.avatar} 
                        alt={patient.name} 
                        className="size-12 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{patient.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{patient.age} years • {patient.lastActive}</p>
                      </div>
                      <div className={cn(
                        "size-2 rounded-full",
                        patient.status === 'Needs Attention' ? "bg-rose-500" : 
                        patient.status === 'Warning: Declining Trend' ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-4xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
                <div className="space-y-6">
                  {[
                    { type: 'message', text: 'New message from Alex\'s guardian', time: '10m ago' },
                    { type: 'report', text: 'Daily report submitted for Mia', time: '1h ago' },
                    { type: 'session', text: 'Session with Noah completed', time: '3h ago' },
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