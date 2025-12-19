// components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Your existing firebase config
import { ref, get } from "firebase/database";
import {
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaHistory,
  FaShoppingBag,
  FaUserCircle,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalQuotes: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingQuotes: 0,
    completedQuotes: 0,
    newQuotes: 0,
    processingQuotes: 0,
    todayQuotes: 0,
    yesterdayQuotes: 0,
    weeklyQuotes: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch quotes data
      const quotesRef = ref(db, "quotes");
      const quotesSnap = await get(quotesRef);
      
      // Fetch users data
      const usersRef = ref(db, "users");
      const usersSnap = await get(usersRef);
      
      let quotesData = [];
      let quotesCount = 0;
      let newCount = 0;
      let pendingCount = 0;
      let completedCount = 0;
      let processingCount = 0;
      let todayCount = 0;
      let yesterdayCount = 0;
      let weeklyCount = 0;
      let totalRevenue = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      if (quotesSnap.exists()) {
        const quotes = quotesSnap.val();
        quotesData = Object.values(quotes);
        quotesCount = quotesData.length;
        
        // Process quotes data
        quotesData.forEach(quote => {
          const quoteDate = new Date(quote.createdAt || quote.timestamp);
          const estimatedBill = quote.estimatedBill || {};
          const total = parseFloat(estimatedBill.total) || 0;
          
          // Add to total revenue
          totalRevenue += total;
          
          // Count by status
          const status = (quote.status || "new").toLowerCase();
          if (status === "new") newCount++;
          else if (status === "pending") pendingCount++;
          else if (status === "completed" || status === "approved") completedCount++;
          else if (status === "processing" || status === "in progress") processingCount++;
          
          // Count by date
          if (quoteDate >= today) todayCount++;
          if (quoteDate >= yesterday && quoteDate < today) yesterdayCount++;
          if (quoteDate >= weekAgo) weeklyCount++;
        });
      }
      
      let usersData = [];
      let usersCount = 0;
      
      if (usersSnap.exists()) {
        const users = usersSnap.val();
        usersData = Object.values(users);
        usersCount = usersData.length;
      }
      
      // Prepare recent activity data
      const activity = [];
      
      // Add recent quotes as activity
      if (quotesData.length > 0) {
        const recentQuotes = quotesData
          .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp))
          .slice(0, 6);
        
        recentQuotes.forEach(quote => {
          const contactInfo = quote.contactInfo || {};
          const productInfo = quote.productInfo || {};
          const estimatedBill = quote.estimatedBill || {};
          
          activity.push({
            id: quote.id,
            user: contactInfo.fullName || "Customer",
            action: `Requested quote for ${productInfo.productName || "product"}`,
            time: formatTimeAgo(quote.createdAt || quote.timestamp),
            type: "quote",
            amount: estimatedBill.total || "0",
            status: quote.status || "new",
            email: contactInfo.email || "No email",
          });
        });
      }
      
      // Add recent users as activity
      if (usersData.length > 0) {
        const recentUsers = usersData
          .filter(user => user.email !== "admin@exclusivetrader.com")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2);
        
        recentUsers.forEach(user => {
          activity.push({
            id: user.uid || user.id,
            user: user.displayName || user.fullName || "User",
            action: "Registered on platform",
            time: formatTimeAgo(user.createdAt),
            type: "user",
            email: user.email || "No email",
          });
        });
      }
      
      // Sort all activity by time (most recent first)
      activity.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activity.slice(0, 8)); // Get top 8 most recent activities
      
      setStats({
        totalQuotes: quotesCount,
        totalUsers: usersCount,
        totalRevenue: totalRevenue,
        pendingQuotes: pendingCount,
        completedQuotes: completedCount,
        newQuotes: newCount,
        processingQuotes: processingCount,
        todayQuotes: todayCount,
        yesterdayQuotes: yesterdayCount,
        weeklyQuotes: weeklyCount,
      });
      
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    if (!amount) return "$0.00";
    if (typeof amount === "number") {
      return `$${amount.toFixed(2)}`;
    }
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) return `${diffMins} mins ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return "Recently";
    }
  };

  const statCards = [
    { 
      title: "Total Quotes", 
      value: stats.totalQuotes, 
      icon: <FaShoppingCart />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      description: "All time quotes"
    },
    { 
      title: "Total Users", 
      value: stats.totalUsers, 
      icon: <FaUsers />,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      description: "Registered users"
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: <FaDollarSign />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      description: "Estimated revenue"
    },
    {
      title: "New Quotes Today",
      value: stats.todayQuotes,
      icon: <FaChartLine />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      description: "Today's new quotes"
    },
    {
      title: "Pending Quotes",
      value: stats.pendingQuotes,
      icon: <FaClock />,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      description: "Require attention"
    },
    {
      title: "Completed Quotes",
      value: stats.completedQuotes,
      icon: <FaCheckCircle />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      description: "Successfully processed"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00F5C8] mx-auto mb-4"></div>
          <p className="text-[#00F5C8] text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B14] text-white p-4 md:p-6 space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#00F5C8]">Admin Panel</h1>
        <p className="text-gray-400">Manage users, products and orders</p>
      </div>

      {/* WELCOME SECTION */}
      <div className="bg-[#0B1C2D] border border-gray-800 rounded-xl p-6">
        <h2 className="text-3xl font-bold text-[#00F5C8] mb-2">Welcome back, Admin</h2>
        <p className="text-gray-400">Real-time overview of your platform</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-[#0B1C2D] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-[#0B1C2D] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#00F5C8] flex items-center gap-2">
            <FaHistory className="text-[#00F5C8]" />
            Recent Activity
          </h3>
          <button
            onClick={fetchDashboardData}
            className="text-sm text-[#00F5C8] hover:text-[#00F5C8]/80 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FaHistory className="text-4xl mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition group"
              >
                <div className={`p-2 rounded-full ${
                  activity.type === 'quote' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'
                } group-hover:scale-110 transition-transform`}>
                  {activity.type === 'quote' ? <FaShoppingBag /> : <FaUserCircle />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-white truncate">{activity.user}</p>
                      <p className="text-sm text-gray-400 mt-1 truncate">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500 truncate">{activity.email}</span>
                    {activity.type === 'quote' && (
                      <>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                          {activity.status}
                        </span>
                        <span className="text-xs text-[#00F5C8] ml-auto">
                          {formatPrice(activity.amount)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-gray-500 text-sm pt-4 border-t border-gray-800">
        <p>Dashboard updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">Exclusive Trader Admin Panel v1.0</p>
      </div>
    </div>
  );
};

export default AdminDashboard;