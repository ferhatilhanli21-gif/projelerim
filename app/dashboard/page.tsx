import { createClient } from '@/lib/supabase/server';
import { ClockInOutCard } from '@/components/dashboard/ClockInOutCard';
import { RecentSessions } from '@/components/dashboard/RecentSessions';
import Link from 'next/link';
import { MessageCircle, Users, FileText, Megaphone, Calendar, StickyNote, BrainCircuit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const quickLinks = [
  { href: '/dashboard/workspace', icon: BrainCircuit, label: 'AI Asistan', desc: 'ChatGPT · Gemini · Claude' },
  { href: '/dashboard/messages', icon: MessageCircle, label: 'Mesajlar', desc: 'Admin ile özel mesaj' },
  { href: '/dashboard/group-chat', icon: Users, label: 'Grup Sohbet', desc: 'Tüm ekip ile konuş' },
  { href: '/dashboard/notes', icon: StickyNote, label: 'Günlük Not', desc: 'Bugün ne yaptın?' },
  { href: '/dashboard/announcements', icon: Megaphone, label: 'Duyurular', desc: 'Haberleri gör' },
  { href: '/dashboard/leave-request', icon: Calendar, label: 'İzin Bildir', desc: 'İzin / geç kalma' },
  { href: '/dashboard/reports', icon: FileText, label: 'Raporlarım', desc: 'Çalışma geçmişi' },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Merhaba, {profile?.full_name} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Bugün nasıl geçiyor?</p>
      </div>

      <ClockInOutCard userId={user!.id} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickLinks.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center gap-3 py-4">
                <div className={`p-2 rounded-lg flex-shrink-0 ${href === '/dashboard/workspace' ? 'bg-purple-100' : 'bg-red-100'}`}>
                  <Icon className={`h-5 w-5 ${href === '/dashboard/workspace' ? 'text-purple-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <RecentSessions userId={user!.id} />
    </div>
  );
}
