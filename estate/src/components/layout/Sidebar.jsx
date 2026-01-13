import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    Briefcase,
    Calendar,
    MessageSquare,
    CheckSquare,
    Settings,
    LogOut,
    Map
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Properties', href: '/properties', icon: Building2 },
        { name: 'Map', href: '/map', icon: Map },
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Deals', href: '/deals', icon: Briefcase },
        { name: 'Showings', href: '/showings', icon: Calendar },
        { name: 'Communications', href: '/communications', icon: MessageSquare },
        { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    ];

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col h-0 flex-1 bg-primary-950 border-r border-primary-900 shadow-xl z-20">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-6 mb-8">
                            <span className="text-2xl font-bold text-white tracking-tight">
                                Estate<span className="text-secondary-400">Hub</span>
                            </span>
                        </div>
                        <nav className="mt-2 flex-1 px-3 space-y-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        cn(
                                            'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                                            isActive
                                                ? 'bg-primary-800 text-white shadow-lg shadow-primary-900/50 translate-x-1'
                                                : 'text-primary-200 hover:bg-primary-900 hover:text-white hover:translate-x-1'
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon
                                                className={cn(
                                                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                                                    isActive ? 'text-secondary-400' : 'text-primary-400 group-hover:text-secondary-400'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-primary-900 p-4 bg-primary-950/50">
                        <button
                            onClick={handleLogout}
                            className="flex-shrink-0 w-full group block"
                        >
                            <div className="flex items-center">
                                <LogOut className="inline-block h-5 w-5 text-primary-400 group-hover:text-red-400 transition-colors" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-primary-200 group-hover:text-white transition-colors">
                                        Sign out
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
