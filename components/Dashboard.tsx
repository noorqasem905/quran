'use client';
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen, Users, UserCheck, ShieldCheck, CheckCircle2, XCircle,
  Calendar, Clock, Phone, AlertCircle, Plus, Check, Search, Download,
  Printer, LogOut, ChevronRight, ChevronLeft, Building, Lock, FileText,
  DollarSign, RefreshCw, BarChart2, Bell, AlertTriangle, UserPlus,
  Eye, EyeOff, Save, Key, Edit, Layers, Shield, Sparkles, Filter,
  PhoneCall, CheckCircle, ArrowRight, MessageCircle, MapPin, ChevronDown,
  Menu, X, Smartphone, Award, Briefcase, UserCheck2, HelpCircle, ArrowLeftRight,
  ClipboardList
} from 'lucide-react';

export type UserRole = 'admin' | 'gen_supervisor' | 'class_supervisor';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  assignedClassId?: string;
  assignedClassName?: string;
  avatar?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  grade: string;
  classId: string;
  parts: number;
  tuitionStatus: 'خالص' | 'متبقي قسط' | 'معفى' | 'مدفوع مقدماً';
  tuitionPaid: number;
  tuitionTotal: number;
  advanceAmount?: number;
  consecutiveAbsent: number;
  parentPhone1: string;
  parentPhone2: string;
  enrollmentDate: string;
  attendanceDays: Record<number, 'present' | 'absent' | 'excused' | ''>;
}

export interface HalaqahItem {
  id: string;
  name: string;
  teacher: string;
  room: string;
  capacity: number;
  schedule: string;
  level: string;
}

export interface SupervisorRecord {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  nationalId: string;
  role: UserRole;
  roleTitle: string;
  assignedClassId?: string;
  assignedClassName?: string;
  qualification: string;
  specialization: string;
  hireDate: string;
  isActive: boolean;
}

export interface ShiftRecord {
  id: string;
  supervisorId: string;
  supervisorName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'حاضر في الموعد' | 'متأخر بعذر' | 'انصراف مبكر' | 'قيد الدوام';
  isApproved: boolean;
}

export interface ScheduledSession {
  dayIndex: number;
  dayName: string;
  dateStr: string;
  shortLabel: string;
}

export const OFFICIAL_SCHEDULE_DATES: ScheduledSession[] = [
  { dayIndex: 1, dayName: 'السبت', dateStr: '2026-10-03', shortLabel: 'السبت 03/10' },
  { dayIndex: 2, dayName: 'الأحد', dateStr: '2026-10-04', shortLabel: 'الأحد 04/10' },
  { dayIndex: 3, dayName: 'الإثنين', dateStr: '2026-10-05', shortLabel: 'الإثنين 05/10' },
  { dayIndex: 4, dayName: 'الثلاثاء', dateStr: '2026-10-06', shortLabel: 'الثلاثاء 06/10' },
  { dayIndex: 5, dayName: 'الأربعاء', dateStr: '2026-10-07', shortLabel: 'الأربعاء 07/10' },
  { dayIndex: 6, dayName: 'السبت', dateStr: '2026-10-10', shortLabel: 'السبت 10/10' },
  { dayIndex: 7, dayName: 'الأحد', dateStr: '2026-10-11', shortLabel: 'الأحد 11/10' },
  { dayIndex: 8, dayName: 'الإثنين', dateStr: '2026-10-12', shortLabel: 'الإثنين 12/10' },
  { dayIndex: 9, dayName: 'الثلاثاء', dateStr: '2026-10-13', shortLabel: 'الثلاثاء 13/10' },
  { dayIndex: 10, dayName: 'الأربعاء', dateStr: '2026-10-14', shortLabel: 'الأربعاء 14/10' },
  { dayIndex: 11, dayName: 'السبت', dateStr: '2026-10-17', shortLabel: 'السبت 17/10' },
  { dayIndex: 12, dayName: 'الأحد', dateStr: '2026-10-18', shortLabel: 'الأحد 18/10' },
  { dayIndex: 13, dayName: 'الإثنين', dateStr: '2026-10-19', shortLabel: 'الإثنين 19/10' },
  { dayIndex: 14, dayName: 'الثلاثاء', dateStr: '2026-10-20', shortLabel: 'الثلاثاء 20/10' },
  { dayIndex: 15, dayName: 'الأربعاء', dateStr: '2026-10-21', shortLabel: 'الأربعاء 21/10' },
  { dayIndex: 16, dayName: 'السبت', dateStr: '2026-10-24', shortLabel: 'السبت 24/10' },
  { dayIndex: 17, dayName: 'الأحد', dateStr: '2026-10-25', shortLabel: 'الأحد 25/10' },
  { dayIndex: 18, dayName: 'الإثنين', dateStr: '2026-10-26', shortLabel: 'الإثنين 26/10' },
  { dayIndex: 19, dayName: 'الثلاثاء', dateStr: '2026-10-27', shortLabel: 'الثلاثاء 27/10' },
  { dayIndex: 20, dayName: 'الأربعاء', dateStr: '2026-10-28', shortLabel: 'الأربعاء 28/10' }
];

export const INITIAL_CIRCLES: HalaqahItem[] = [
  { id: 'h1', name: 'حلقة الإمام عاصم (المستوى التأسيسي)', teacher: 'الشيخ عبدالرحمن السعدي', room: 'قاعة 101', capacity: 20, schedule: 'السبت - الأربعاء (عصراً)', level: 'المبتدئين' },
  { id: 'h2', name: 'حلقة الإمام نافع (المستوى المتوسط)', teacher: 'الشيخ محمد بن خليل', room: 'قاعة 102', capacity: 18, schedule: 'السبت - الأربعاء (عصراً)', level: 'المتوسط' },
  { id: 'h3', name: 'حلقة الإمام الشاطبي (الإتقان والتجويد)', teacher: 'الشيخ إبراهيم الحفني', room: 'قاعة 103', capacity: 15, schedule: 'السبت - الأربعاء (مساءً)', level: 'المتقدم' },
  { id: 'h4', name: 'حلقة الإمام ابن الجزري (الحفظ المتقدم)', teacher: 'الشيخ أسامة البيطار', room: 'قاعة 104', capacity: 15, schedule: 'السبت - الأربعاء (مساءً)', level: 'الإجازة والسند' }
];

