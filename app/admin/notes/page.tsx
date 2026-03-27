'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DailyNote, Profile } from '@/types';
import { formatDate } from '@/lib/duration';

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState('all');

  useEffect(() => {
    fetch('/api/admin/employees').then(r => r.json()).then(d => setEmployees(d.employees ?? []));
  }, []);

  async function loadNotes() {
    const params = selectedUser !== 'all' ? `?user=${selectedUser}` : '';
    fetch(`/api/daily-notes${params}`).then(r => r.json()).then(d => setNotes(d.notes ?? []));
  }

  useEffect(() => { loadNotes(); }, [selectedUser]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">📝 Çalışan Notları</h1>
        <Select value={selectedUser} onValueChange={v => setSelectedUser(v ?? 'all')}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Çalışanlar</SelectItem>
            {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">Henüz not yok.</p>
      ) : notes.map(n => (
        <Card key={n.id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">{n.profiles?.full_name}</span>
              <span className="text-xs text-gray-400">{formatDate(n.work_date)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
