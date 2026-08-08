import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Menu, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAdminAuth } from '@/admin/context/AdminAuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/sales', label: 'Sales & Offers', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-2.5 font-semibold transition-colors ${
              isActive ? 'bg-[#FFD700] text-[#001a4d]' : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f8f6ff]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-[#001a4d] px-4 py-6 lg:flex">
        <div className="mb-8 px-2">
          <p className="font-display text-xl font-extrabold text-[#FFD700]">Teen Skyn</p>
          <p className="text-xs uppercase tracking-widest text-white/50">Admin</p>
        </div>
        <NavLinks />
        <div className="mt-auto space-y-3 px-2">
          <p className="truncate text-xs text-white/50">{admin?.email}</p>
          <Button variant="outline" className="w-full justify-start gap-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </Button>
        </div>
      </aside>

      <div className="flex flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#001a4d]/10 bg-white px-4 py-3 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon"><Menu size={18} /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#001a4d] p-4 w-64">
              <p className="mb-6 font-display text-xl font-extrabold text-[#FFD700]">Teen Skyn Admin</p>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <Button variant="outline" className="mt-8 w-full justify-start gap-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={handleLogout}>
                <LogOut size={16} /> Log out
              </Button>
            </SheetContent>
          </Sheet>
          <p className="font-display text-lg font-extrabold text-[#001a4d]">Teen Skyn Admin</p>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
