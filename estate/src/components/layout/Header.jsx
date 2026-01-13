import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../utils/helpers';

const Header = () => {
    const { user } = useAuthStore();

    return (
        <header className="bg-primary-950/80 backdrop-blur-md border-b border-primary-800 shadow-sm z-10 sticky top-0">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center flex-1">
                        <div className="hidden md:block w-full max-w-md">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-primary-400 group-focus-within:text-primary-200 transition-colors" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-primary-700 rounded-xl leading-5 bg-primary-900/50 text-white placeholder-primary-400 focus:outline-none focus:bg-primary-800 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 sm:text-sm transition-all duration-200"
                                    placeholder="Search properties, clients, deals..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center ml-4 md:ml-6 space-x-4">
                        <button className="p-2 rounded-full text-primary-400 hover:text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200">
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" aria-hidden="true" />
                        </button>

                        {/* Profile dropdown */}
                        <div className="flex items-center">
                            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-semibold text-white">{user?.email}</p>
                                    <p className="text-xs text-primary-300 font-medium capitalize">{user?.role}</p>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary-900/50 border border-primary-700">
                                    {getInitials(user?.email, '')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
