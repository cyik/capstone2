import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  MessageSquare, 
  LayoutDashboard, 
  Search, 
  Bell, 
  LogOut,
  ScanFace,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import eztherapylogo from '../assets/eztherapy transparent.png';
import { MOCK_PATIENTS } from '../lib/mockData';
import { AnimatePresence, motion } from 'framer-motion';

export default function TherapistPatientsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    severity: 'Level 1',
  });

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.age) return;
    
    const newId = `p${patients.length + 1}`;
    const patientToAdd = {
      id: newId,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      severity: newPatient.severity,
      status: 'Stable & Calm',
      lastActive: 'Just now',
      avatar: `https://picsum.photos/seed/${newId}/200`
    };

    setPatients([...patients, patientToAdd]);
    setIsAddModalOpen(false);
    setNewPatient({ name: '', age: '', severity: 'Level 1' });
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
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
              { id: 'patients', label: 'Patients', icon: Users, to: '/patients' },
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
        <header className="h-20 bg-indigo-600 border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 w-96">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <p className="text-sm font-bold text-white">Dr. Sarah Chen</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Senior Therapist</p>
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

        {/* Patients Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Your Patients</h2>
              <p className="text-slate-500 mt-1">Manage and view all your assigned patients ({filteredPatients.length} total).</p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Users size={16} />
              Add Patient
            </button>
          </div>

          <AnimatePresence>
            {isAddModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-md bg-white rounded-4xl overflow-hidden shadow-2xl p-8"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">Add New Patient</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                      <LayoutDashboard size={20} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Patient Name</label>
                      <input 
                        type="text" 
                        value={newPatient.name}
                        onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Age</label>
                      <input 
                        type="number" 
                        value={newPatient.age}
                        onChange={e => setNewPatient({...newPatient, age: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Autism Severity</label>
                      <select 
                        value={newPatient.severity}
                        onChange={e => setNewPatient({...newPatient, severity: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Level 1">Level 1</option>
                        <option value="Level 2">Level 2</option>
                        <option value="Level 3">Level 3</option>
                      </select>
                    </div>

                    <button 
                      onClick={handleAddPatient}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors mt-8"
                    >
                      Create Patient Profile
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPatients.map(patient => (
              <div key={patient.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
                <div className="p-6 flex flex-col items-center flex-1">
                  <div className="relative mb-4">
                    <img 
                      src={patient.avatar} 
                      alt={patient.name} 
                      className="size-24 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className={cn(
                        "absolute bottom-1 right-1 size-4 rounded-full border-2 border-white",
                        patient.status === 'Needs Attention' ? "bg-rose-500" : 
                        patient.status === 'Warning: Declining Trend' ? "bg-amber-500" : "bg-emerald-500"
                      )} 
                      title={patient.status}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 text-center">{patient.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-4">{patient.age} years old</p>
                  
                  <div className="w-full bg-slate-50 rounded-2xl p-4 mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Severity</span>
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{patient.severity || 'Unspecified'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]" title={patient.status}>{patient.status}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex gap-2">
                  <button className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all">
                    View Profile
                  </button>
                  <button className="w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl text-slate-400">
                <Users size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-bold text-slate-600">No patients found</p>
                <p className="text-sm">Try adjusting your search query.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
