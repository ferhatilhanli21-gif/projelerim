import { PublicHeader } from '@/components/layout/PublicHeader';
import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient';

export const revalidate = 30;

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Liderlik Tablosu
        </h1>
        <LeaderboardClient />
      </main>
    </div>
  );
}