export const INITIAL_SUPERVISORS: SupervisorRecord[] = [
  { id: 'sup1', name: 'المهندس أنس القواسمي', username: 'admin', phone: '0795551234', email: 'admin@qurancenter.jo', nationalId: '9901020304', role: 'admin', roleTitle: 'مسؤول النظام IT Admin', qualification: 'هندسة نظم وإدارة تقنية', specialization: 'إدارة المنظومات الرقمية', hireDate: '2023-01-15', isActive: true },
  { id: 'sup2', name: 'فضيلة الشيخ ناصر المحمود', username: 'gen_sup', phone: '0788884321', email: 'naser@qurancenter.jo', nationalId: '9851020301', role: 'gen_supervisor', roleTitle: 'المشرف العام ورئيس الحلقات', qualification: 'إجازة في القراءات العشر الكبرى', specialization: 'علوم القرآن والتفسير', hireDate: '2022-09-01', isActive: true },
  { id: 'sup3', name: 'الشيخ عبدالرحمن السعدي', username: 'teacher1', phone: '0777779876', email: 'saadi@qurancenter.jo', nationalId: '9921020305', role: 'class_supervisor', roleTitle: 'مشرف حلقة عاصم', assignedClassId: 'h1', assignedClassName: 'حلقة الإمام عاصم (المستوى التأسيسي)', qualification: 'إجازة برواية حفص عن عاصم بالسند المتصل', specialization: 'تأسيس الأطفال وتجويد الحروف', hireDate: '2024-02-10', isActive: true },
  { id: 'sup4', name: 'الشيخ محمد بن خليل', username: 'teacher2', phone: '0791112233', email: 'khalil@qurancenter.jo', nationalId: '9911020306', role: 'class_supervisor', roleTitle: 'مشرف حلقة نافع', assignedClassId: 'h2', assignedClassName: 'حلقة الإمام نافع (المستوى المتوسط)', qualification: 'إجازة برواية قالون وورش', specialization: 'مراجعة وتثبيت الأجزاء الخمسة', hireDate: '2024-03-01', isActive: true }
];

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 's1', name: 'عبدالله إبراهيم محمود الرفاعي', grade: 'الخامس الأساسي', classId: 'h1', parts: 3,
    tuitionStatus: 'خالص', tuitionPaid: 15, tuitionTotal: 15, consecutiveAbsent: 0,
    parentPhone1: '0791234567', parentPhone2: '0789876543', enrollmentDate: '2026-09-01',
    attendanceDays: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present', 8: 'present' }
  },
  {
    id: 's2', name: 'عمر خالد عبدالقادر النجار', grade: 'السادس الأساسي', classId: 'h1', parts: 4,
    tuitionStatus: 'متبقي قسط', tuitionPaid: 10, tuitionTotal: 15, consecutiveAbsent: 3,
    parentPhone1: '0792345678', parentPhone2: '0771239876', enrollmentDate: '2026-09-03',
    attendanceDays: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'absent', 7: 'absent', 8: 'absent' }
  },
  {
    id: 's3', name: 'يوسف أحمد سليم العبادي', grade: 'الرابع الأساسي', classId: 'h1', parts: 2,
    tuitionStatus: 'خالص', tuitionPaid: 15, tuitionTotal: 15, consecutiveAbsent: 0,
    parentPhone1: '0783456789', parentPhone2: '0795551122', enrollmentDate: '2026-09-05',
    attendanceDays: { 1: 'present', 2: 'present', 3: 'present', 4: 'excused', 5: 'present', 6: 'present', 7: 'present', 8: 'present' }
  },
  {
    id: 's4', name: 'حمزة فادي منذر الحنيطي', grade: 'السابع الأساسي', classId: 'h2', parts: 6,
    tuitionStatus: 'مدفوع مقدماً', tuitionPaid: 30, tuitionTotal: 15, advanceAmount: 15, consecutiveAbsent: 0,
    parentPhone1: '0774567890', parentPhone2: '0781112233', enrollmentDate: '2026-08-25',
    attendanceDays: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present', 8: 'present' }
  },
  {
    id: 's5', name: 'زيد حسام الدين الكردي', grade: 'الثامن الأساسي', classId: 'h2', parts: 8,
    tuitionStatus: 'معفى', tuitionPaid: 0, tuitionTotal: 0, consecutiveAbsent: 0,
    parentPhone1: '0795678901', parentPhone2: '0778889900', enrollmentDate: '2026-08-20',
    attendanceDays: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present', 8: 'present' }
  },
  {
    id: 's6', name: 'مالك طارق زياد القاسم', grade: 'التاسع الأساسي', classId: 'h3', parts: 12,
    tuitionStatus: 'خالص', tuitionPaid: 15, tuitionTotal: 15, consecutiveAbsent: 1,
    parentPhone1: '0786789012', parentPhone2: '0793334455', enrollmentDate: '2026-08-15',
    attendanceDays: { 1: 'present', 2: 'present', 3: 'present', 4: 'present', 5: 'present', 6: 'present', 7: 'present', 8: 'absent' }
  }
];

export const INITIAL_SHIFTS: ShiftRecord[] = [
  { id: 'sh1', supervisorId: 'sup3', supervisorName: 'الشيخ عبدالرحمن السعدي', date: '2026-10-12', startTime: '15:45', endTime: '18:15', duration: '2 س و 30 د', status: 'حاضر في الموعد', isApproved: true },
  { id: 'sh2', supervisorId: 'sup4', supervisorName: 'الشيخ محمد بن خليل', date: '2026-10-12', startTime: '16:05', endTime: '18:10', duration: '2 س و 5 د', status: 'متأخر بعذر', isApproved: false },
  { id: 'sh3', supervisorId: 'sup3', supervisorName: 'الشيخ عبدالرحمن السعدي', date: '2026-10-13', startTime: '15:50', endTime: '18:10', duration: '2 س و 20 د', status: 'حاضر في الموعد', isApproved: true },
  { id: 'sh4', supervisorId: 'sup4', supervisorName: 'الشيخ محمد بن خليل', date: '2026-10-13', startTime: '15:58', endTime: '18:25', duration: '2 س و 27 د', status: 'حاضر في الموعد', isApproved: true }
];

interface AuthContextType {
  user: UserSession | null;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  canAddStudent: () => boolean;
  canManageSupervisors: () => boolean;
  canConfirmTuition: () => boolean;
  canViewTuition: () => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenEnrollStudent: () => void;
  tuitionVisible: boolean;
}

