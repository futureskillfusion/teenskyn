import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, TrendingUp, ShoppingBag, AlertTriangle, Tag, Users, Package, Wallet, Clock, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/admin/lib/adminApi';
import { formatCurrency } from '@/api/EcommerceApi';

const MYR_INFO = { code: 'MYR', symbol: 'RM', template: 'RM$1', decimal_digits: 2 };

function StatBox({ label, value, icon: Icon, to }) {
  const content = (
    <Card className={to ? 'h-full transition-colors hover:border-[#FFD700]' : 'h-full'}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8f6ff] text-[#001a4d]">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-xl font-extrabold text-[#001a4d] leading-tight truncate">{value}</p>
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/dashboard/summary').then(setSummary).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#001a4d]" /></div>;
  }

  if (!summary) return null;

  const s = summary.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-[#001a4d]">Dashboard</h1>
        <p className="text-muted-foreground">Your whole store, at a glance.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBox label="Total customers" value={s.totalCustomers} icon={Users} to="/admin/customers" />
        <StatBox label="Total orders" value={s.totalOrders} icon={ShoppingBag} to="/admin/orders" />
        <StatBox label="Total products" value={s.totalProducts} icon={Package} to="/admin/products" />
        <StatBox label="Total revenue" value={formatCurrency(s.totalRevenueInCents, MYR_INFO)} icon={Wallet} />
        <StatBox label="Revenue today" value={formatCurrency(s.revenueTodayInCents, MYR_INFO)} icon={TrendingUp} />
        <StatBox label="Pending orders" value={s.pendingOrders} icon={Clock} to="/admin/orders" />
        <StatBox label="Active sales" value={s.activeSales} icon={Tag} to="/admin/sales" />
        <StatBox label="New bookings" value={s.newBookings} icon={CalendarClock} to="/admin/bookings" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ShoppingBag size={18} /> Recent orders</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link to={`/admin/orders/${order.id}`} className="font-semibold text-[#001a4d] hover:underline">{order.orderNumber}</Link>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{order.status}</Badge></TableCell>
                      <TableCell className="text-right">{formatCurrency(order.totalInCents, MYR_INFO)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp size={18} /> Top products</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <ul className="space-y-2">
                {summary.topProducts.map((p) => (
                  <li key={p.productId} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#001a4d]">{p.title}</span>
                    <span className="text-muted-foreground">{p.unitsSold} sold</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shopper funnel (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-extrabold text-[#001a4d]">{summary.funnel.product_view}</p>
              <p className="text-xs text-muted-foreground">Product views</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#001a4d]">{summary.funnel.add_to_cart}</p>
              <p className="text-xs text-muted-foreground">Added to cart</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#001a4d]">{summary.funnel.checkout_started}</p>
              <p className="text-xs text-muted-foreground">Checkouts started</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary.lowStock.length > 0 && (
        <Card className="border-amber-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-600"><AlertTriangle size={18} /> Low stock</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.lowStock.map((v) => (
                <li key={v.variantId} className="flex items-center justify-between text-sm">
                  <span>{v.title} {v.variantTitle !== 'Default Variant' ? `— ${v.variantTitle}` : ''}</span>
                  <Badge variant="destructive">{v.inventoryQuantity} left</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
