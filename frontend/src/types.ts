export type UserRole = 'guardian' | 'therapist';

export interface Patient {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  status: 'Stable & Calm' | 'Warning: Declining Trend' | 'Needs Attention';
  lastUpdated: string;
  severity?: 'Level 1' | 'Level 2' | 'Level 3';
  upcomingAppointment?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  image?: string;
}

export interface DailyReport {
  date: string;
  score: number;
  social: number;
  comm: number;
  behavior: number;
  function: number;
  notes?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'missed' | 'completed';
export type AppointmentType = 'in-person' | 'video';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  date: string; // ISO string (YYYY-MM-DD)
  startTime: string; // e.g., "10:00"
  endTime: string; // e.g., "11:00"
  status: AppointmentStatus;
  type: AppointmentType;
  videoLink?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string; // ISO or timestamp
  isPinned?: boolean;
}

export interface ConnectionRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}
