// Schedule.jsx
import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
    Clock,
    Video,
    MapPin,
    CheckCircle2
} from 'lucide-react';

import {
    format,
    startOfWeek,
    eachDayOfInterval,
    isSameDay,
    startOfMonth,
    endOfMonth,
    endOfWeek,
    isSameMonth,
    addMonths,
    subMonths
} from 'date-fns';

import { cn } from '../lib/utils';
import Sidebar from "../components/SideNavigationBar";

export default function Schedule() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [targetNames, setTargetNames] = useState({}); // { target_id: name }
    const [activeTab, setActiveTab] = useState('schedule');

    const username = localStorage.getItem("username");

    // ---------------- FETCH APPOINTMENTS ----------------
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/appointments/user/${username}`);
                const data = await res.json();
                setAppointments(data);
            } catch (err) {
                console.error("Failed to fetch appointments", err);
            }
        };
        if (username) fetchAppointments();
    }, [username]);

    // ---------------- FETCH TARGET NAMES ----------------
    const fetchTargetName = async (targetId) => {
        if (!targetId) return "Unknown";
        if (targetNames[targetId]) return targetNames[targetId]; // 已缓存

        try {
            const res = await fetch(`http://localhost:8000/api/users/${targetId}`);
            if (!res.ok) throw new Error("Failed to fetch user");
            const data = await res.json();
            const name = data.full_name || data.username || "Unknown";
            setTargetNames(prev => ({ ...prev, [targetId]: name }));
            return name;
        } catch (err) {
            console.error("Error fetching target user:", err);
            return "Unknown";
        }
    };

    // 自动批量获取 target 名字
    useEffect(() => {
        const fetchAllTargetNames = async () => {
            const uniqueIds = [...new Set(appointments.map(app => app.target_id))];
            for (const id of uniqueIds) {
                await fetchTargetName(id);
            }
        };
        if (appointments.length) fetchAllTargetNames();
    }, [appointments]);

    // ---------------- CALENDAR ----------------
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const selectedDayAppointments = appointments.filter(app =>
        isSameDay(new Date(app.date), selectedDate)
    );

    const STATUS_COLORS = {
        Accepted: "bg-emerald-50 text-emerald-700",
        Pending: "bg-amber-50 text-amber-700",
        Cancelled: "bg-rose-50 text-rose-700",
        Rejected: "bg-indigo-50 text-indigo-700"
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* HEADER */}
                <header className="h-20 bg-indigo-600 border-b border-slate-200 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 w-96">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search appointments..."
                            className="bg-transparent border-none outline-none text-sm w-full"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <Bell size={22} />
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="text-right">
                            <p className="text-sm font-bold text-white">{username}</p>
                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                                Therapy Patient
                            </p>
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* TITLE */}
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            My Schedule
                        </h2>
                        <p className="text-slate-500 mt-1">
                            View and manage your therapy sessions.
                        </p>
                    </div>

                    {/* CALENDAR */}
                    <div className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Appointment Calendar</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-sm font-bold min-w-30 text-center">
                                    {format(currentMonth, 'MMMM yyyy')}
                                </span>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* WEEK HEADER */}
                            <div className="grid grid-cols-7 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div
                                        key={day}
                                        className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* CALENDAR GRID */}
                            <div className="grid grid-cols-7 border-t border-l border-slate-100">
                                {calendarDays.map((day, idx) => {
                                    const dayApps = appointments.filter(app => isSameDay(new Date(app.date), day));
                                    const isSelected = isSameDay(day, selectedDate);
                                    const isCurrentMonth = isSameMonth(day, monthStart);
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedDate(day)}
                                            className={cn(
                                                "h-24 border-r border-b border-slate-100 p-2 transition-all text-left flex flex-col gap-1",
                                                !isCurrentMonth && "bg-slate-50/50 text-slate-300",
                                                isSelected && "bg-primary/5 ring-2 ring-inset ring-primary/20",
                                                isCurrentMonth && "hover:bg-slate-50"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "text-xs font-bold size-6 flex items-center justify-center rounded-lg",
                                                    isToday && !isSelected && "bg-primary text-white",
                                                    isSelected && "bg-primary text-white"
                                                )}
                                            >
                                                {format(day, 'd')}
                                            </span>

                                            <div className="space-y-1 relative">
                                                {dayApps.slice(0, 2).map(app => {
                                                    const statusClass = STATUS_COLORS[app.status] || "bg-slate-100 text-slate-600";
                                                    return (
                                                        <div key={app.id} className="relative group">
                                                            <div
                                                                className={cn(
                                                                    "text-[9px] font-bold px-1.5 py-0.5 rounded truncate cursor-pointer",
                                                                    statusClass
                                                                )}
                                                            >
                                                                {app.start_time}
                                                            </div>

                                                            {/* Tooltip */}
                                                            <div
                                                                className={cn(
                                                                    "absolute top-1/2 -translate-y-1/2 w-44 bg-white border border-slate-200 shadow-lg rounded-lg p-2 text-xs text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10",
                                                                    idx % 7 === 6 ? "right-full left-auto mr-2" : "left-full ml-2"
                                                                )}
                                                            >
                                                                <p className="font-bold">
                                                                    {targetNames[app.target_id] || "Loading..."}
                                                                </p>
                                                                <p>Status: <span className="font-semibold">{app.status}</span></p>
                                                                <p>Time: {app.start_time} - {app.end_time}</p>
                                                                <p>Type: Video</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {dayApps.length > 2 && (
                                                    <div className="text-[9px] font-bold text-slate-400 pl-1">
                                                        +{dayApps.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* DAILY AGENDA */}
                </div>
            </main>
        </div>
    );
}