import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, MessageSquare } from 'lucide-react';
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
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar: Contacts */}
      <aside className="w-1/3 max-w-sm bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-200/60 flex items-center gap-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <button onClick={handleBack} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src={eztherapylogo} alt="Logo" className="h-10 w-10 object-contain scale-[1.5] mr-6 drop-shadow-sm" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Messages</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
  );
}
