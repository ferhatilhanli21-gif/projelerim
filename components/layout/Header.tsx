'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { createClient } from '@/lib/supabase/client';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  username: string;
  role: 'admin' | 'employee';
}

export function Header({ username, role }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    // Açık mesai varsa önce durdur
    await fetch('/api/sessions/clock-out', { method: 'POST' }).catch(() => {});
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sticky top-0 z-50">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href={role === 'admin' ? '/admin' : '/dashboard'}>
            <Logo size="sm" />
          </Link>
          {role === 'admin' ? (
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-gray-600 hover:text-red-600 transition-colors">Panel</Link>
              <Link href="/admin/employees" className="text-gray-600 hover:text-red-600 transition-colors">Çalışanlar</Link>
              <Link href="/admin/reports" className="text-gray-600 hover:text-red-600 transition-colors">Raporlar</Link>
              <Link href="/admin/messages" className="text-gray-600 hover:text-red-600 transition-colors">Mesajlar</Link>
              <Link href="/admin/group-chat" className="text-gray-600 hover:text-red-600 transition-colors">Sohbet</Link>
              <Link href="/admin/leave-requests" className="text-gray-600 hover:text-red-600 transition-colors">İzinler</Link>
              <Link href="/admin/announcements" className="text-gray-600 hover:text-red-600 transition-colors">Duyurular</Link>
              <Link href="/admin/notes" className="text-gray-600 hover:text-red-600 transition-colors">Notlar</Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="text-gray-600 hover:text-red-600 transition-colors">Panel</Link>
              <Link href="/dashboard/messages" className="text-gray-600 hover:text-red-600 transition-colors">Mesajlar</Link>
              <Link href="/dashboard/group-chat" className="text-gray-600 hover:text-red-600 transition-colors">Sohbet</Link>
              <Link href="/dashboard/notes" className="text-gray-600 hover:text-red-600 transition-colors">Notlarım</Link>
              <Link href="/dashboard/leave-request" className="text-gray-600 hover:text-red-600 transition-colors">İzin Bildir</Link>
              <Link href="/dashboard/announcements" className="text-gray-600 hover:text-red-600 transition-colors">Duyurular</Link>
              <Link href="/dashboard/workspace" className="text-gray-600 hover:text-red-600 transition-colors font-medium">🤖 AI</Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg px-2.5 h-8 text-sm font-medium hover:bg-muted transition-colors">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{username}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
