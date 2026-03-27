import * as XLSX from 'xlsx';
import { ExportData } from '@/types';

export function exportToExcel(data: ExportData[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data, {
    header: ['employeeName', 'date', 'clockIn', 'clockOut', 'duration', 'totalHours'],
  });

  ws['A1'].v = 'Çalışan Adı';
  ws['B1'].v = 'Tarih';
  ws['C1'].v = 'Giriş Saati';
  ws['D1'].v = 'Çıkış Saati';
  ws['E1'].v = 'Süre';
  ws['F1'].v = 'Toplam Saat';

  ws['!cols'] = [
    { wch: 20 }, { wch: 12 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Çalışma Raporu');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
