import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LoginStatsChart({ data }: { data: { date: string; uniqueUserCount: number }[] }) {
  const formattedData = data.map(({ date, uniqueUserCount }) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
    uniqueUserCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} orientation='right'/>
        <Tooltip />
        <Line type="monotone" dataKey="uniqueUserCount" stroke="#8884d8" name="Users" />
      </LineChart>
    </ResponsiveContainer>
  );
}
