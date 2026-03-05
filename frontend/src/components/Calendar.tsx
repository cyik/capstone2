import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addDays,
  isPast,
  isAfter
} from 'date-fns';
import { ChevronLeft, ChevronRight, Video, MapPin, Clock, Calendar as CalendarIcon, X, Trash2, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { Appointment } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarProps {
  appointments: Appointment[];
  onSelectDate?: (date: Date) => void;
  onBookAppointment?: (date: Date) => void;
  onCancelAppointment?: (id: string, reason: string) => void;
  onChangeTime?: (id: string, reason: string) => void;
  onChangeTherapist?: (id: string, reason: string) => void;
  role: 'guardian' | 'therapist';
}

export default function Calendar({ 
  appointments, 
  onSelectDate, 
  onBookAppointment, 
  onCancelAppointment, 
  onChangeTime,
  onChangeTherapist,
  role 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null);
  const [reasonModal, setReasonModal] = useState<{ id: string, type: 'cancel' | 'time' | 'therapist' } | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const [newTime, setNewTime] = useState('10:00');
  const [newTherapistId, setNewTherapistId] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [now, setNow] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // Update every 10s
    return () => clearInterval(timer);
  }, []);

  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  const therapists = [
    { id: 't1', name: 'Dr. Sarah Chen' },
    { id: 't2', name: 'Dr. James Wilson' },
    { id: 't3', name: 'Alice Cooper' },
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(app => isSameDay(new Date(app.date), day));
  };

  const getStatusColor = (status: string, isExpired: boolean = false) => {
    if (isExpired && (status === 'confirmed' || status === 'pending')) return 'bg-slate-400';
    switch (status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'rejected': return 'bg-amber-500';
      case 'missed': return 'bg-rose-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const selectedDayAppointments = getAppointmentsForDay(selectedDate);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const app = appointments.find(a => a.id === id);
    if (!app) return;

    const now = new Date();
    const appDate = new Date(app.date);
    const [h, m] = app.startTime.split(':').map(Number);
    const appStartTime = new Date(appDate.setHours(h, m, 0, 0));

    // Only allow editing for future appointments
    if (appStartTime > now) {
      setContextMenu({ x: e.clientX, y: e.clientY, id });
    } else {
      // Optional: show a toast or alert that past appointments cannot be edited
    }
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex flex-col h-full relative" onClick={() => setContextMenu(null)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-100">
        <button 
          onClick={() => setIsPickerOpen(true)}
          className="flex items-center gap-2 text-lg font-bold text-slate-900 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors"
        >
          {format(currentMonth, 'MMMM yyyy')}
          <ChevronRight size={16} className="rotate-90 text-slate-400" />
        </button>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Month/Year Picker Modal */}
      <AnimatePresence>
        {isPickerOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-xs rounded-4xl overflow-hidden shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Select Date</h3>
                <button onClick={() => setIsPickerOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Year</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => setCurrentMonth(new Date(year, currentMonth.getMonth()))}
                        className={cn(
                          "py-2 rounded-xl text-sm font-bold transition-all",
                          currentMonth.getFullYear() === year ? "bg-primary text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Month</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {months.map((month, idx) => (
                      <button
                        key={month}
                        onClick={() => {
                          setCurrentMonth(new Date(currentMonth.getFullYear(), idx));
                          setIsPickerOpen(false);
                        }}
                        className={cn(
                          "py-2 rounded-xl text-[10px] font-bold transition-all",
                          currentMonth.getMonth() === idx ? "bg-primary text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {month.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-70 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-45"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                setReasonModal({ id: contextMenu.id, type: 'time' });
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Clock size={16} className="text-slate-400" />
              Change Time
            </button>
            <button
              onClick={() => {
                setReasonModal({ id: contextMenu.id, type: 'therapist' });
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Users size={16} className="text-slate-400" />
              Change Therapist
            </button>
            <div className="h-px bg-slate-100 my-1" />
            <button
              onClick={() => {
                setReasonModal({ id: contextMenu.id, type: 'cancel' });
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Cancel Appointment
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reason Modal */}
      <AnimatePresence>
        {reasonModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-4xl overflow-hidden shadow-2xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {reasonModal.type === 'cancel' ? 'Cancel Appointment' : 
                 reasonModal.type === 'time' ? 'Change Date/Time' : 'Change Therapist'}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {reasonModal.type === 'cancel' 
                  ? 'Please provide a reason for cancellation.' 
                  : 'Please select the new details and provide a reason.'}
              </p>
              
              <div className="space-y-6">
                {reasonModal.type === 'time' && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select New Date</label>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30"
                            disabled={weekOffset === 0}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="text-[10px] font-bold text-slate-600 min-w-17.5 text-center">
                            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
                          </span>
                          <button 
                            onClick={() => setWeekOffset(prev => Math.min(4, prev + 1))}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 disabled:opacity-30"
                            disabled={weekOffset >= 4}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 pb-2 mt-2">
                        {weekDays.map((day, i) => (
                          <button
                            key={i}
                            onClick={() => setNewDate(day)}
                            className={cn(
                              "flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                              isSameDay(day, newDate) ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-slate-100 text-slate-700"
                            )}
                          >
                            <span className="text-[10px] font-bold opacity-60 uppercase">{format(day, 'EEE')}</span>
                            <span className="text-sm font-bold">{format(day, 'd')}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select New Time Slot</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => {
                          const endTime = format(new Date(`2000-01-01T${time}:00`).getTime() + 3600000, 'HH:mm');
                          return (
                            <button 
                              key={time}
                              onClick={() => setNewTime(time)}
                              className={cn(
                                "py-3 rounded-xl border transition-all text-[10px] font-bold",
                                newTime === time ? "border-primary bg-primary text-white" : "border-slate-100 bg-slate-50 text-slate-600"
                              )}
                            >
                              {time} - {endTime}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {reasonModal.type === 'therapist' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select New Therapist</label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {therapists.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setNewTherapistId(t.id)}
                          className={cn(
                            "p-4 rounded-xl border transition-all text-sm font-bold text-left flex items-center gap-3",
                            newTherapistId === t.id ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-slate-50 text-slate-600"
                          )}
                        >
                          <div className="size-8 rounded-full bg-slate-200" />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Reason</label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none h-24 mt-2"
                    placeholder="Why are you requesting this change?"
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => {
                    setReasonModal(null);
                    setReasonText('');
                  }}
                  className="py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm"
                >
                  Back
                </button>
                <button
                  disabled={!reasonText.trim() || (reasonModal.type === 'therapist' && !newTherapistId)}
                  onClick={() => {
                    let finalReason = reasonText;
                    if (reasonModal.type === 'time') {
                      finalReason = `New Date: ${format(newDate, 'yyyy-MM-dd')}, New Time: ${newTime}. Reason: ${reasonText}`;
                    } else if (reasonModal.type === 'therapist') {
                      const tName = therapists.find(t => t.id === newTherapistId)?.name;
                      finalReason = `New Therapist: ${tName}. Reason: ${reasonText}`;
                    }

                    if (reasonModal.type === 'cancel') onCancelAppointment?.(reasonModal.id, finalReason);
                    if (reasonModal.type === 'time') onChangeTime?.(reasonModal.id, finalReason);
                    if (reasonModal.type === 'therapist') onChangeTherapist?.(reasonModal.id, finalReason);
                    
                    setReasonModal(null);
                    setReasonText('');
                  }}
                  className="py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Weekdays */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-4 py-2 bg-white border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-medium text-slate-500">Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-amber-500" />
          <span className="text-[10px] font-medium text-slate-500">Unconfirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-rose-500" />
          <span className="text-[10px] font-medium text-slate-500">Didn't Attend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-blue-500" />
          <span className="text-[10px] font-medium text-slate-500">Completed</span>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {calendarDays.map((day, idx) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedDate(day);
                onSelectDate?.(day);
              }}
              className={cn(
                "relative h-16 border-r border-b border-slate-100 flex flex-col items-center justify-start pt-1.5 transition-all overflow-hidden",
                !isCurrentMonth && "bg-slate-50/50 text-slate-300",
                isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
                isCurrentMonth && "text-slate-700"
              )}
            >
              <span className={cn(
                "text-[10px] font-semibold size-5 flex items-center justify-center rounded-full mb-0.5",
                isSameDay(day, new Date()) && !isSelected && "bg-blue-500 text-white",
                isSelected && "bg-blue-600 text-white"
              )}>
                {format(day, 'd')}
              </span>
              
              <div className="flex flex-col items-center w-full px-1 gap-0.5">
                {dayAppointments.slice(0, 2).map((app, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-full text-[7px] font-bold py-0.5 px-1 rounded truncate text-center",
                      app.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {role === 'guardian' ? app.therapistName.split(' ').pop() : app.patientName}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-[7px] font-bold text-slate-400">+{dayAppointments.length - 2} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Daily Agenda */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900">
            {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
          </h3>
          {role === 'guardian' && (
            <button 
              onClick={() => onBookAppointment?.(selectedDate)}
              className="text-xs font-bold text-primary hover:underline"
            >
              + Book New
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-primary" />
          Double-click session to cancel
        </p>

        {selectedDayAppointments.length > 0 ? (
          <div className="space-y-3">
            {selectedDayAppointments.map((app) => {
              const appDate = new Date(app.date);
              const [startH, startM] = app.startTime.split(':').map(Number);
              const [endH, endM] = app.endTime.split(':').map(Number);
              
              const startTime = new Date(appDate.setHours(startH, startM, 0, 0));
              const endTime = new Date(new Date(app.date).setHours(endH, endM, 0, 0));
              
              const isLive = now >= startTime && now <= endTime;
              const isExpired = now > endTime;
              const displayStatus = isExpired && (app.status === 'confirmed' || app.status === 'pending') ? 'expired' : app.status;

              return (
                <div 
                  key={app.id} 
                  onContextMenu={(e) => handleContextMenu(e, app.id)}
                  onDoubleClick={() => {
                    if (!isExpired) setReasonModal({ id: app.id, type: 'cancel' });
                  }}
                  className={cn(
                    "bg-white p-4 rounded-2xl shadow-sm border border-slate-100 select-none transition-all",
                    !isExpired ? "cursor-pointer active:scale-[0.99]" : "opacity-75 grayscale-[0.2]"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {role === 'guardian' ? app.therapistName : app.patientName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <Clock size={14} />
                          {app.startTime} - {app.endTime}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          {app.type === 'video' ? (
                            <><Video size={14} className="text-primary" /> Video</>
                          ) : (
                            <><MapPin size={14} className="text-slate-400" /> In-person</>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      displayStatus === 'confirmed' && "bg-emerald-100 text-emerald-700",
                      displayStatus === 'rejected' && "bg-amber-100 text-amber-700",
                      displayStatus === 'missed' && "bg-rose-100 text-rose-700",
                      displayStatus === 'completed' && "bg-blue-100 text-blue-700",
                      displayStatus === 'pending' && "bg-slate-100 text-slate-700",
                      displayStatus === 'expired' && "bg-slate-100 text-slate-400"
                    )}>
                      {displayStatus === 'expired' ? '已过期' : 
                       displayStatus === 'rejected' ? '未确认' : 
                       displayStatus === 'missed' ? '未到场' : 
                       displayStatus}
                    </span>
                  </div>
                  
                  {app.type === 'video' && app.status === 'confirmed' && (
                    <button 
                      onClick={() => {
                        if (isLive) {
                          window.open(app.videoLink, '_blank');
                        } else {
                          alert(`The session hasn't started yet. Please join at ${app.startTime}.`);
                        }
                      }}
                      className={cn(
                        "w-full mt-2 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                        isLive ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <Video size={16} />
                      {isLive ? 'Join Video Consultation' : 'Not Time Yet'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Clock size={48} strokeWidth={1} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">No appointments scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}
