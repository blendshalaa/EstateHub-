import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const MainLayout = () => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
