import { EmployeeManager } from '@/components/admin/EmployeeManager';

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Çalışan Yönetimi</h1>
      <EmployeeManager />
    </div>
  );
}
