import React from 'react';

interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    color?: string; // e.g., "bg-indigo-600"
}

export default function StatsCard({ title, value, icon, trend, trendUp, color = "bg-indigo-600" }: StatsCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-start justify-between transition-transform hover:scale-[1.02] duration-200">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
                {trend && (
                    <div className={`flex items-center gap-1 mt-3 text-sm font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        <span className="text-lg leading-none">{trendUp ? '↑' : '↓'}</span>
                        <span>{trend}</span>
                        <span className="text-gray-400 font-medium ml-1">vs last week</span>
                    </div>
                )}
            </div>
            <div className={`p-4 rounded-xl text-white ${color} shadow-lg shadow-indigo-100`}>
                {icon}
            </div>
        </div>
    );
}
