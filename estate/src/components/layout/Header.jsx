import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../utils/helpers';

const Header = () => {
    const { user } = useAuthStore();

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center flex-1">
                        <div className="hidden md:block w-full max-w-md">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Search properties, clients, deals..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center ml-4 md:ml-6 space-x-4">
                        <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" aria-hidden="true" />
                        </button>

                        {/* Profile dropdown */}
                        <div className="flex items-center">
                            <div className="flex items-center space-x-3">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
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
