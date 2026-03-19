"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

export default function ElearnAnalytics() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStats(data);
        } else {
          console.error("API returned non-array:", data);
          setStats([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-2xl">Loading your real analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-5xl font-bold mb-2">ADUN E-Learning</h1>
      <p className="text-xl text-green-400 mb-10">Performance Analytics Dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LIVE BAR CHART */}
        <div className="bg-gray-900 p-8 rounded-2xl border border-green-500/20">
          <h2 className="text-2xl mb-6">Average Grade per Course</h2>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={stats}>
              <XAxis dataKey="course" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgGrade" fill="#22c55e" radius={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-rows-2 gap-6">
          <div className="bg-gray-900 p-8 rounded-2xl border border-green-500/20">
            <h3 className="text-green-400 text-sm">TOTAL STUDENTS</h3>
            <p className="text-6xl font-bold mt-2">247</p>
          </div>
          <div className="bg-gray-900 p-8 rounded-2xl border border-green-500/20">
            <h3 className="text-green-400 text-sm">COMPLETION RATE</h3>
            <p className="text-6xl font-bold mt-2">84%</p>
          </div>
        </div>
      </div>
    </div>
  );
}