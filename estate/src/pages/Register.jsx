import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Register = () => {
    const navigate = useNavigate();
    const { register, isLoading, error } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'agent', // Default role
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        const success = await register({
            email: formData.email,
            password: formData.password,
            role: formData.role
        });

        if (success) {
            navigate('/');
        }
    };

    return (
        <div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
                <h2 className="text-center text-2xl font-bold text-gray-900">
                    Create a new account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        sign in to existing account
                    </Link>
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="Email address"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />

                <Input
                    label="Password"
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                />

                <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                        <option value="agent">Agent</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                >
                    Create Account
                </Button>
            </form>
        </div>
    );
};

export default Register;