function ClassicDashboardLayout({ children, activeTab, onSelectTab, onOpenEnrollStudent, tuitionVisible }: LayoutProps) {
  const { user, loginAs, logout, canAddStudent } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم المركزية', icon: BarChart2, roles: ['admin', 'gen_supervisor', 'class_supervisor'] },
    { id: 'attendance', label: 'سجل حضور وغياب الحلقة', icon: Calendar, roles: ['admin', 'gen_supervisor', 'class_supervisor'] },
    ...(tuitionVisible || user?.role !== 'class_supervisor'
      ? [{ id: 'tuition', label: 'الرسوم والاشتراكات (15 د.أ)', icon: DollarSign, roles: ['admin', 'gen_supervisor', 'class_supervisor'] }]
      : []),
    { id: 'classes', label: 'إدارة الشُعب والحلقات', icon: Layers, roles: ['admin', 'gen_supervisor', 'class_supervisor'] },
    { id: 'supervisors', label: 'شؤون الكادر والمشرفين', icon: ShieldCheck, roles: ['admin', 'gen_supervisor'] },
    { id: 'reports', label: 'التقارير والمخرجات الرسمية', icon: FileText, roles: ['admin', 'gen_supervisor'] }
  ];

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased" dir="rtl">
      {/* Sticky Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-2.5 shadow-2xs">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) setMobileMenuOpen(!mobileMenuOpen);
                else setSidebarOpen(!sidebarOpen);
              }}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-800 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <h1 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <span>منصة منارة الفرقان</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    نظام الحلقات الذكي
                  </span>
                </h1>
                <div className="text-[11px] text-slate-500 font-medium">
                  المملكة الأردنية الهاشمية • دوام السبت إلى الأربعاء
                </div>
              </div>
            </div>
          </div>

          {/* Center Date & Badge */}
          <div className="hidden md:flex items-center gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>الثلاثاء، 13 تشرين الأول 2026 م</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-emerald-800">2 ربيع الثاني 1448 هـ</span>
            </div>
          </div>

          {/* User & Role Switcher Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs">
              <span className="text-[10px] text-slate-400 font-bold px-1.5">الدور:</span>
              <button
                onClick={() => loginAs('admin')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  user?.role === 'admin' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                }`}
              >
                مدير النظام
              </button>
              <button
                onClick={() => loginAs('gen_supervisor')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  user?.role === 'gen_supervisor' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                }`}
              >
                المشرف العام
              </button>
              <button
                onClick={() => loginAs('class_supervisor')}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                  user?.role === 'class_supervisor' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                }`}
              >
                مشرف حلقة
              </button>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 pl-3 pr-2 py-1 rounded-2xl">
              <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                {user?.name.charAt(0)}
              </div>
              <div className="text-right">
                <div className="font-black text-xs text-emerald-950 leading-tight">{user?.name}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">{user?.roleTitle}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <aside
          className={`bg-white border-l border-slate-200 flex flex-col justify-between transition-all duration-300 z-30 ${
            sidebarOpen ? 'w-64' : 'w-20'
          } ${mobileMenuOpen ? 'fixed inset-y-0 right-0 z-50 flex shadow-2xl' : 'hidden lg:flex'}`}
        >
          <div className="p-3 space-y-4">
            {user?.role === 'class_supervisor' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-right">
                <div className="text-[10px] font-bold text-emerald-700">الشعبة المسندة إليك:</div>
                <div className={`font-black text-xs text-emerald-950 mt-0.5 ${!sidebarOpen && 'hidden'}`}>
                  {user.assignedClassName}
                </div>
              </div>
            )}

            {canAddStudent() && (
              <button
                onClick={onOpenEnrollStudent}
                className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span className={!sidebarOpen ? 'hidden' : ''}>تسجيل وقيد طالب</span>
              </button>
            )}

            <nav className="space-y-1">
              {filteredNav.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-200' : 'text-slate-500'}`} />
                    <span className={`truncate text-right ${!sidebarOpen ? 'hidden' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-slate-200 space-y-2">
            <div className={`text-[11px] text-slate-400 text-center ${!sidebarOpen && 'hidden'}`}>
              نظام المراكز القرآنية v4.5
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className={!sidebarOpen ? 'hidden' : ''}>تبديل الحساب</span>
            </button>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 lg:hidden"
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function DashboardOverview({
  students,
  circles,
  onNavigate
}: {
  students: StudentRecord[];
  circles: HalaqahItem[];
  onNavigate: (tab: string) => void;
}) {
  const { user } = useAuth();
  const [shiftStatus, setShiftStatus] = useState<'idle' | 'started' | 'ended'>('idle');
  const [shiftStartFormatted, setShiftStartFormatted] = useState<string>('');

  const todayPresent = students.filter(s => s.attendanceDays[9] === 'present').length;
  const todayAbsent = students.filter(s => s.attendanceDays[9] === 'absent').length;
  const warningStudents = students.filter(s => s.consecutiveAbsent >= 3);
  const totalCollectedJOD = students.reduce((sum, s) => sum + s.tuitionPaid, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{user?.roleTitle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">أهلاً وسهلاً بك، {user?.name}</h2>
          <p className="text-xs sm:text-sm text-emerald-200 max-w-xl">
            مرحباً بك في لوحة القيادة لمركز منارة الفرقان. يمكنك متابعة رصد الحضور بدوام السبت إلى الأربعاء، إدارة الاشتراكات بالدينار الأردني بدقة، وتعديل وتحديث الشُعب والكادر.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl sm:min-w-[280px] space-y-3 relative z-10">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>إثبات دوام المشرف اليوم</span>
            </span>
            <span className="font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-lg">13-10-2026</span>
          </div>

          {shiftStatus === 'idle' && (
            <button
              onClick={() => {
                setShiftStatus('started');
                setShiftStartFormatted('16:00');
              }}
              className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>بدء الدوام (تسجيل الحضور)</span>
            </button>
          )}

          {shiftStatus === 'started' && (
            <div className="space-y-2">
              <div className="text-[11px] text-emerald-100 flex items-center justify-between">
                <span>وقت البدء:</span>
                <span className="font-mono font-bold">{shiftStartFormatted} م</span>
              </div>
              <button
                onClick={() => setShiftStatus('ended')}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>إنهاء الدوام (تسجيل الانصراف)</span>
              </button>
            </div>
          )}

          {shiftStatus === 'ended' && (
            <div className="p-2.5 bg-emerald-900/80 rounded-xl border border-emerald-500/40 text-center">
              <div className="text-xs font-black text-emerald-200 flex items-center justify-center gap-1">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تم توثيق الدوام بنجاح ✓</span>
              </div>
              <div className="text-[10px] text-emerald-300 mt-0.5">محفوظ في سجل الدوام بانتظار اعتماد المشرف العام</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">إجمالي طلاب المركز</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{students.length} طالب</div>
            <div className="text-[10px] text-emerald-700 font-bold mt-1">موزعين على {circles.length} شُعب</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-700">حضور جلسة اليوم</div>
            <div className="text-2xl font-black text-emerald-800 mt-1 font-mono">{todayPresent} طالب</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">جلسة الثلاثاء (13/10)</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-rose-700">غياب جلسة اليوم</div>
            <div className="text-2xl font-black text-rose-800 mt-1 font-mono">{todayAbsent} طالب</div>
            <div className="text-[10px] text-rose-600 font-bold mt-1">{warningStudents.length} طلاب متصل</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-700">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-teal-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-teal-700">الاشتراكات المحصلة (د.أ)</div>
            <div className="text-2xl font-black text-teal-800 mt-1 font-mono">{totalCollectedJOD} د.أ</div>
            <div className="text-[10px] text-teal-600 font-bold mt-1">الرسم الثابت 15 د.أ شهرياً</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {warningStudents.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 font-black text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>تنبيه عاجل: طلاب تجاوزوا 3 أيام غياب متصل</span>
            </div>
            <span className="text-[11px] bg-rose-200 text-rose-900 font-bold px-2.5 py-0.5 rounded-full">
              {warningStudents.length} طلاب بحاجة لمتابعة ولي الأمر
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {warningStudents.map(st => (
              <div key={st.id} className="bg-white p-3.5 rounded-2xl border border-rose-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{st.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">هاتف: {st.parentPhone1}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-mono font-bold text-xs block">
                    {st.consecutiveAbsent} أيام
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('attendance')}
          className="bg-white hover:bg-emerald-50/50 p-6 rounded-3xl border border-slate-200 text-right space-y-2 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm">سجل حضور وغياب الحلقة</h4>
          <p className="text-xs text-slate-500">
            رصد الحضور بنقرة واحدة، جدول السبت إلى الأربعاء، والتبديل بين الشُعب.
          </p>
        </button>

        <button
          onClick={() => onNavigate('tuition')}
          className="bg-white hover:bg-emerald-50/50 p-6 rounded-3xl border border-slate-200 text-right space-y-2 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:bg-teal-800 group-hover:text-white transition-colors">
            <DollarSign className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm">إدارة الرسوم والاشتراكات</h4>
          <p className="text-xs text-slate-500">
            متابعة دفعات الـ 15 د.أ، الأقساط المجزأة، وحساب الفائض المدفوع مقدماً مع خيار تحويل الطلاب بين الشُعب.
          </p>
        </button>

        <button
          onClick={() => onNavigate('supervisors')}
          className="bg-white hover:bg-emerald-50/50 p-6 rounded-3xl border border-slate-200 text-right space-y-2 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-black text-slate-900 text-sm">شؤون الكادر ودوام المشرفين</h4>
          <p className="text-xs text-slate-500">
            إضافة مشرفين جدد، كشف حضور ودوام الكادر، وتعديل الساعات والبيانات.
          </p>
        </button>
      </div>
    </div>
  );
}

interface AttendanceRegisterProps {
  students: StudentRecord[];
  circles: HalaqahItem[];
  onUpdateAttendance: (studentId: string, day: number, status: 'present' | 'absent' | 'excused' | '') => void;
  onBatchMarkAllPresent: (classId: string, day: number) => void;
  onCommitAttendanceSave: (classId: string, day: number) => void;
  onOpenEnrollModal: () => void;
}

function AttendanceRegister({
  students,
  circles,
  onUpdateAttendance,
  onBatchMarkAllPresent,
  onCommitAttendanceSave,
  onOpenEnrollModal
}: AttendanceRegisterProps) {
  const { user, canAddStudent } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>('h1');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(9);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    if (user?.role === 'class_supervisor' && user.assignedClassId) {
      setSelectedClassId(user.assignedClassId);
    }
  }, [user]);

  const isGeneralSupervisorOrAdmin = user?.role === 'admin' || user?.role === 'gen_supervisor';
  const activeCircle = circles.find(c => c.id === selectedClassId) || circles[0];
  const filteredStudents = students.filter(s => s.classId === selectedClassId);
  const activeSessionDate = OFFICIAL_SCHEDULE_DATES.find(s => s.dayIndex === selectedDayIndex) || OFFICIAL_SCHEDULE_DATES[0];

  const handleToggleStatus = (stId: string, current: string) => {
    let next: 'present' | 'absent' | 'excused' | '' = 'present';
    if (current === 'present') next = 'absent';
    else if (current === 'absent') next = 'excused';
    else if (current === 'excused') next = '';
    else next = 'present';
    onUpdateAttendance(stId, selectedDayIndex, next);
    setIsSavedRecently(false);
  };

  const handleSave = () => {
    onCommitAttendanceSave(selectedClassId, selectedDayIndex);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const presentCount = filteredStudents.filter(s => s.attendanceDays[selectedDayIndex] === 'present').length;
  const absentCount = filteredStudents.filter(s => s.attendanceDays[selectedDayIndex] === 'absent').length;
  const excusedCount = filteredStudents.filter(s => s.attendanceDays[selectedDayIndex] === 'excused').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              دوام الحلقات (السبت – الأربعاء)
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-full">
              الخميس والجمعة عطلة أسبوعية
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            <span>سجل حضور وغياب حلقة:</span>
            <span className="text-emerald-800">{activeCircle?.name}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            المشرف والمعلم: <strong className="text-slate-700">{activeCircle?.teacher}</strong> • المقر: {activeCircle?.room} • الموعد: {activeCircle?.schedule}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onBatchMarkAllPresent(selectedClassId, selectedDayIndex)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تحضير الكل حاضر لليوم</span>
          </button>

          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isSavedRecently
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isSavedRecently ? 'تم الحفظ والتحديث في الداشبورد ✓' : 'حفظ واعتماد الكشف'}</span>
          </button>

          {canAddStudent() && (
            <button
              onClick={onOpenEnrollModal}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>تسجيل طالب جديد</span>
            </button>
          )}
        </div>
      </div>

      {isGeneralSupervisorOrAdmin ? (
        <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-emerald-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>التبديل بين كشوفات الشُعب القرآنية (خاص بالمشرف العام ومدير النظام):</span>
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              إجمالي الشُعب: {circles.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {circles.map(circle => {
              const isSelected = selectedClassId === circle.id;
              const count = students.filter(s => s.classId === circle.id).length;
              return (
                <button
                  key={circle.id}
                  onClick={() => {
                    setSelectedClassId(circle.id);
                    setIsSavedRecently(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500'
                      : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="font-black text-xs truncate">{circle.name}</div>
                  <div className={`text-[11px] truncate ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {circle.teacher}
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/20 text-[10px]">
                    <span className={isSelected ? 'text-emerald-100 font-semibold' : 'text-slate-600'}>
                      {count} طلاب مقيدين
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                      isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {circle.room}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold text-emerald-900">
              أنت معتمد كمشرف لـ ({activeCircle?.name}). تم قفل العرض على حلقتك وفق الصلاحيات الإشرافية.
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-emerald-300 text-emerald-800">
            {filteredStudents.length} طلاب
          </span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-700">تاريخ يوم التحضير:</span>
            <span className="font-black text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              {activeSessionDate.dayName} {activeSessionDate.dateStr}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedDayIndex(prev => Math.max(1, prev - 1))}
              disabled={selectedDayIndex <= 1}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="اليوم السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-600 text-[11px]">
              جلسة رقم {selectedDayIndex} من {OFFICIAL_SCHEDULE_DATES.length}
            </span>
            <button
              onClick={() => setSelectedDayIndex(prev => Math.min(OFFICIAL_SCHEDULE_DATES.length, prev + 1))}
              disabled={selectedDayIndex >= OFFICIAL_SCHEDULE_DATES.length}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              title="اليوم التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {OFFICIAL_SCHEDULE_DATES.map(session => {
            const isSelected = selectedDayIndex === session.dayIndex;
            return (
              <button
                key={session.dayIndex}
                onClick={() => {
                  setSelectedDayIndex(session.dayIndex);
                  setIsSavedRecently(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-center font-bold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-400'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="text-[10px] leading-tight opacity-90">{session.dayName}</div>
                <div className="font-mono text-[11px]">{session.dateStr.slice(5)}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <span className="font-bold text-slate-600">إجمالي طلاب الشعبة:</span>
          <span className="font-mono font-black text-slate-900 text-sm">{filteredStudents.length} طلاب</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <span className="font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> حاضر اليوم:
          </span>
          <span className="font-mono font-black text-emerald-700 text-sm">{presentCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <span className="font-bold text-rose-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> غائب اليوم:
          </span>
          <span className="font-mono font-black text-rose-700 text-sm">{absentCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <span className="font-bold text-amber-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> مستأذن:
          </span>
          <span className="font-mono font-black text-amber-700 text-sm">{excusedCount}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold w-12 text-center">ت</th>
                <th className="p-3.5 font-bold min-w-[200px]">اسم الطالب الثلاثي</th>
                <th className="p-3.5 font-semibold text-center">المرحلة</th>
                <th className="p-3.5 font-semibold text-center">الحفظ</th>
                <th className="p-3.5 font-semibold text-center">حالة الرسوم (15 د.أ)</th>
                <th className="p-3.5 font-semibold text-center">الغياب المتصل</th>
                <th className="p-3.5 font-bold text-center bg-emerald-100/70 text-emerald-950 min-w-[140px]">
                  {activeSessionDate.dayName} {activeSessionDate.dateStr.slice(5)}
                  <span className="block text-[10px] font-normal text-emerald-800">انقر لتغيير الحالة</span>
                </th>
                <th className="p-3.5 font-semibold text-center">هاتف ولي الأمر 1</th>
                <th className="p-3.5 font-semibold text-center">هاتف ولي الأمر 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    لا يوجد طلاب مقيدين في هذه الشعبة بعد.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const currentStatus = st.attendanceDays[selectedDayIndex] || '';
                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <div>{st.name}</div>
                        {st.enrollmentDate && (
                          <div className="text-[10px] text-slate-400 font-normal">تاريخ القيد: {st.enrollmentDate}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-center text-slate-600">{st.grade}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-800">{st.parts} ج</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.tuitionStatus === 'خالص' ? 'bg-emerald-100 text-emerald-800' :
                          st.tuitionStatus === 'مدفوع مقدماً' ? 'bg-blue-100 text-blue-800' :
                          st.tuitionStatus === 'معفى' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {st.tuitionStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.consecutiveAbsent >= 3 ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-400' : 'text-slate-500'
                        }`}>
                          {st.consecutiveAbsent} أيام
                        </span>
                      </td>
                      <td className="p-3.5 text-center bg-emerald-50/40">
                        <button
                          onClick={() => handleToggleStatus(st.id, currentStatus)}
                          className={`w-12 h-10 rounded-xl font-black text-sm transition-all border flex items-center justify-center mx-auto shadow-2xs ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300'
                              : currentStatus === 'absent'
                              ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300'
                              : currentStatus === 'excused'
                              ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300'
                              : 'bg-white text-slate-400 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {currentStatus === 'present' ? '/' : currentStatus === 'absent' ? 'غ' : currentStatus === 'excused' ? 'ع' : '—'}
                        </button>
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-700" dir="ltr">
                        {st.parentPhone1 || '—'}
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-500" dir="ltr">
                        {st.parentPhone2 || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface TuitionViewProps {
  students: StudentRecord[];
  circles: HalaqahItem[];
  onConfirmTuition: (studentId: string, installmentAmount: number, isSettingTotal?: boolean) => void;
  onTransferStudentClass: (studentId: string, newClassId: string) => void;
  tuitionVisibleToSupervisors: boolean;
  onToggleVisibility: () => void;
}

function TuitionManagementView({
  students,
  circles,
  onConfirmTuition,
  onTransferStudentClass,
  tuitionVisibleToSupervisors,
  onToggleVisibility
}: TuitionViewProps) {
  const { user, canConfirmTuition } = useAuth();
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<StudentRecord | null>(null);
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] = useState<StudentRecord | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(15);
  const [paymentMode, setPaymentMode] = useState<'add_installment' | 'set_total'>('add_installment');
  
  const [selectedCircleFilter, setSelectedCircleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const matchesCircle = selectedCircleFilter === 'all' || st.classId === selectedCircleFilter;
      const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            st.parentPhone1.includes(searchQuery);
      return matchesCircle && matchesSearch;
    });
  }, [students, selectedCircleFilter, searchQuery]);

  const totalExpected = filteredStudents.length * 15;
  const totalCollected = filteredStudents.reduce((sum, s) => sum + s.tuitionPaid, 0);
  const totalPending = filteredStudents.filter(s => s.tuitionStatus === 'متبقي قسط').length;

  const openPaymentModal = (st: StudentRecord) => {
    setSelectedStudentForPay(st);
    const remainingTo15 = Math.max(0, 15 - st.tuitionPaid);
    setPaymentAmount(remainingTo15 > 0 ? remainingTo15 : 15);
    setPaymentMode('add_installment');
  };

  const openTransferModal = (st: StudentRecord) => {
    setSelectedStudentForTransfer(st);
    const availableTargets = circles.filter(c => c.id !== st.classId);
    if (availableTargets.length > 0) {
      setTargetClassId(availableTargets[0].id);
    } else if (circles.length > 0) {
      setTargetClassId(circles[0].id);
    }
  };

  const handleApplyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPay) return;
    const amount = Number(paymentAmount) || 0;
    onConfirmTuition(selectedStudentForPay.id, amount, paymentMode === 'set_total');
    setSelectedStudentForPay(null);
  };

  const handleApplyTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForTransfer || !targetClassId) return;
    onTransferStudentClass(selectedStudentForTransfer.id, targetClassId);
    setSelectedStudentForTransfer(null);
  };

  const canTransfer = user?.role === 'admin' || user?.role === 'gen_supervisor';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
            نظام الاشتراكات والرسوم (15 د.أ شهرياً)
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">كشف متابعة الرسوم وسندات القبض ونقل الشُعب</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            العملة المعتمدة: الدينار الأردني (د.أ) • استعراض الرسوم لكافة شُعب المركز، وتوثيق السندات، وإمكانية نقل الطالب لأي من الشُعب المتاحة فورياً.
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'gen_supervisor') && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">رؤية مشرفي الحلقات للرسوم:</span>
            <button
              onClick={onToggleVisibility}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                tuitionVisibleToSupervisors
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {tuitionVisibleToSupervisors ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{tuitionVisibleToSupervisors ? 'مفعلة (متاحة للمشرفين)' : 'محجوبة (خاصة بالإدارة)'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs font-bold text-slate-700 shrink-0">تصفية حسب الشعبة:</span>
          <select
            value={selectedCircleFilter}
            onChange={(e) => setSelectedCircleFilter(e.target.value)}
            className="w-full sm:w-64 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">جميع شُعب المركز ({students.length} طالب)</option>
            {circles.map(c => {
              const count = students.filter(s => s.classId === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({count} طلاب)
                </option>
              );
            })}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب أو رقم الهاتف..."
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-bold">إجمالي الرسوم المتوقعة ({selectedCircleFilter === 'all' ? 'لكل المركز' : 'للشعبة المختارة'})</div>
            <div className="text-xl font-black text-slate-900 mt-1 font-mono">{totalExpected} د.أ</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700 font-bold text-xs">15 د.أ × {filteredStudents.length} طالب</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-700 font-bold">المبالغ المحصلة فعلياً</div>
            <div className="text-xl font-black text-emerald-800 mt-1 font-mono">{totalCollected} د.أ</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 font-bold text-xs">
            {Math.round((totalCollected / (totalExpected || 1)) * 100)}% تحصيل
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-700 font-bold">أقساط متبقية بانتظار السداد</div>
            <div className="text-xl font-black text-amber-800 mt-1 font-mono">{totalPending} طلاب</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-700 font-bold text-xs">متبقي قسط</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-3.5 font-bold w-12 text-center">ت</th>
                <th className="p-3.5 font-bold">اسم الطالب</th>
                <th className="p-3.5 font-semibold text-center">الشعبة القرآنية الحالية</th>
                <th className="p-3.5 font-semibold text-center">الحالة المالية</th>
                <th className="p-3.5 font-semibold text-center">المدفوع</th>
                <th className="p-3.5 font-semibold text-center">المطلوب</th>
                <th className="p-3.5 font-semibold text-center">المتبقي للـ 15 د.أ</th>
                <th className="p-3.5 font-semibold text-center">الفائض / المقدّم</th>
                <th className="p-3.5 font-semibold text-center">هاتف ولي الأمر</th>
                {canConfirmTuition() && (
                  <th className="p-3.5 font-bold text-center">إجراء السداد / القبض</th>
                )}
                {canTransfer && (
                  <th className="p-3.5 font-bold text-center">تحويل الشعبة</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400">
                    لا يوجد طلاب مطابقين لمعايير التصفية المحددة.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const remaining = Math.max(0, 15 - st.tuitionPaid);
                  const currentCircle = circles.find(c => c.id === st.classId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">{st.name}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-[11px] inline-block max-w-[150px] truncate" title={currentCircle?.name}>
                          {currentCircle?.name || 'غير محدد'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          st.tuitionStatus === 'خالص' ? 'bg-emerald-100 text-emerald-800' :
                          st.tuitionStatus === 'مدفوع مقدماً' ? 'bg-blue-100 text-blue-800' :
                          st.tuitionStatus === 'معفى' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {st.tuitionStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-800">{st.tuitionPaid} د.أ</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-700">{st.tuitionTotal} د.أ</td>
                      <td className="p-3.5 text-center font-mono font-bold">
                        {st.tuitionStatus === 'معفى' ? (
                          <span className="text-purple-700">معفى</span>
                        ) : remaining > 0 ? (
                          <span className="text-rose-600 font-bold">{remaining} د.أ متبقية</span>
                        ) : (
                          <span className="text-emerald-700">0 د.أ (خالص)</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-mono text-blue-700 font-bold">
                        {st.advanceAmount && st.advanceAmount > 0 ? `${st.advanceAmount} د.أ` : '0 د.أ'}
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-700" dir="ltr">{st.parentPhone1}</td>
                      {canConfirmTuition() && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => openPaymentModal(st)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 mx-auto"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>قبض دفعة</span>
                          </button>
                        </td>
                      )}
                      {canTransfer && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => openTransferModal(st)}
                            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 mx-auto"
                            title="تحويل الطالب إلى أي من شُعب المركز"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-teal-700" />
                            <span>نقل لشعبة أخرى</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {selectedStudentForPay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  سند قبض وتوثيق مالي
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  تسديد رسوم: {selectedStudentForPay.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForPay(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">الرسم الشهري الثابت:</span>
                <span className="font-mono font-bold text-slate-800">15.00 د.أ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">المسدد سابقاً (الحالي):</span>
                <span className="font-mono font-bold text-emerald-800">{selectedStudentForPay.tuitionPaid} د.أ</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-700 font-bold">المتبقي لاكتمال الشهر:</span>
                <span className="font-mono font-bold text-rose-600">
                  {Math.max(0, 15 - selectedStudentForPay.tuitionPaid)} د.أ
                </span>
              </div>
            </div>

            <form onSubmit={handleApplyPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-2">نوع العملية المالية:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('add_installment')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      paymentMode === 'add_installment'
                        ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-400'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    إضافة دفعة جديدة (+)
                    <span className="block text-[10px] font-normal opacity-80 mt-0.5">تُضاف إلى المسدد السابق</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('set_total')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      paymentMode === 'set_total'
                        ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-400'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    تعديل إجمالي المسدد (=)
                    <span className="block text-[10px] font-normal opacity-80 mt-0.5">تصحيح المبلغ الكلي مباشرة</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {paymentMode === 'add_installment' ? 'مبلغ الدفعة المقبوضة الآن (د.أ) *' : 'إجمالي المبلغ المسدد الجديد (د.أ) *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-sm font-bold text-center"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">اختصار سريع:</span>
                {Math.max(0, 15 - selectedStudentForPay.tuitionPaid) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentAmount(Math.max(0, 15 - selectedStudentForPay.tuitionPaid));
                      setPaymentMode('add_installment');
                    }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold"
                  >
                    سداد المتبقي ({Math.max(0, 15 - selectedStudentForPay.tuitionPaid)} د.أ)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentAmount(15);
                    setPaymentMode('set_total');
                  }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold"
                >
                  تعيين خالص (15 د.أ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentAmount(30);
                    setPaymentMode('set_total');
                  }}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-bold"
                >
                  شهران (30 د.أ)
                </button>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1 text-xs">
                <div className="font-bold flex items-center justify-between">
                  <span>المحصل الإجمالي بعد العملية:</span>
                  <span className="font-mono text-sm font-black">
                    {paymentMode === 'add_installment'
                      ? selectedStudentForPay.tuitionPaid + (Number(paymentAmount) || 0)
                      : Number(paymentAmount) || 0} د.أ
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  {(() => {
                    const finalTotal = paymentMode === 'add_installment'
                      ? selectedStudentForPay.tuitionPaid + (Number(paymentAmount) || 0)
                      : Number(paymentAmount) || 0;
                    if (finalTotal > 15) return `سيتم تسجيل ${finalTotal - 15} د.أ كـ (رصيد فائض / مدفوع مقدماً للأشهر القادمة)`;
                    if (finalTotal === 15) return 'حالة الطالب ستكون: خالص ومسدد لكامل الشهر ✓';
                    return `سيتبقى على الطالب ${15 - finalTotal} د.أ (متبقي قسط)`;
                  })()}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForPay(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد واعتماد القبض</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Transfer Modal */}
      {selectedStudentForTransfer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-bold">
                  إعادة توزيع ونقل الشُعب القرآنية
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  تحويل ونقل الطالب: {selectedStudentForTransfer.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForTransfer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">الشعبة الحالية المقيد بها:</span>
                <span className="font-bold text-slate-900 bg-slate-200/70 px-2.5 py-0.5 rounded-lg">
                  {circles.find(c => c.id === selectedStudentForTransfer.classId)?.name || 'غير محدد'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">الرصيد المالي المحفوظ:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {selectedStudentForTransfer.tuitionPaid} د.أ ({selectedStudentForTransfer.tuitionStatus})
                </span>
              </div>
              <div className="text-[11px] text-teal-800 bg-teal-50 p-2.5 rounded-xl border border-teal-200 font-medium">
                💡 يتم نقل الطالب تلقائياً مع كامل بياناته المالية وتاريخ التسجيل وأرقام أولياء الأمور وسجل الحضور إلى الشعبة الجديدة.
              </div>
            </div>

            <form onSubmit={handleApplyTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  اختر الشعبة / الحلقة القرآنية المراد النقل إليها (متاح كل شُعب المركز): *
                </label>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {circles.map(c => {
                    const isCurrent = c.id === selectedStudentForTransfer.classId;
                    const enrolledCount = students.filter(s => s.classId === c.id).length;
                    const isSelected = targetClassId === c.id;

                    return (
                      <label
                        key={c.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-400'
                            : 'bg-white border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="targetCircle"
                            value={c.id}
                            disabled={isCurrent}
                            checked={isSelected}
                            onChange={() => setTargetClassId(c.id)}
                            className="text-emerald-700 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-normal">
                                  الحلقة الحالية
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              المشرف: {c.teacher} • {c.room} • {c.schedule}
                            </div>
                          </div>
                        </div>

                        <div className="text-left font-mono shrink-0">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                            enrolledCount >= c.capacity ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {enrolledCount} / {c.capacity} طالب
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForTransfer(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!targetClassId || targetClassId === selectedStudentForTransfer.classId}
                  className="px-5 py-2 rounded-xl text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-40 font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>تأكيد النقل للشعبة المحددة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface ClassesViewProps {
  circles: HalaqahItem[];
  students: StudentRecord[];
  onAddCircle: (circle: HalaqahItem) => void;
  onUpdateCircle: (circle: HalaqahItem) => void;
}

function ClassesManagementView({ circles, students, onAddCircle, onUpdateCircle }: ClassesViewProps) {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCircle, setEditingCircle] = useState<HalaqahItem | null>(null);

  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room, setRoom] = useState('');
  const [capacity, setCapacity] = useState(15);
  const [level, setLevel] = useState('المتوسط');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teacher.trim()) return;
    const newCircle: HalaqahItem = {
      id: `h${Date.now()}`,
      name,
      teacher,
      room: room || 'قاعة قرآنية',
      capacity: Number(capacity) || 15,
      schedule: 'السبت - الأربعاء (عصراً)',
      level
    };
    onAddCircle(newCircle);
    setIsCreateModalOpen(false);
    setName('');
    setTeacher('');
    setRoom('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCircle) return;
    onUpdateCircle(editingCircle);
    setEditingCircle(null);
  };

  const canEditCircles = user?.role === 'admin' || user?.role === 'gen_supervisor';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
            الهيكل التنظيمي للحلقات والشُعب
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">إدارة الشُعب وتعديل بيانات الحلقات</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تعديل بيانات الحلقات والقاعات، تعيين المشرفين والمعلمين، ومراقبة الطاقة الاستيعابية.
          </p>
        </div>

        {canEditCircles && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء وتأسيس حلقة جديدة</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {circles.map(c => {
          const enrolled = students.filter(s => s.classId === c.id).length;
          const percent = Math.min(100, Math.round((enrolled / (c.capacity || 1)) * 100));
          return (
            <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-900">{c.name}</h3>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">المشرف: {c.teacher}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 font-mono font-bold text-slate-700 px-2.5 py-1 rounded-xl">
                    {c.room}
                  </span>
                  {canEditCircles && (
                    <button
                      onClick={() => setEditingCircle({ ...c })}
                      className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                      title="تعديل معلومات الحلقة"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-600">
                  <span>نسبة الإشغال:</span>
                  <span className="font-mono">{enrolled} من {c.capacity} طلاب ({percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>الجدول: {c.schedule}</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {c.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">تأسيس حلقة قرآنية جديدة</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الحلقة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثال: حلقة الإمام قالون"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المشرف / المعلم *</label>
                <input
                  type="text"
                  required
                  value={teacher}
                  onChange={e => setTeacher(e.target.value)}
                  placeholder="اسم الشيخ المشرف"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القاعة</label>
                  <input
                    type="text"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="قاعة 105"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الطاقة الاستيعابية</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    min="5"
                    max="30"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 font-bold"
                >
                  حفظ وتأسيس الحلقة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCircle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  تحديث بيانات الشعبة
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  تعديل معلومات الحلقة: {editingCircle.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingCircle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الحلقة والشعبة *</label>
                <input
                  type="text"
                  required
                  value={editingCircle.name}
                  onChange={e => setEditingCircle({ ...editingCircle, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشيخ المشرف والمعلم *</label>
                <input
                  type="text"
                  required
                  value={editingCircle.teacher}
                  onChange={e => setEditingCircle({ ...editingCircle, teacher: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القاعة / المقر</label>
                  <input
                    type="text"
                    value={editingCircle.room}
                    onChange={e => setEditingCircle({ ...editingCircle, room: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الطاقة الاستيعابية</label>
                  <input
                    type="number"
                    value={editingCircle.capacity}
                    onChange={e => setEditingCircle({ ...editingCircle, capacity: Number(e.target.value) })}
                    min="5"
                    max="50"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مواعيد الحلقة وجدول الدوام</label>
                <input
                  type="text"
                  value={editingCircle.schedule}
                  onChange={e => setEditingCircle({ ...editingCircle, schedule: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المستوى التعليمي / الفئة</label>
                <input
                  type="text"
                  value={editingCircle.level}
                  onChange={e => setEditingCircle({ ...editingCircle, level: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCircle(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface AddSupervisorModalProps {
  circles: HalaqahItem[];
  onClose: () => void;
  onSave: (sup: SupervisorRecord) => void;
}

function AddSupervisorModal({ circles, onClose, onSave }: AddSupervisorModalProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [role, setRole] = useState<UserRole>('class_supervisor');
  const [assignedClassId, setAssignedClassId] = useState<string>(circles[0]?.id || '');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hireDate, setHireDate] = useState('2026-10-13');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !nationalId.trim()) return;

    const selectedCircle = circles.find(c => c.id === assignedClassId);
    let roleTitle = 'مشرف حلقة قرآنية';
    if (role === 'admin') roleTitle = 'مسؤول النظام IT Admin';
    if (role === 'gen_supervisor') roleTitle = 'المشرف العام ورئيس الحلقات';

    const newSupervisor: SupervisorRecord = {
      id: `sup${Date.now()}`,
      name,
      username: username.trim() || `user_${Date.now().toString().slice(-4)}`,
      phone,
      email: email.trim() || `${Date.now()}@qurancenter.jo`,
      nationalId,
      role,
      roleTitle,
      assignedClassId: role === 'class_supervisor' ? assignedClassId : undefined,
      assignedClassName: role === 'class_supervisor' && selectedCircle ? selectedCircle.name : undefined,
      qualification: qualification.trim() || 'إجازة في تلاوة وتجويد القرآن الكريم',
      specialization: specialization.trim() || 'تحفيظ القرآن وتصحيح التلاوة',
      hireDate,
      isActive: true
    };

    onSave(newSupervisor);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              كادر التدريس والإشراف
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">
              إضافة وتسجيل مشرف / معلم جديد
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الاسم الكامل الثلاثي *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: فضيلة الشيخ أحمد مصطفى ذيابات"
              className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المستخدم (للدخول) *</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ahmad_theabat"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">الدور والصلاحية *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white"
              >
                <option value="class_supervisor">مشرف حلقة قرآنية</option>
                <option value="gen_supervisor">المشرف العام ومساعده</option>
                <option value="admin">مسؤول النظام IT Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم الهاتف (أردني) *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0791234567"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">الرقم الوطني *</label>
              <input
                type="text"
                required
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                placeholder="9951010202"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teacher@qurancenter.jo"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ المباشرة والتعيين</label>
              <input
                type="date"
                value={hireDate}
                onChange={e => setHireDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          {role === 'class_supervisor' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">الشعبة / الحلقة المسندة إليه *</label>
              <select
                value={assignedClassId}
                onChange={e => setAssignedClassId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white"
              >
                {circles.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.room})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">المؤهل القرآني والإجازة بالسند</label>
            <input
              type="text"
              value={qualification}
              onChange={e => setQualification(e.target.value)}
              placeholder="مثال: إجازة برواية حفص عن عاصم بالسند المتصل إلى رسول الله ﷺ"
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">التخصص الدقيق وطريقة التحفيظ</label>
            <input
              type="text"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              placeholder="مثال: إتقان التجويد وتثبيت القرآن بالقراءات"
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 font-bold flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة واعتماد المشرف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SupViewProps {
  supervisors: SupervisorRecord[];
  shifts: ShiftRecord[];
  circles: HalaqahItem[];
  students: StudentRecord[];
  onToggleActive: (supId: string) => void;
  onUpdateSupervisor: (updatedSup: SupervisorRecord) => void;
  onAddSupervisor: (newSup: SupervisorRecord) => void;
  onAdjustShift: (shiftId: string, start: string, end: string, status: any) => void;
}

function SupervisorsManagementView({
  supervisors,
  shifts,
  circles,
  students,
  onToggleActive,
  onUpdateSupervisor,
  onAddSupervisor,
  onAdjustShift
}: SupViewProps) {
  const { user, canManageSupervisors } = useAuth();
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState<ShiftRecord | null>(null);
  const [editingSupervisor, setEditingSupervisor] = useState<SupervisorRecord | null>(null);
  const [isAddSupervisorOpen, setIsAddSupervisorOpen] = useState(false);
  
  // Tab within supervisor view: "كشف المشرفين" vs "سجل حضور ودوام الكادر"
  const [supervisorSubTab, setSupervisorSubTab] = useState<'roster' | 'attendance'>('roster');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSupervisors = useMemo(() => {
    return supervisors.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      (s.assignedClassName && s.assignedClassName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [supervisors, searchQuery]);

  const handleSaveSupervisorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupervisor) return;
    onUpdateSupervisor(editingSupervisor);
    setEditingSupervisor(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Add Supervisor Button */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
            شؤون الكادر والمشرفين
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">كشف وبيانات مشرفي الشُعب وسجل حضورهم</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إضافة مشرفين جدد، استعراض وتعديل ملفات الكادر، ومتابعة كشف دوام وحضور المشرفين واعتماد الساعات.
          </p>
        </div>

        {canManageSupervisors() && (
          <button
            onClick={() => setIsAddSupervisorOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مشرف جديد</span>
          </button>
        )}
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setSupervisorSubTab('roster')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              supervisorSubTab === 'roster'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>كشف وبيانات المشرفين ({supervisors.length})</span>
          </button>

          <button
            onClick={() => setSupervisorSubTab('attendance')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              supervisorSubTab === 'attendance'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>كشف وسجل حضور دوام المشرفين ({shifts.length})</span>
          </button>
        </div>

        {supervisorSubTab === 'roster' && (
          <div className="relative w-64 hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم المشرف أو الهاتف..."
              className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Supervisors Profile Cards */}
      {supervisorSubTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSupervisors.map(sup => {
            const circle = circles.find(c => c.id === sup.assignedClassId);
            const studentCount = circle ? students.filter(s => s.classId === circle.id).length : 0;
            return (
              <div key={sup.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{sup.name}</h3>
                    <div className="text-xs text-emerald-800 font-bold mt-0.5">{sup.roleTitle}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sup.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sup.isActive ? 'حساب مفعّل' : 'معلّق مؤقتاً'}
                    </span>
                    {canManageSupervisors() && (
                      <button
                        onClick={() => setEditingSupervisor({ ...sup })}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-600 transition-colors"
                        title="تعديل بيانات المشرف"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">الشعبة المسندة:</span>
                    <span className="font-bold text-slate-800 truncate block">{sup.assignedClassName || 'غير مسند'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">عدد طلاب الحلقة:</span>
                    <span className="font-bold font-mono text-emerald-800">{studentCount} طلاب</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">رقم الهاتف:</span>
                    <span className="font-mono text-slate-800" dir="ltr">{sup.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الرقم الوطني:</span>
                    <span className="font-mono text-slate-800">{sup.nationalId}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px]">المؤهل القرآني والتخصص:</span>
                    <span className="font-bold text-slate-800 block truncate">{sup.qualification} • {sup.specialization}</span>
                  </div>
                </div>

                {canManageSupervisors() && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleActive(sup.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          sup.isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {sup.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      </button>

                      <button
                        onClick={() => setEditingSupervisor({ ...sup })}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل البيانات</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">تاريخ المباشرة: {sup.hireDate}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Dedicated Staff Shift & Attendance Log View */}
      {supervisorSubTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-bold">إجمالي الفترات المرصودة</div>
                <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">{shifts.length} فترة</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-700 font-bold">فترات معتمدة إدارياً</div>
                <div className="text-xl font-black text-emerald-800 mt-0.5 font-mono">
                  {shifts.filter(s => s.isApproved).length} فترة
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-700 font-bold">فترات بانتظار الاعتماد</div>
                <div className="text-xl font-black text-amber-800 mt-0.5 font-mono">
                  {shifts.filter(s => !s.isApproved).length} فترة
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>كشف دوام وحضور المشرفين التفصيلي (السبت - الأربعاء)</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">تحديث آلي فوري</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 font-bold">المشرف</th>
                    <th className="p-3.5 font-semibold text-center">التاريخ</th>
                    <th className="p-3.5 font-semibold text-center">وقت الحضور</th>
                    <th className="p-3.5 font-semibold text-center">وقت الانصراف</th>
                    <th className="p-3.5 font-semibold text-center">المدة الإجمالية</th>
                    <th className="p-3.5 font-semibold text-center">حالة الالتزام</th>
                    <th className="p-3.5 font-semibold text-center">الاعتماد الإداري</th>
                    {(user?.role === 'admin' || user?.role === 'gen_supervisor') && (
                      <th className="p-3.5 font-bold text-center">تعديل واعتماد</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shifts.map(sh => (
                    <tr key={sh.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{sh.supervisorName}</td>
                      <td className="p-3.5 text-center font-mono text-slate-600">{sh.date}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-800">{sh.startTime}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-700">{sh.endTime}</td>
                      <td className="p-3.5 text-center font-mono text-slate-600">{sh.duration}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sh.status === 'حاضر في الموعد' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sh.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          sh.isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {sh.isApproved ? 'معتمد ✓' : 'قيد الاعتماد'}
                        </span>
                      </td>
                      {(user?.role === 'admin' || user?.role === 'gen_supervisor') && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedShiftForEdit(sh)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                          >
                            تعديل وتصحيح
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Supervisor Profile Modal */}
      {editingSupervisor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  تحديث ملف المشرف
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  تعديل بيانات: {editingSupervisor.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingSupervisor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupervisorEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={editingSupervisor.name}
                  onChange={e => setEditingSupervisor({ ...editingSupervisor, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={editingSupervisor.phone}
                    onChange={e => setEditingSupervisor({ ...editingSupervisor, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم الوطني *</label>
                  <input
                    type="text"
                    required
                    value={editingSupervisor.nationalId}
                    onChange={e => setEditingSupervisor({ ...editingSupervisor, nationalId: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editingSupervisor.email}
                    onChange={e => setEditingSupervisor({ ...editingSupervisor, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشعبة المسندة للمشرف</label>
                  <select
                    value={editingSupervisor.assignedClassId || ''}
                    onChange={e => {
                      const selectedId = e.target.value;
                      const selectedCircle = circles.find(c => c.id === selectedId);
                      setEditingSupervisor({
                        ...editingSupervisor,
                        assignedClassId: selectedId,
                        assignedClassName: selectedCircle ? selectedCircle.name : ''
                      });
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="">بدون شعبة (مشرف عام / إدارة)</option>
                    {circles.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المؤهل القرآني والشهادة</label>
                <input
                  type="text"
                  value={editingSupervisor.qualification}
                  onChange={e => setEditingSupervisor({ ...editingSupervisor, qualification: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  placeholder="مثال: إجازة برواية حفص عن عاصم بالسند المتصل"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التخصص الدقيق</label>
                <input
                  type="text"
                  value={editingSupervisor.specialization}
                  onChange={e => setEditingSupervisor({ ...editingSupervisor, specialization: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  placeholder="مثال: أحكام التجويد ومخارج الحروف"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSupervisor(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ تعديلات المشرف</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shift Modal */}
      {selectedShiftForEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              تعديل دوام: {selectedShiftForEdit.supervisorName}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">وقت الحضور</label>
                <input
                  type="time"
                  id="shift-start-input"
                  defaultValue={selectedShiftForEdit.startTime}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وقت الانصراف</label>
                <input
                  type="time"
                  id="shift-end-input"
                  defaultValue={selectedShiftForEdit.endTime}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">حالة الانضباط</label>
                <select id="shift-status-select" defaultValue={selectedShiftForEdit.status} className="w-full p-2.5 border border-slate-300 rounded-xl font-bold">
                  <option value="حاضر في الموعد">حاضر في الموعد</option>
                  <option value="متأخر بعذر">متأخر بعذر</option>
                  <option value="انصراف مبكر">انصراف مبكر</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setSelectedShiftForEdit(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    const start = (document.getElementById('shift-start-input') as HTMLInputElement).value;
                    const end = (document.getElementById('shift-end-input') as HTMLInputElement).value;
                    const status = (document.getElementById('shift-status-select') as HTMLSelectElement).value;
                    onAdjustShift(selectedShiftForEdit.id, start, end, status);
                    setSelectedShiftForEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 font-bold"
                >
                  اعتماد التعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Supervisor Modal */}
      {isAddSupervisorOpen && (
        <AddSupervisorModal
          circles={circles}
          onClose={() => setIsAddSupervisorOpen(false)}
          onSave={(newSup) => {
            onAddSupervisor(newSup);
            setIsAddSupervisorOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface EnrollModalProps {
  circles: HalaqahItem[];
  onClose: () => void;
  onSave: (st: StudentRecord) => void;
}

function StudentEnrollModal({ circles, onClose, onSave }: EnrollModalProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('الخامس الأساسي');
  const [classId, setClassId] = useState(circles[0]?.id || 'h1');
  const [parts, setParts] = useState(1);
  const [tuitionPaid, setTuitionPaid] = useState(15);
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [enrollDate, setEnrollDate] = useState('2026-10-13');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let status: 'خالص' | 'متبقي قسط' | 'معفى' | 'مدفوع مقدماً' = 'خالص';
    let advance = 0;
    if (tuitionPaid > 15) {
      status = 'مدفوع مقدماً';
      advance = tuitionPaid - 15;
    } else if (tuitionPaid === 15) {
      status = 'خالص';
    } else {
      status = 'متبقي قسط';
    }

    const newStudent: StudentRecord = {
      id: `s${Date.now()}`,
      name,
      grade,
      classId,
      parts: Number(parts) || 1,
      tuitionStatus: status,
      tuitionPaid: Number(tuitionPaid) || 0,
      tuitionTotal: 15,
      advanceAmount: advance,
      consecutiveAbsent: 0,
      parentPhone1: phone1 || '0790000000',
      parentPhone2: phone2 || '',
      enrollmentDate: enrollDate,
      attendanceDays: {}
    };

    onSave(newStudent);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <h3 className="text-lg font-black text-slate-900">تسجيل وقيد طالب جديد في الحلقات</h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اسم الطالب الثلاثي *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: يحيى أحمد محمود القضاة"
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المرحلة الدراسية</label>
              <input
                type="text"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ التسجيل</label>
              <input
                type="date"
                value={enrollDate}
                onChange={e => setEnrollDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الشعبة / الحلقة</label>
              <select
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
              >
                {circles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">مقدار الحفظ (أجزاء)</label>
              <input
                type="number"
                value={parts}
                onChange={e => setParts(Number(e.target.value))}
                min="0"
                max="30"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الرسم المدفوع (د.أ)</label>
              <input
                type="number"
                value={tuitionPaid}
                onChange={e => setTuitionPaid(Number(e.target.value))}
                step="0.5"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">هاتف ولي الأمر 1 *</label>
              <input
                type="text"
                required
                value={phone1}
                onChange={e => setPhone1(e.target.value)}
                placeholder="079xxxxxxx"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">هاتف ولي الأمر 2 (اختياري)</label>
            <input
              type="text"
              value={phone2}
              onChange={e => setPhone2(e.target.value)}
              placeholder="078xxxxxxx"
              className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
              dir="ltr"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 font-bold"
            >
              اعتماد وقيد الطالب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession>(INITIAL_SUPERVISORS[1] as any);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [circles, setCircles] = useState<HalaqahItem[]>(INITIAL_CIRCLES);
  const [supervisors, setSupervisors] = useState<SupervisorRecord[]>(INITIAL_SUPERVISORS);
  const [shifts, setShifts] = useState<ShiftRecord[]>(INITIAL_SHIFTS);
  const [tuitionVisibleToSupervisors, setTuitionVisibleToSupervisors] = useState<boolean>(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const loginAs = (role: UserRole) => {
    const found = supervisors.find(s => s.role === role) || supervisors[0];
    setCurrentUser(found as any);
  };

  const logout = () => {
    loginAs('class_supervisor');
  };

  const canAddStudent = () => currentUser.role === 'admin' || currentUser.role === 'gen_supervisor';
  const canManageSupervisors = () => currentUser.role === 'admin' || currentUser.role === 'gen_supervisor';
  const canConfirmTuition = () => currentUser.role === 'admin' || currentUser.role === 'gen_supervisor';
  const canViewTuition = () => currentUser.role !== 'class_supervisor' || tuitionVisibleToSupervisors;

  const handleUpdateAttendance = (studentId: string, day: number, status: 'present' | 'absent' | 'excused' | '') => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const nextDays = { ...s.attendanceDays, [day]: status };
      let consecutive = 0;
      for (let d = day; d >= 1; d--) {
        if (nextDays[d] === 'absent') consecutive++;
        else break;
      }
      return { ...s, attendanceDays: nextDays, consecutiveAbsent: consecutive };
    }));
  };

  const handleBatchMarkAllPresent = (classId: string, day: number) => {
    setStudents(prev => prev.map(s => {
      if (s.classId !== classId) return s;
      return {
        ...s,
        attendanceDays: { ...s.attendanceDays, [day]: 'present' },
        consecutiveAbsent: 0
      };
    }));
  };

  const handleCommitAttendanceSave = (classId: string, day: number) => {
    // Attendance updates are synced to the dashboard
  };

  const handleConfirmTuition = (studentId: string, amount: number, isSettingTotal: boolean = false) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const newPaid = isSettingTotal ? amount : (s.tuitionPaid + amount);
      let status: 'خالص' | 'متبقي قسط' | 'معفى' | 'مدفوع مقدماً' = 'خالص';
      let advance = 0;
      
      if (newPaid > 15) {
        status = 'مدفوع مقدماً';
        advance = newPaid - 15;
      } else if (newPaid === 15) {
        status = 'خالص';
        advance = 0;
      } else {
        status = 'متبقي قسط';
        advance = 0;
      }
      return { ...s, tuitionPaid: newPaid, tuitionStatus: status, advanceAmount: advance };
    }));
  };

  const handleTransferStudentClass = (studentId: string, newClassId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      return { ...s, classId: newClassId };
    }));
  };

  const handleUpdateCircle = (updatedCircle: HalaqahItem) => {
    setCircles(prev => prev.map(c => c.id === updatedCircle.id ? updatedCircle : c));
    setSupervisors(prev => prev.map(sup => {
      if (sup.assignedClassId === updatedCircle.id) {
        return {
          ...sup,
          assignedClassName: updatedCircle.name,
          name: updatedCircle.teacher
        };
      }
      return sup;
    }));
  };

  const handleUpdateSupervisor = (updatedSup: SupervisorRecord) => {
    setSupervisors(prev => prev.map(s => s.id === updatedSup.id ? updatedSup : s));
    
    if (updatedSup.assignedClassId) {
      setCircles(prev => prev.map(c => {
        if (c.id === updatedSup.assignedClassId) {
          return { ...c, teacher: updatedSup.name };
        }
        return c;
      }));
    }

    if (currentUser.id === updatedSup.id) {
      setCurrentUser(prev => ({
        ...prev,
        name: updatedSup.name,
        assignedClassId: updatedSup.assignedClassId,
        assignedClassName: updatedSup.assignedClassName
      }));
    }
  };

  const handleAddSupervisor = (newSup: SupervisorRecord) => {
    setSupervisors(prev => [newSup, ...prev]);
    if (newSup.assignedClassId) {
      setCircles(prev => prev.map(c => {
        if (c.id === newSup.assignedClassId) {
          return { ...c, teacher: newSup.name };
        }
        return c;
      }));
    }
  };

  const handleAdjustShift = (shiftId: string, start: string, end: string, status: any) => {
    setShifts(prev => prev.map(sh => {
      if (sh.id !== shiftId) return sh;
      return { ...sh, startTime: start, endTime: end, status, isApproved: true };
    }));
  };

  const handleToggleActive = (supId: string) => {
    setSupervisors(prev => prev.map(s => s.id === supId ? { ...s, isActive: !s.isActive } : s));
  };

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      loginAs,
      logout,
      canAddStudent,
      canManageSupervisors,
      canConfirmTuition,
      canViewTuition
    }}>
      <ClassicDashboardLayout
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenEnrollStudent={() => setIsEnrollModalOpen(true)}
        tuitionVisible={tuitionVisibleToSupervisors}
      >
        {activeTab === 'dashboard' && (
          <DashboardOverview
            students={students}
            circles={circles}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceRegister
            students={students}
            circles={circles}
            onUpdateAttendance={handleUpdateAttendance}
            onBatchMarkAllPresent={handleBatchMarkAllPresent}
            onCommitAttendanceSave={handleCommitAttendanceSave}
            onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
          />
        )}

        {activeTab === 'tuition' && canViewTuition() && (
          <TuitionManagementView
            students={students}
            circles={circles}
            onConfirmTuition={handleConfirmTuition}
            onTransferStudentClass={handleTransferStudentClass}
            tuitionVisibleToSupervisors={tuitionVisibleToSupervisors}
            onToggleVisibility={() => setTuitionVisibleToSupervisors(!tuitionVisibleToSupervisors)}
          />
        )}

        {activeTab === 'classes' && (
          <ClassesManagementView
            circles={circles}
            students={students}
            onAddCircle={(newCircle) => setCircles(prev => [...prev, newCircle])}
            onUpdateCircle={handleUpdateCircle}
          />
        )}

        {activeTab === 'supervisors' && (
          <SupervisorsManagementView
            supervisors={supervisors}
            shifts={shifts}
            circles={circles}
            students={students}
            onToggleActive={handleToggleActive}
            onUpdateSupervisor={handleUpdateSupervisor}
            onAddSupervisor={handleAddSupervisor}
            onAdjustShift={handleAdjustShift}
          />
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3 max-w-xl mx-auto my-12">
            <FileText className="w-12 h-12 text-emerald-700 mx-auto" />
            <h3 className="font-black text-slate-900 text-lg">التقارير والمخرجات الرسمية</h3>
            <p className="text-xs text-slate-500">
              يمكنك تصدير كشوف الحضور والغياب وكشوف الاشتراكات المالية بالدينار الأردني مباشرة بصيغة PDF أو Excel جاهزة للطباعة.
            </p>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الحلقات الرسمي</span>
            </button>
          </div>
        )}
      </ClassicDashboardLayout>

      {/* Student Enrollment Modal */}
      {isEnrollModalOpen && (
        <StudentEnrollModal
          circles={circles}
          onClose={() => setIsEnrollModalOpen(false)}
          onSave={(newStudent) => {
            setStudents(prev => [newStudent, ...prev]);
            setIsEnrollModalOpen(false);
          }}
        />
      )}
    </AuthContext.Provider>
  );
}