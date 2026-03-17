import React from "react";
import { LayoutDashboard, Calendar as CalendarIcon, MessageSquare, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import eztherapylogo from "../assets/eztherapy transparent.png";

export default function Sidebar({ activeTab, setActiveTab }) {
    const navigate = useNavigate();

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
        { id: "chatboard", label: "AI Chatboard", icon: MessageSquare, to: "/patient-chat" },
        { id: "schedule", label: "Schedule", icon: CalendarIcon, to: "/calendar" },
        { id: "messages", label: "Messages", icon: MessageSquare, to: "/messages" },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">

            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <img
                        src={eztherapylogo}
                        alt="Logo"
                        className="h-10 w-10 object-contain scale-200 ml-7"
                    />
                    <h1 className="text-xl font-bold tracking-tight ml-5">EZTherapy</h1>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                navigate(item.to);
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

            {/* Logout */}
            <div className="mt-auto p-6 border-t border-slate-100">
                <button
                    onClick={() => {
                        // 删除 token 和其他本地存储信息
                        localStorage.removeItem("token");
                        localStorage.removeItem("username");
                        localStorage.removeItem("role");

                        // 跳转到登录页
                        navigate("/login");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}