import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AuthLayout = () => {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Estate<span className="text-primary-600">Hub</span>
                </h1>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
