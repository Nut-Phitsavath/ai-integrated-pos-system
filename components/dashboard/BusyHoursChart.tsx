'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BusyHoursChartProps {
    data: { hour: number; count: number }[];
}

export default function BusyHoursChart({ data }: BusyHoursChartProps) {
    // Format hour to 12h format
    const formattedData = data.map(item => ({
        ...item,
        label: new Date(0, 0, 0, item.hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    }));

    // Find max value to determine color intensity if needed (optional)

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Traffic by Hour</h3>
            <div className="h-[250px] w-full">
                {data.some(d => d.count > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 10 }}
                                interval={3} // Show fewer labels to avoid clutter
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {formattedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.count > 5 ? '#4F46E5' : '#818CF8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No traffic data available
                    </div>
                )}
            </div>
        </div>
    );
}
