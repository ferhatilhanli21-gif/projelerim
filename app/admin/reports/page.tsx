import { ReportsClient } from '@/components/admin/ReportsClient';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Raporlar</h1>
      <ReportsClient />
    </div>
  );
}
