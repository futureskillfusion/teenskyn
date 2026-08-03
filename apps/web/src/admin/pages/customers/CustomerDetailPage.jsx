import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/admin/lib/adminApi';
import { formatCurrency } from '@/api/EcommerceApi';

const MYR_INFO = { code: 'MYR', symbol: 'RM', template: 'RM$1', decimal_digits: 2 };

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get(`/customers/${id}`).then((data) => setCustomer(data.customer)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" /></div>;
  }

  if (!customer) return <p>Customer not found.</p>;

  const lifetimeValue = customer.orders
    .filter((o) => ['paid', 'fulfilled'].includes(o.status))
    .reduce((sum, o) => sum + o.totalInCents, 0);

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => navigate('/admin/customers')} className="flex items-center gap-2 text-sm font-semibold text-[#001a4d] hover:underline">
        <ArrowLeft size={16} /> Back to customers
      </button>

      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#001a4d]">{customer.name || 'Guest'}</h1>
        <p className="text-muted-foreground">{customer.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Lifetime value</CardTitle></CardHeader><CardContent><p className="font-display text-2xl font-extrabold text-[#001a4d]">{formatCurrency(lifetimeValue, MYR_INFO)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle></CardHeader><CardContent><p className="font-display text-2xl font-extrabold text-[#001a4d]">{customer.orders.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Customer since</CardTitle></CardHeader><CardContent><p className="font-display text-lg font-bold text-[#001a4d]">{new Date(customer.createdAt).toLocaleDateString()}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Order history</CardTitle></CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell><Link to={`/admin/orders/${order.id}`} className="font-semibold text-[#001a4d] hover:underline">{order.orderNumber}</Link></TableCell>
                    <TableCell><Badge className="capitalize">{order.status}</Badge></TableCell>
                    <TableCell className="text-right">{formatCurrency(order.totalInCents, MYR_INFO)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
