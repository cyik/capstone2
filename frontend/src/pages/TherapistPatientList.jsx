import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  LayoutDashboard, 
  Search, 
  Bell, 
  LogOut,
  ScanFace,
  Calendar as CalendarIcon,
  Plus,
  MoreVertical,
  Filter,
  FileText,
  X,
  Trash2,
  ChevronRight,
  Clock,
  Calendar,
  Edit2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import eztherapylogo from '../assets/eztherapy transparent.png';
import { MOCK_PATIENTS } from '../lib/mockData';
import { AnimatePresence, motion } from 'motion/react';

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

export default function TherapistPatientList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedPatientForRecords, setSelectedPatientForRecords] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', severity: 'Level 1' });
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, type: null, id: null, title: '' });
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

  React.useEffect(() => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterPatient = async () => {
    if (!newPatient.name || !newPatient.age) return;
    
    try {
      const payload = {
        ...newPatient,
        age: parseInt(newPatient.age),
        status: 'Stable & Calm',
        avatar: `https://picsum.photos/seed/${Date.now()}/200`,
        lastActive: 'Just now'
      };

      const response = await fetch('http://127.0.0.1:8000/api/db-patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to register patient");
      
      const createdPatient = await response.json();
      setPatients([...patients, createdPatient]);
      setIsRegisterModalOpen(false);
      setNewPatient({ name: '', age: '', severity: 'Level 1' });
    } catch (error) {
      console.error(error);
      alert("Error registering patient.");
    }
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient.name || !editingPatient.age) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/db-patients/${editingPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPatient)
      });

      if (!response.ok) throw new Error("Failed to update patient");

      const updated = await response.json();
      setPatients(patients.map(p => p.id === updated.id ? updated : p));
      setIsEditModalOpen(false);
      setEditingPatient(null);
    } catch (error) {
      console.error(error);
      alert("Error updating patient.");
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/db-patients/${patientId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Failed to delete patient");

      setPatients(patients.filter(p => p.id !== patientId));
      setDeleteConfirmation({ isOpen: false, type: null, id: null, title: '' });
      setActiveMenuId(null);
    } catch (error) {
      console.error(error);
      alert("Error deleting patient.");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewRecords = async (patient) => {
    try {
      const username = patient.name.toLowerCase().replace(' ', '');
      const response = await fetch(`http://127.0.0.1:8000/api/clinical-records/${username}`);
      if (!response.ok) throw new Error("Failed to fetch records");
      const data = await response.json();
      
      // Parse the JSON data string back into notes array
      const formattedRecords = data.map(r => ({
        ...r,
        notes: JSON.parse(r.data)
      }));
      
      setPatientRecords(formattedRecords);
      setSelectedPatientForRecords(patient);
    } catch (error) {
      console.error(error);
      alert("Error fetching records from backend.");
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/clinical-records/${recordId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error("Failed to delete record");
      
      const updatedRecords = patientRecords.filter(r => r.id !== recordId);
      setPatientRecords(updatedRecords);
      setDeleteConfirmation({ isOpen: false, type: null, id: null, title: '' });
    } catch (error) {
      console.error(error);
      alert("Error deleting record.");
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Same as TherapistHomePage */}
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
                  activeTab === item.id || item.to === '/therapist-patientpages'
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
        {/* Top Header - Indigo color like TherapistHomePage */}
        <header className="h-20 bg-indigo-600 border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 w-96">
            <Search size={18} className="text-white/70" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => { setProfileAction('view'); setIsProfileModalOpen(true); }}
            >
              <div className="text-right">
                <p className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors uppercase">{userProfile.name}</p>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">{userProfile.role}</p>
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Patients Directory</h2>
              <p className="text-slate-500 mt-1">Manage and monitor your clinical caseload ({filteredPatients.length} active patients).</p>
            </div>
            
            {/* Requested Top Right Button */}
            <button 
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Register New Patient
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center gap-4 mb-8">
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all">
              <Filter size={14} />
              Filter by Status
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Filters:</span>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg">ALL PATIENTS</span>
          </div>

          {/* Patients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPatients.map(patient => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={patient.id} 
                className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative flex flex-col"
              >
                <div className="p-8 flex flex-col items-center flex-1">
                  <div className="relative mb-6">
                    <img 
                      src={patient.avatar} 
                      alt={patient.name} 
                      className="size-24 rounded-3xl object-cover border-4 border-slate-50 shadow-lg group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className={cn(
                        "absolute -bottom-2 -right-2 size-6 rounded-full border-4 border-white shadow-sm",
                        patient.status === 'Needs Attention' ? "bg-rose-500" : 
                        patient.status === 'Warning: Declining Trend' ? "bg-amber-500" : "bg-emerald-500"
                      )} 
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 text-center mb-1">{patient.name}</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-6">{patient.age} Years Old</p>
                  
                  <div className="w-full space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis</span>
                        <span className="text-xs font-bold text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-lg">{patient.severity}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                        <span className={cn(
                            "text-xs font-bold px-2.5 py-1 rounded-lg",
                            patient.status === 'Needs Attention' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        )}>{patient.status}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                  <button 
                    onClick={() => handleViewRecords(patient)}
                    className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all uppercase tracking-widest"
                  >
                    View Records
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === patient.id ? null : patient.id)}
                      className={cn(
                        "size-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm",
                        activeMenuId === patient.id && "bg-slate-50 border-indigo-200 text-indigo-600"
                      )}
                    >
                      <MoreVertical size={20} />
                    </button>

                    <AnimatePresence>
                      {activeMenuId === patient.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-14 right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden p-2"
                          >
                            <button 
                              onClick={() => {
                                setEditingPatient({...patient});
                                setIsEditModalOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"
                            >
                              <Edit2 size={16} /> Edit Profile
                            </button>
                            <div className="h-px bg-slate-50 my-1" />
                            <button 
                              onClick={() => setDeleteConfirmation({
                                isOpen: true,
                                type: 'patient',
                                id: patient.id,
                                title: `Delete ${patient.name}'s Profile?`
                              })}
                              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 size={16} /> Delete Patient
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Records Modal */}
        <AnimatePresence>
          {selectedPatientForRecords && (
            <div className="fixed inset-0 z-[150] flex items-center justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPatientForRecords(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col"
              >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                  <div className="flex items-center gap-4">
                    <img src={selectedPatientForRecords.avatar} className="size-16 rounded-2xl border-2 border-white/20 object-cover" alt="" />
                    <div>
                      <h3 className="text-2xl font-bold">{selectedPatientForRecords.name}</h3>
                      <p className="text-indigo-100 text-sm font-medium uppercase tracking-widest">Clinical History • {patientRecords.length} Session(s)</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPatientForRecords(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                  {patientRecords.length > 0 ? (
                    patientRecords.map((record) => (
                      <div key={record.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div 
                          onClick={() => setExpandedRecordId(expandedRecordId === record.id ? null : record.id)}
                          className="p-6 flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-6">
                            <div className="size-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <FileText size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-slate-900">Behavioral Session Record</h4>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">SOAP</span>
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 capitalize"><Calendar size={12}/> {record.date}</span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 capitalize"><Clock size={12}/> {record.time}</span>
                                </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setDeleteConfirmation({
                                    isOpen: true,
                                    type: 'record',
                                    id: record.id,
                                    title: 'Delete Session Record?'
                                  });
                                }}
                                className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                              <ChevronRight size={20} className={cn("text-slate-300 transition-transform duration-300", expandedRecordId === record.id && "rotate-90")} />
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedRecordId === record.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-50 bg-slate-50/30"
                            >
                              <div className="p-8 space-y-8">
                                {record.notes.map((note, idx) => (
                                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Observation #{idx + 1}</h5>
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        {[
                                            { label: 'Subjective', val: note.subjective, color: 'indigo' },
                                            { label: 'Objective', val: note.objective, color: 'blue' },
                                            { label: 'Assessment', val: note.assessment, color: 'emerald' },
                                            { label: 'Plan', val: note.plan, color: 'amber' }
                                        ].map((item) => (
                                            <div key={item.label}>
                                                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm inline-block px-2 py-0.5 rounded", `bg-${item.color}-50 text-${item.color}-600`)}>{item.label[0]}</p>
                                                <p className="text-sm font-medium text-slate-600 pl-2 border-l-2 border-slate-100">{item.val || 'No data recorded.'}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {note.snapshots?.length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-slate-50">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Facial Analytics Snapshots</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {note.snapshots.map((snap, i) => (
                                                    <div key={i} className="group/snap relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm aspect-video">
                                                        <img src={snap.dataUrl} className="w-full h-full object-cover group-hover/snap:scale-110 transition-transform duration-700" alt="" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{snap.emotion}</span>
                                                                <span className="text-[10px] font-black text-white bg-indigo-600 px-1.5 py-0.5 rounded">{(snap.confidence*100).toFixed(0)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-[40px] border border-dashed border-slate-200">
                      <FileText size={48} className="opacity-10 mb-4" />
                      <p className="font-bold">No Records Found</p>
                      <p className="text-xs">Complete a behavior session to generate records.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditModalOpen && editingPatient && (
            <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-white rounded-4xl overflow-hidden shadow-2xl p-8"
              >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">Edit Patient Profile</h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Full Name</label>
                        <input 
                            type="text" 
                            value={editingPatient.name}
                            onChange={e => setEditingPatient({...editingPatient, name: e.target.value})}
                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Age</label>
                        <input 
                            type="number" 
                            value={editingPatient.age}
                            onChange={e => setEditingPatient({...editingPatient, age: e.target.value})}
                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Diagnosis</label>
                        <select 
                            value={editingPatient.severity}
                            onChange={e => setEditingPatient({...editingPatient, severity: e.target.value})}
                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="Level 1">Level 1 (Mild)</option>
                            <option value="Level 2">Level 2 (Moderate)</option>
                            <option value="Level 3">Level 3 (Severe)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Clinical Status</label>
                        <select 
                            value={editingPatient.status}
                            onChange={e => setEditingPatient({...editingPatient, status: e.target.value})}
                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="Stable & Calm">Stable & Calm</option>
                            <option value="Needs Attention">Needs Attention</option>
                            <option value="Warning: Declining Trend">Warning: Declining Trend</option>
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                        <button 
                            onClick={handleUpdatePatient}
                            className="flex-3 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                        >
                            <CheckCircle2 size={18} /> Update Profile
                        </button>
                    </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Register Modal */}
        <AnimatePresence>
          {isRegisterModalOpen && (
            <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsRegisterModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-white rounded-4xl overflow-hidden shadow-2xl p-8"
              >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">New Patient Profile</h3>
                    <button onClick={() => setIsRegisterModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Full Name</label>
                        <input 
                            type="text" 
                            value={newPatient.name}
                            onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="e.g. Liam Smith"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Age</label>
                        <input 
                            type="number" 
                            value={newPatient.age}
                            onChange={e => setNewPatient({...newPatient, age: e.target.value})}
                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="e.g. 7"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Initial Diagnosis</label>
                        <select 
                            value={newPatient.severity}
                            onChange={e => setNewPatient({...newPatient, severity: e.target.value})}
                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="Level 1">Level 1 (Mild)</option>
                            <option value="Level 2">Level 2 (Moderate)</option>
                            <option value="Level 3">Level 3 (Severe)</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleRegisterPatient}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors mt-8"
                    >
                        Create Permanent Record
                    </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmation.isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-sm bg-white rounded-4xl overflow-hidden shadow-2xl p-8 text-center"
              >
                <div className="size-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
                  <Trash2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{deleteConfirmation.title}</h3>
                <p className="text-slate-500 font-medium mb-8">
                    {deleteConfirmation.type === 'patient' 
                      ? "This action is permanent and will delete all session history." 
                      : "This session record will be permanently removed from clinical history."}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })} 
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                        if (deleteConfirmation.type === 'patient') handleDeletePatient(deleteConfirmation.id);
                        if (deleteConfirmation.type === 'record') handleDeleteRecord(deleteConfirmation.id);
                    }}
                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Logout Modal */}
        <AnimatePresence>
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
                <p className="text-slate-500 font-medium mb-8">Are you sure you want to log out?</p>
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
