'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function EmployeeManager() {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [form, setForm] = useState({ fullName: '', username: '', password: '', role: 'employee' });
  const [saving, setSaving] = useState(false);

  const loadEmployees = useCallback(async () => {
    const res = await fetch('/api/admin/employees');
    const data = await res.json();
    setEmployees(data.employees ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  function openAdd() {
    setEditing(null);
    setForm({ fullName: '', username: '', password: '', role: 'employee' });
    setShowForm(true);
  }

  function openEdit(emp: Profile) {
    setEditing(emp);
    setForm({ fullName: emp.full_name, username: emp.username, password: '', role: emp.role });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    if (editing) {
      const res = await fetch(`/api/admin/employees/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          role: form.role,
          isActive: editing.is_active,
          password: form.password || undefined,
        }),
      });
      if (res.ok) {
        toast.success('Çalışan güncellendi');
        setShowForm(false);
        loadEmployees();
      } else {
        const d = await res.json();
        toast.error(d.error);
      }
    } else {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Çalışan eklendi');
        setShowForm(false);
        loadEmployees();
      } else {
        const d = await res.json();
        toast.error(d.error);
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/employees/${deleteTarget.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Çalışan silindi');
      setDeleteTarget(null);
      loadEmployees();
    } else {
      const d = await res.json();
      toast.error(d.error);
    }
  }

  async function toggleActive(emp: Profile) {
    await fetch(`/api/admin/employees/${emp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: emp.full_name,
        role: emp.role,
        isActive: !emp.is_active,
      }),
    });
    loadEmployees();
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-1" /> Yeni Çalışan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-8"><LoadingSpinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-xs text-gray-400">
                    <th className="text-left px-4 py-3 font-medium">İsim</th>
                    <th className="text-left px-4 py-3 font-medium">Kullanıcı Adı</th>
                    <th className="text-left px-4 py-3 font-medium">Rol</th>
                    <th className="text-left px-4 py-3 font-medium">Durum</th>
                    <th className="text-right px-4 py-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{emp.full_name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono">{emp.username}</td>
                      <td className="px-4 py-3">
                        <Badge variant={emp.role === 'admin' ? 'destructive' : 'secondary'}>
                          {emp.role === 'admin' ? 'Admin' : 'Çalışan'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(emp)}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            emp.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {emp.is_active ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(emp)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(emp)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ekle / Düzenle Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Çalışanı Düzenle' : 'Yeni Çalışan Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Ad Soyad</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Ad Soyad"
              />
            </div>
            {!editing && (
              <div className="space-y-1.5">
                <Label>Kullanıcı Adı</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="kullaniciadi"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>{editing ? 'Yeni Şifre (boş = değiştirme)' : 'Şifre'}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v ?? 'employee' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Çalışan</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>İptal</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme Onay Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Çalışanı Sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            <strong>{deleteTarget?.full_name}</strong> adlı çalışanı silmek istiyor musunuz?
            Bu işlem geri alınamaz.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>İptal</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
