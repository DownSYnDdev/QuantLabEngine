'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/contexts/TenantContext';
import {
    BarChart3,
    Code2,
    Settings,
    ChevronLeft,
    ChevronRight,
    Search,
    TrendingUp,
    Layers,
    History,
    Wallet,
} from 'lucide-react';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

const navItems: NavItem[] = [
    { icon: <BarChart3 size={20} />, label: 'Charts', href: '/' },
    { icon: <TrendingUp size={20} />, label: 'Watchlist', href: '/watchlist' },
    { icon: <Code2 size={20} />, label: 'Strategies', href: '/strategies' },
    { icon: <History size={20} />, label: 'Backtest', href: '/backtest' },
    { icon: <Wallet size={20} />, label: 'Portfolio', href: '/portfolio' },
    { icon: <Layers size={20} />, label: 'Indicators', href: '/indicators' },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { tenant } = useTenant();

    return (
        <aside
            className={`
        fixed left-0 top-0 h-screen z-40
        bg-slate-900 border-r border-slate-800
        flex flex-col transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
        >
            {/* Logo / Tenant Branding */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        {tenant.logoUrl ? (
                            <img
                                src={tenant.logoUrl}
                                alt={tenant.name}
                                className="h-8 w-auto"
                            />
                        ) : (
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: tenant.accentColor }}
                            >
                                {tenant.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-white font-semibold text-lg">
                            {tenant.name}
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="p-4">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                            type="text"
                            placeholder="Search symbols..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-slate-400 hover:text-white hover:bg-slate-800
              transition-colors cursor-pointer
              ${collapsed ? 'justify-center' : ''}
            `}
                    >
                        {item.icon}
                        {!collapsed && (
                            <span className="text-sm font-medium">{item.label}</span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Settings */}
            <div className="p-2 border-t border-slate-800">
                <Link
                    href="/settings"
                    className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-slate-400 hover:text-white hover:bg-slate-800
            transition-colors cursor-pointer
            ${collapsed ? 'justify-center' : ''}
          `}
                >
                    <Settings size={20} />
                    {!collapsed && <span className="text-sm font-medium">Settings</span>}
                </Link>
            </div>
        </aside>
    );
}
