export type UserRole = 'admin' | 'employee';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkSession {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
}

export interface WorkSessionWithProfile extends WorkSession {
  profiles: Pick<Profile, 'full_name' | 'username' | 'avatar_url'>;
}

export interface DailySummary {
  id: string;
  user_id: string;
  work_date: string;
  total_minutes: number;
  session_count: number;
  created_at: string;
}

export type LeaderboardPeriod = 'today' | 'week' | 'month';

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  total_minutes: number;
  is_active_session: boolean;
}

export interface AdminStats {
  active_now: number;
  today_total_minutes: number;
  week_total_minutes: number;
  month_total_minutes: number;
}

export interface ReportRow {
  user_id: string;
  full_name: string;
  total_minutes: number;
  day_count: number;
  avg_daily_minutes: number;
}

export interface ExportData {
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  duration: string;
  totalHours: number;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  body: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  is_read: boolean;
  created_at: string;
  profiles?: { full_name: string; username: string; avatar_url: string | null; role?: string };
}

export interface DailyNote {
  id: string;
  user_id: string;
  work_date: string;
  body: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string };
}

export interface Announcement {
  id: string;
  author_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  profiles?: { full_name: string };
}

export type LeaveType = 'leave' | 'late' | 'early';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  user_id: string;
  type: LeaveType;
  reason: string;
  request_date: string;
  status: LeaveStatus;
  admin_note: string | null;
  created_at: string;
  profiles?: { full_name: string; username: string };
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  ref_id: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
}
