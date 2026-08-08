import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/admin/lib/adminApi';
import { formatCurrency } from '@/api/EcommerceApi';

const MYR_INFO = { code: 'MYR', symbol: 'RM', template: 'RM$1', decimal_digits: 2 };
const STATUS_VARIANT = { pending: 'secondary', paid: 'default', fulfilled: 'default', cancelled: 'destructive', refunded: 'outline' };

export default function OrdersListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('__all__');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status !== '__all__') params.set('status', status);
      adminApi.get(`/orders?${params.toString()}`).then((data) => setOrders(data.orders)).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#001a4d]">Orders</h1>
        <p className="text-muted-foreground">Track and fulfil customer orders.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search order # or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" /></div>
      ) : orders.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No orders found.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell><Link to={`/admin/orders/${order.id}`} className="font-semibold text-[#001a4d] hover:underline">{order.orderNumber}</Link></TableCell>
                  <TableCell>{order.customerEmail || '—'}</TableCell>
                  <TableCell><Badge variant="outline">{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online'}</Badge></TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[order.status]} className="capitalize">{order.status}</Badge></TableCell>
                  <TableCell className="text-right">{formatCurrency(order.totalInCents, MYR_INFO)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
