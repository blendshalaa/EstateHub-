import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import {
    Building2,
    Users,
    Briefcase,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { formatCurrency } from '../utils/helpers';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    {trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                        {trendValue}
                    </span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                </div>
            )}
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [pipeline, setPipeline] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [overviewRes, pipelineRes, activityRes] = await Promise.all([
                    api.get('/dashboard/overview'),
                    api.get('/dashboard/pipeline'),
                    api.get('/dashboard/recent-activity')
                ]);

                setStats(overviewRes.data.data);
                setPipeline(pipelineRes.data.data);
                setRecentActivity(activityRes.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Properties"
                    value={stats?.properties?.total || 0}
                    icon={Building2}
                    color="bg-blue-500"
                    trend="up"
                    trendValue="12%"
                />
                <StatCard
                    title="Active Clients"
                    value={stats?.clients?.active || 0}
                    icon={Users}
                    color="bg-green-500"
                    trend="up"
                    trendValue="8%"
                />
                <StatCard
                    title="Active Deals"
                    value={stats?.deals?.active || 0}
                    icon={Briefcase}
                    color="bg-purple-500"
                    trend="down"
                    trendValue="3%"
                />
                <StatCard
                    title="Total Commission"
                    value={formatCurrency(stats?.deals?.total_commission || 0)}
                    icon={TrendingUp}
                    color="bg-yellow-500"
                    trend="up"
                    trendValue="15%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Deal Pipeline Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Deal Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipeline}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="stage"
                                        tickFormatter={(value) => value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [value, 'Deals']}
                                        labelFormatter={(value) => value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            {activity.type === 'deal_activity' && <Briefcase className="h-4 w-4 text-blue-500" />}
                                            {activity.type === 'communication' && <Users className="h-4 w-4 text-green-500" />}
                                            {activity.type === 'showing' && <Calendar className="h-4 w-4 text-purple-500" />}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(activity.date).toLocaleDateString()} • {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
