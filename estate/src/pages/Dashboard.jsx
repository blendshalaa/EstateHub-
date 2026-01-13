import React, { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
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
    ArrowDownRight,
    Plus,
    Search,
    Bell,
    MoreHorizontal,
    DollarSign,
    Activity
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import api from '../services/api';
import { Link } from 'react-router-dom';

// Mock data for sparklines (since backend doesn't provide history yet)
const generateSparkData = (trend) => {
    const data = [];
    let value = 50;
    for (let i = 0; i < 10; i++) {
        value += (Math.random() - (trend === 'up' ? 0.3 : 0.7)) * 10;
        data.push({ value: Math.max(10, value) });
    }
    return data;
};

const PremiumStatCard = ({ title, value, icon: Icon, trend, trendValue, color, sparkColor }) => {
    const sparkData = generateSparkData(trend);

    return (
        <div className="relative overflow-hidden rounded-2xl bg-primary-900/40 border border-primary-800 p-6 backdrop-blur-sm shadow-lg group hover:border-primary-700 transition-all duration-300">
            {/* Background Gradient Blob */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 border border-white/5`}>
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {trendValue}
                    </div>
                )}
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="text-primary-400 text-sm font-medium">{title}</h3>
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            </div>

            {/* Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-50 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={sparkColor}
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const QuickAction = ({ icon: Icon, label, to, color }) => (
    <Link
        to={to}
        className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary-900/40 border border-primary-800 hover:bg-primary-800/60 hover:border-primary-700 transition-all duration-200 group"
    >
        <div className={`p-3 rounded-full ${color} bg-opacity-10 mb-3 group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className="text-sm font-medium text-primary-200 group-hover:text-white">{label}</span>
    </Link>
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

    // Mock revenue data for the area chart
    const revenueData = [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 2000 },
        { name: 'Apr', value: 2780 },
        { name: 'May', value: 1890 },
        { name: 'Jun', value: 2390 },
        { name: 'Jul', value: 3490 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-primary-400 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-primary-900/50 px-4 py-2 rounded-lg border border-primary-800 text-sm text-primary-200 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-secondary-500" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <button className="p-2 rounded-lg bg-primary-900/50 border border-primary-800 text-primary-400 hover:text-white hover:bg-primary-800 transition-colors">
                        <Bell className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumStatCard
                    title="Total Properties"
                    value={stats?.properties?.total || 0}
                    icon={Building2}
                    color="bg-blue-500"
                    sparkColor="#3b82f6"
                    trend="up"
                    trendValue="12%"
                />
                <PremiumStatCard
                    title="Active Clients"
                    value={stats?.clients?.active || 0}
                    icon={Users}
                    color="bg-green-500"
                    sparkColor="#22c55e"
                    trend="up"
                    trendValue="8%"
                />
                <PremiumStatCard
                    title="Active Deals"
                    value={stats?.deals?.active || 0}
                    icon={Briefcase}
                    color="bg-purple-500"
                    sparkColor="#a855f7"
                    trend="down"
                    trendValue="3%"
                />
                <PremiumStatCard
                    title="Total Commission"
                    value={formatCurrency(stats?.deals?.total_commission || 0)}
                    icon={DollarSign}
                    color="bg-secondary-500"
                    sparkColor="#eab308"
                    trend="up"
                    trendValue="15%"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Analytics */}
                <div className="lg:col-span-2 bg-primary-900/40 border border-primary-800 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white">Revenue Analytics</h2>
                            <p className="text-sm text-primary-400">Monthly commission performance</p>
                        </div>
                        <select className="bg-primary-900 border border-primary-700 text-primary-200 text-sm rounded-lg px-3 py-1 outline-none focus:border-secondary-500">
                            <option>Last 6 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                                    itemStyle={{ color: '#eab308' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions & Pipeline */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-primary-900/40 border border-primary-800 rounded-2xl p-6 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickAction icon={Plus} label="New Deal" to="/deals" color="bg-secondary-500" />
                            <QuickAction icon={Users} label="Add Client" to="/clients" color="bg-blue-500" />
                            <QuickAction icon={Building2} label="List Property" to="/properties" color="bg-purple-500" />
                            <QuickAction icon={Search} label="Search" to="/properties" color="bg-green-500" />
                        </div>
                    </div>

                    {/* Deal Pipeline Mini */}
                    <div className="bg-primary-900/40 border border-primary-800 rounded-2xl p-6 backdrop-blur-sm flex-1">
                        <h2 className="text-lg font-bold text-white mb-4">Pipeline Status</h2>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pipeline} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="stage"
                                        type="category"
                                        width={100}
                                        tickFormatter={(value) => value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                                    />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                        {pipeline.map((entry, index) => (
                                            <cell key={`cell-${index}`} fill={['#3b82f6', '#a855f7', '#22c55e', '#eab308'][index % 4]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-primary-900/40 border border-primary-800 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-secondary-500" />
                        Recent Activity
                    </h2>
                    <button className="text-sm text-secondary-400 hover:text-secondary-300 font-medium">View All</button>
                </div>
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-primary-800"></div>

                    <div className="space-y-8">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="relative flex items-start pl-10 group">
                                <div className={`absolute left-0 p-2 rounded-full border-2 border-primary-950 z-10 ${activity.type === 'deal_activity' ? 'bg-blue-500' :
                                        activity.type === 'communication' ? 'bg-green-500' :
                                            'bg-purple-500'
                                    }`}>
                                    {activity.type === 'deal_activity' && <Briefcase className="h-3 w-3 text-white" />}
                                    {activity.type === 'communication' && <Users className="h-3 w-3 text-white" />}
                                    {activity.type === 'showing' && <Calendar className="h-3 w-3 text-white" />}
                                </div>
                                <div className="flex-1 bg-primary-900/50 p-4 rounded-xl border border-primary-800/50 hover:border-primary-700 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-white group-hover:text-secondary-400 transition-colors">
                                            {activity.description}
                                        </p>
                                        <span className="text-xs text-primary-400 whitespace-nowrap ml-4">
                                            {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-primary-400 mt-1">
                                        {new Date(activity.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <p className="text-sm text-primary-400 text-center py-8">No recent activity to show.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
