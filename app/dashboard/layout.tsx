import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { SessionGuard } from '@/components/dashboard/SessionGuard';
import { PresenceTracker } from '@/components/common/PresenceTracker';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, role')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SessionGuard />
      <PresenceTracker userId={user.id} fullName={profile.full_name ?? profile.username} />
      <Header username={profile.username} role={profile.role} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
