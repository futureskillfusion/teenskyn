import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/admin/lib/adminApi';

const emptyForm = () => ({ title: '', durationText: '', priceText: '', description: '', order: 0, active: true });

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.get('/services').then((data) => setServices(data.services)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (service) => {
    setEditingId(service.id);
    setForm({
      title: service.title,
      durationText: service.durationText,
      priceText: service.priceText,
      description: service.description || '',
      order: service.order,
      active: service.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.patch(`/services/${editingId}`, form);
      } else {
        await adminApi.post('/services', form);
      }
      setDialogOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await adminApi.delete(`/services/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#001a4d]">Services</h1>
          <p className="text-muted-foreground">Salon treatments shown on the website's Services menu.</p>
        </div>
        <Button onClick={openNew} className="bg-[#001a4d] hover:bg-[#FFD700] hover:text-[#001a4d]">
          <Plus size={16} /> New service
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" /></div>
      ) : services.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          <Sparkles className="mx-auto mb-3 h-8 w-8 opacity-40" />
          No services yet. Add your first treatment.
        </CardContent></Card>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-semibold text-[#001a4d]">{s.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
                  </TableCell>
                  <TableCell>{s.durationText}</TableCell>
                  <TableCell>{s.priceText}</TableCell>
                  <TableCell><Badge variant={s.active ? 'default' : 'secondary'}>{s.active ? 'Active' : 'Hidden'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(s.id)}><Trash2 size={14} className="text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit service' : 'New service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#001a4d]">Title</label>
              <Input required value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Teen Clarity Facial" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#001a4d]">Duration</label>
                <Input required value={form.durationText} onChange={(e) => setForm(f => ({ ...f, durationText: e.target.value }))} placeholder="e.g. 45 min" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#001a4d]">Price</label>
                <Input required value={form.priceText} onChange={(e) => setForm(f => ({ ...f, priceText: e.target.value }))} placeholder="e.g. RM55 or Free with facial" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#001a4d]">Description</label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(active) => setForm(f => ({ ...f, active }))} />
              <label className="text-sm font-semibold text-[#001a4d]">Visible on website</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-[#001a4d] hover:bg-[#FFD700] hover:text-[#001a4d]">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? 'Save changes' : 'Create service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
