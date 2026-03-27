import { StatsCards } from '@/components/admin/StatsCards';
import { ActiveNow } from '@/components/admin/ActiveNow';
import Link from 'next/link';
import { Users, FileText, MessageCircle, Megaphone, Calendar, StickyNote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const adminLinks = [
  { href: '/admin/employees', icon: Users, label: 'Çalışanlar', desc: 'Ekle, düzenle, sil' },
  { href: '/admin/reports', icon: FileText, label: 'Raporlar', desc: 'Görüntüle ve aktar' },
  { href: '/admin/messages', icon: MessageCircle, label: 'Mesajlar', desc: 'Çalışanlarla özel mesaj' },
  { href: '/admin/group-chat', icon: MessageCircle, label: 'Genel Sohbet', desc: 'Tüm ekiple konuş' },
  { href: '/admin/announcements', icon: Megaphone, label: 'Duyurular', desc: 'Yayınla ve yönet' },
  { href: '/admin/leave-requests', icon: Calendar, label: 'İzin Talepleri', desc: 'Onayla veya reddet' },
  { href: '/admin/notes', icon: StickyNote, label: 'Çalışan Notları', desc: 'Günlük notları gör' },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Admin Paneli</h1>

      <StatsCards />
      <ActiveNow />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {adminLinks.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="p-3 bg-red-100 rounded-lg flex-shrink-0">
                  <Icon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
