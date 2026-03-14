import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Bot, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils'; // Assuming this utility exists based on other components

export default function PatientChatBoard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello. I am here to chat with you. How are you feeling today?',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const storedUsername = localStorage.getItem("username") || "unknown";

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text, username: storedUsername }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response,
        action: data.action,
        data: data.data
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'I am sorry, I am having trouble connecting right now. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0FDF4] text-slate-800 font-sans">
      {/* Header */}
      <header className="flex items-center gap-4 p-6 bg-emerald-100 shadow-sm border-b border-emerald-200">
        <button 
          onClick={() => navigate('/patient-home')}
          className="p-3 bg-white rounded-full hover:bg-emerald-50 transition-colors shadow-sm"
          aria-label="Go back to Home"
        >
          <ArrowLeft size={28} className="text-emerald-700" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-200 rounded-full">
            <Bot size={32} className="text-emerald-800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Friendly Helper</h1>
            <p className="text-sm font-medium text-emerald-700">Online and ready to listen</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex items-end gap-3",
                message.sender === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div 
                className={cn(
                  "flex-shrink-0 size-12 rounded-full flex items-center justify-center",
                  message.sender === 'user' ? "bg-indigo-100" : "bg-emerald-200"
                )}
              >
                {message.sender === 'user' ? (
                  <User size={24} className="text-indigo-700" />
                ) : (
                  <Bot size={24} className="text-emerald-800" />
                )}
              </div>
              <div 
                className={cn(
                  "max-w-[75%] px-6 py-4 rounded-3xl text-lg font-medium leading-relaxed shadow-sm",
                  message.sender === 'user' 
                    ? "bg-indigo-600 text-white rounded-br-none" 
                    : "bg-white text-slate-800 rounded-bl-none border border-emerald-100"
                )}
              >
                <div>{message.text}</div>
                {message.action === 'show_doctors' && message.data && (
                  <div className="mt-4 space-y-3">
                    {message.data.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => {
                          const e = { preventDefault: () => {} };
                          setInputValue(`I want to book an appointment with ${doctor.name}`);
                          handleSendMessage(e);
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-2xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
                      >
                        <div className="p-2 bg-emerald-200 rounded-xl text-emerald-700">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doctor.name}</p>
                          <p className="text-sm text-slate-600">{doctor.specialty}</p>
                          <p className="text-xs text-emerald-700 mt-1 font-semibold">{doctor.availability}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {message.action === 'start_quiz' && message.data && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-4">
                    <p className="font-bold text-emerald-900 border-b border-emerald-200 pb-2">Quick Check-in</p>
                    {message.data.map((q) => (
                      <div key={q.id} className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">{q.text}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [message.id + '_' + q.id]: 'yes' }))}
                            className={cn(
                              "px-4 py-2 rounded-xl text-sm font-bold transition-colors border",
                              quizAnswers[message.id + '_' + q.id] === 'yes'
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [message.id + '_' + q.id]: 'no' }))}
                            className={cn(
                              "px-4 py-2 rounded-xl text-sm font-bold transition-colors border",
                              quizAnswers[message.id + '_' + q.id] === 'no'
                                ? "bg-slate-500 text-white border-slate-500"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Only show submit if all questions are answered */}
                    {message.data.every(q => quizAnswers[message.id + '_' + q.id]) && (
                      <button
                        onClick={() => {
                          const answers = message.data.map(q => quizAnswers[message.id + '_' + q.id]);
                          const yesCount = answers.filter(a => a === 'yes').length;
                          const e = { preventDefault: () => {} };
                          
                          let severity = 'mild';
                          if (yesCount > message.data.length / 2) severity = 'severe';
                          
                          setInputValue(`quiz_results: ${yesCount} yes responses. Severity: ${severity}`);
                          handleSendMessage(e);
                        }}
                        className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                      >
                        Submit Answers
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
             <div className="flex items-end gap-3 flex-row">
             <div className="flex-shrink-0 size-12 rounded-full flex items-center justify-center bg-emerald-200">
               <Bot size={24} className="text-emerald-800" />
             </div>
             <div className="px-6 py-4 rounded-3xl bg-white text-slate-800 rounded-bl-none border border-emerald-100 shadow-sm flex items-center gap-2">
               <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce"></div>
             </div>
           </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-6 bg-white border-t border-emerald-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-4 focus-within:ring-emerald-100 focus-within:border-emerald-300 transition-all"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-transparent px-6 py-4 text-xl font-medium outline-none placeholder:text-slate-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="flex items-center justify-center p-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-200"
            aria-label="Send message"
          >
            <Send size={28} className={inputValue.trim() ? "translate-x-0.5" : ""} />
          </button>
        </form>
      </footer>
    </div>
  );
}
