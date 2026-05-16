'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logoutAdmin } from '@/lib/auth';
import {
  LayoutDashboard,
  Stethoscope,
  FileText,
  ShoppingBag,
  BarChart3,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutAdmin();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Stethoscope, label: 'Doctors', href: '/dashboard/doctors' },
    { icon: FileText, label: 'Session Requests', href: '/dashboard/session-requests' },
    { icon: FileText, label: 'Articles', href: '/dashboard/articles' },
    { icon: Shield, label: 'Community Moderation', href: '/community-moderation' },
    { icon: ShoppingBag, label: 'Products', href: '/dashboard/products' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  ];

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">MomPulse</h1>
        <p className="text-xs text-gray-600">Admin Console</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <Link
          href="/support"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Support</span>
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{isLoading ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );
}
