import React from 'react';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer } from 'recharts';

// NOT WIRED IN — reference layout only. revenueData/userGrowthData below are
// hardcoded fabricated numbers, not real revenue or growth. Do not register in
// WorkspaceWidgetRegistry until backed by a real analytics source (Rule 20: No Fake Data).

const revenueData = [
  { name: 'Mon', value: 4000 }, { name: 'Tue', value: 3000 }, { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 4780 }, { name: 'Fri', value: 5890 }, { name: 'Sat', value: 4390 },
];

const userGrowthData = [
    { name: 'W1', value: 120 }, { name: 'W2', value: 200 }, { name: 'W3', value: 150 },
    { name: 'W4', value: 300 }, { name: 'W5', value: 450 }, { name: 'W6', value: 400 },
];

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-zinc-900/50 p-3 rounded-sm h-48 flex flex-col">
        <h4 className="text-[10px] text-amber-400 tracking-widest uppercase mb-2">{title}</h4>
        <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

export const AnalyticsDeckPanel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-2">
        <ChartCard title="Weekly Revenue">
            <BarChart data={revenueData}>
                <Bar dataKey="value" fill="#d97706" />
            </BarChart>
        </ChartCard>
        <ChartCard title="User Growth">
            <LineChart data={userGrowthData}>
                <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} />
            </LineChart>
        </ChartCard>
    </div>
  );
};