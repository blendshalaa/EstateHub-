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
    LogOut
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
        { name: 'Clients', href: '/clients', icon: Users },
        { name: 'Deals', href: '/deals', icon: Briefcase },
        { name: 'Showings', href: '/showings', icon: Calendar },
        { name: 'Communications', href: '/communications', icon: MessageSquare },
        { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    ];

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4 mb-6">
                            <span className="text-2xl font-bold text-gray-900">
                                Estate<span className="text-primary-600">Hub</span>
                            </span>
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        cn(
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                            isActive
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon
                                                className={cn(
                                                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                                                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
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
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex-shrink-0 w-full group block"
                        >
                            <div className="flex items-center">
                                <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
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
