import React, { useState } from 'react';
import { FaSync, FaUser, FaBox, FaDollarSign, FaPlus } from 'react-icons/fa';

const AdminDashboard = () => {
  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      user: 'priya',
      action: 'Requested quote for 1121 Basmati Rice',
      time: '23 hours ago'
    },
    {
      id: 2,
      user: 'System Administrator',
      action: 'Requested quote for Cashew Nuts',
      time: '23 hours ago'
    },
    {
      id: 3,
      user: 'System Administrator',
      action: 'Requested quote for 1121 Basmati Rice',
      time: '12/18/2025'
    },
    {
      id: 4,
      user: 'Shiva',
      action: 'Requested quote for Dark Chocolate Be',
      time: '12/18/2025'
    },
  
  ]);

  const stats = [
    { id: 1, label: 'Total Users', value: '24', icon: <FaUser />, color: 'bg-blue-500' },
    { id: 2, label: 'Total Products', value: '156', icon: <FaBox />, color: 'bg-green-500' },
    { id: 3, label: 'Total Revenue', value: '$4,650.60', icon: <FaDollarSign />, color: 'bg-purple-500' },
    { id: 4, label: 'New Today', value: '7', icon: <FaPlus />, color: 'bg-yellow-500' }
  ];

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#00F5C8] mb-2">Admin Panel</h1>
        <p className="text-gray-400 text-base md:text-lg">Exclusive Trader</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-4 md:my-6"></div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-gray-800 rounded-lg p-4 md:p-6 hover:bg-gray-750 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <span className="text-white text-xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-gray-800 rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#00F5C8] mb-2">Recent Activity</h2>
            <p className="text-gray-400 text-sm md:text-base mt-1">Latest quotes and user actions</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-[#00F5C8] hover:bg-[#00d4a8] text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <FaSync />
            <span>Refresh</span>
          </button>
        </div>

        {/* Activity List - Updated to match image format */}
        <div className="space-y-6">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="border-b border-gray-700 pb-6 last:border-0 last:pb-0">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* User and Action */}
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="font-semibold text-white text-base md:text-lg">{activity.user}</h3>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base">{activity.action}</p>
                </div>
                
                {/* Time/Date - Aligned to right */}
                <div className="md:text-right">
                  <div className="text-gray-400 text-sm md:text-base font-medium">
                    {activity.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Administrator Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-center text-gray-400">
            <p className="text-sm md:text-base">System Administrator</p>
          </div>
        </div>
      </div>

      {/* Bottom Space */}
      <div className="h-6 md:h-8"></div>
    </div>
  );
};

export default AdminDashboard;