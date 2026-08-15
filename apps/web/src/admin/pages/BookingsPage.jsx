import React, { useEffect, useState } from 'react';
import { Loader2, CalendarClock } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { adminApi } from '@/admin/lib/adminApi';

const STATUS_OPTIONS = ['new', 'contacted', 'confirmed', 'completed', 'cancelled'];

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('__all__');

  const load = () => {
    setLoading(true);
    const params = filter !== '__all__' ? `?status=${filter}` : '';
    adminApi.get(`/bookings${params}`).then((data) => setBookings(data.bookings)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id, status) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    await adminApi.patch(`/bookings/${id}/status`, { status });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#001a4d]">Bookings</h1>
        <p className="text-muted-foreground">Facial &amp; salon appointment requests from the website.</p>
      </div>

      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All bookings</SelectItem>
          {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" /></div>
      ) : bookings.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          <CalendarClock className="mx-auto mb-3 h-8 w-8 opacity-40" />
          No bookings yet.
        </CardContent></Card>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Preferred</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-semibold text-[#001a4d]">{b.name}</TableCell>
                  <TableCell>{b.phone}</TableCell>
                  <TableCell>{b.age ?? '—'}</TableCell>
                  <TableCell>{b.service}</TableCell>
                  <TableCell>{[b.preferredDate, b.preferredTime].filter(Boolean).join(' ') || '—'}</TableCell>
                  <TableCell className="max-w-xs truncate" title={b.notes || ''}>{b.notes || '—'}</TableCell>
                  <TableCell>
                    <Select value={b.status} onValueChange={(status) => handleStatusChange(b.id, status)}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
