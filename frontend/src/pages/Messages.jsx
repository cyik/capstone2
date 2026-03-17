import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, MessageSquare, Search, Bell, Calendar as CalendarIcon, AlertCircle, LayoutDashboard, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import eztherapylogo from '../assets/eztherapy transparent.png';

export default function Messages() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const currentUser = localStorage.getItem("username");
  const currentRole = localStorage.getItem("role");
  
  const messagesEndRef = useRef(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileAction, setProfileAction] = useState('view');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem("username") || 'Therapist',
    role: 'Senior Therapist',
    email: `${localStorage.getItem("username") || 'therapist'}@eztherapy.com`,
    phone: '+1 987 654 321',
    address: '456 Wellness Blvd, Health District',
    bio: 'Dedicated clinical psychologist with 15+ years of experience specializing in pediatric care and autism spectrum support.',
    avatar: 'https://picsum.photos/seed/therapist/200'
  });

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

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser) return navigate("/login");

    // Fetch contacts
    const fetchContacts = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/contacts/${currentUser}?role=${currentRole}`);
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
        }
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };
    
    fetchContacts();
    const contactInterval = setInterval(fetchContacts, 5000);
    return () => clearInterval(contactInterval);
  }, [currentUser, currentRole, navigate]);

  useEffect(() => {
    if (!selectedContact) return;

    // Fetch messages for selected contact
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/messages/${currentUser}/${selectedContact.username}?reader=${currentUser}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
    // Setting up a basic interval for polling new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedContact, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      const msgData = {
        sender_username: currentUser,
        receiver_username: selectedContact.username,
        content: newMessage.trim(),
      };
      
      const res = await fetch(`http://localhost:8000/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgData),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        setMessages((prev) => [...prev, savedMessage]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleBack = () => {
    const role = localStorage.getItem("role");
    if (role === "therapist") {
      navigate("/therapist-home");
    } else if (role === "patient") {
      navigate("/patient-home");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-20 bg-indigo-600 border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleBack}>
            <img src={eztherapylogo} alt="Logo" className="h-10 w-10 object-contain scale-200 ml-7" />
            <h1 className="text-xl font-bold tracking-tight ml-5 text-white">EZTherapy</h1>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 w-96 ml-8">
            <Search size={18} className="text-white/70" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/50"
            />
          </div>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Contacts */}
        <aside className="w-1/3 max-w-sm bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Conversations</h2>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <MessageSquare size={18} />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {contacts.length === 0 ? (
            <p className="text-center text-slate-400 text-sm mt-4">No contacts found.</p>
          ) : (
            contacts.map((contact, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  selectedContact?.username === contact.username
                    ? "bg-gradient-to-r from-indigo-50 to-fuchsia-50 border border-indigo-200 shadow-sm shadow-indigo-100"
                    : "hover:bg-slate-100/80 border border-transparent"
                }`}
              >
                <div className={`p-2.5 rounded-2xl text-white shadow-md relative ${
                  selectedContact?.username === contact.username
                    ? "bg-gradient-to-br from-indigo-500 to-fuchsia-500"
                    : "bg-slate-200 text-slate-500 shadow-none group-hover:bg-slate-300"
                }`}>
                  <User size={20} />
                  {contact.unread_count > 0 && selectedContact?.username !== contact.username && (
                    <span className="absolute -top-1 -right-1 size-5 bg-rose-500 border-2 border-white rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-rose-500/10">
                      {contact.unread_count}
                    </span>
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className={`text-sm font-bold capitalize truncate ${contact.unread_count > 0 ? "text-slate-900" : "text-slate-700"}`}>
                      {contact.role === 'therapist' ? `Dr. ${contact.username}` : contact.username}
                    </p>
                    {contact.last_timestamp && (
                      <span className="text-[9px] text-slate-400 font-medium ml-2">
                        {new Date(contact.last_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    selectedContact?.username === contact.username ? "text-indigo-500" : "text-slate-400"
                  }`}>
                    {contact.role}
                  </p>
                  {contact.last_message && (
                    <p className={`text-xs truncate ${
                      contact.unread_count > 0 ? "text-slate-900 font-bold" : "text-slate-500 font-medium"
                    }`}>
                      {contact.last_message}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Area: Chat Room */}
      <main className="flex-1 flex flex-col bg-slate-50/50">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <header className="h-20 border-b border-slate-200/60 px-8 flex items-center gap-4 bg-white/80 backdrop-blur-md shadow-sm z-10">
              <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-3 rounded-2xl text-white shadow-md shadow-fuchsia-500/20">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 capitalize">
                  {selectedContact.role === 'therapist' ? `Dr. ${selectedContact.username}` : selectedContact.username}
                </h3>
                <p className="text-xs text-slate-500">{selectedContact.role}</p>
              </div>
            </header>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 relative">
              {/* Background gradient blur */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/50 to-fuchsia-50/50 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <MessageSquare size={48} className="opacity-20" />
                  <p className="font-medium text-sm">Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender_username === currentUser;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                      <div 
                        className={`max-w-[70%] p-4 shadow-sm transition-all duration-300 transform group-hover:-translate-y-0.5 ${
                          isMe 
                            ? 'bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-600/20' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm shadow-slate-200/50'
                        }`}
                      >
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        <span className={`text-[10px] mt-2 block font-bold tracking-wider ${isMe ? 'text-indigo-100/80' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 p-4 pl-6 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all text-sm font-medium shadow-inner"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white p-4 rounded-full hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-fuchsia-600/20"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 bg-slate-50/50">
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 blur-2xl opacity-10 rounded-full"></div>
               <MessageSquare size={64} className="opacity-30 relative z-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Your Messages</h3>
            <p className="text-sm font-medium">Select a contact from the sidebar to start chatting.</p>
          </div>
        )}
      </main>
    </div>

      {/* Modals and Overlays */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-4xl overflow-hidden shadow-2xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900">{profileAction === 'view' ? 'Staff Profile' : 'Edit Staff Details'}</h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
              </div>
              {profileAction === 'view' ? (
                <div className="space-y-6 text-center">
                    <img src={userProfile.avatar} alt={userProfile.name} className="size-24 rounded-3xl object-cover border-4 border-slate-50 shadow-lg mb-4 mx-auto" />
                    <h4 className="text-xl font-bold text-slate-900">{userProfile.name}</h4>
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{userProfile.role}</p>
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-left">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Contact</p>
                       <p className="text-sm font-semibold text-slate-700">{userProfile.email}</p>
                       <p className="text-sm font-semibold text-slate-700">{userProfile.phone}</p>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setProfileAction('edit')} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold">Update</button>
                       <button onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Close</button>
                    </div>
                </div>
              ) : (
                <div className="space-y-4">
                    <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Name" defaultValue={userProfile.name} />
                    <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Email" defaultValue={userProfile.email} />
                    <button onClick={() => { setProfileAction('view'); setIsProfileModalOpen(false); }} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg">Save Changes</button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogoutModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-4xl overflow-hidden shadow-2xl p-8 text-center">
              <div className="size-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500"><LogOut size={40} /></div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Logout</h3>
              <p className="text-slate-500 font-medium mb-8">Are you sure you want to log out?</p>
              <div className="flex gap-4">
                <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">Logout</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
