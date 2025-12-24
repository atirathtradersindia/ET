// components/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { fetchAllUsers } from '../../firebase';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter((user) =>
      `${user.email} ${user.displayName || ''} ${user.phoneNumber || ''} ${user.id || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    if (typeof phone === 'object') {
      return `${phone.countryCode || ''}${phone.number || ''}`;
    }
    return phone;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not available';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-[#00F5C8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00F5C8] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      {/* HEADER - IMPROVED ALIGNMENT */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#00F5C8] mb-1">Admin Panel</h1>
        <p className="text-gray-400 text-base md:text-lg">Manage users, products and orders</p>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-700 mb-4 md:mb-6"></div>

      {/* PAGE HEADER - IMPROVED MOBILE LAYOUT */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#00F5C8] mb-2">Users Management</h2>
        <p className="text-gray-400 text-base">
          {users.length} total users • {filteredUsers.length} filtered
        </p>
      </div>

      {/* SEARCH - IMPROVED FOR MOBILE */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, phone, ID..."
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00F5C8] focus:border-transparent"
        />
      </div>

      {/* USERS TABLE - RESPONSIVE DESIGN */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">UID</th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Name</th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Email</th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Phone</th>
                <th className="px-4 py-3 text-left text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 font-medium">
                    user-{index + 1}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {user.displayName || 'No Name'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <div className="truncate max-w-xs">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {formatPhoneNumber(user.phoneNumber)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="px-3 py-1 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 text-sm transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    {searchTerm ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              {searchTerm ? 'No users match your search' : 'No users found'}
            </div>
          ) : (
            filteredUsers.map((user, index) => (
              <div key={user.id} className="bg-gray-750 border border-gray-700 rounded-lg p-4">
                <div className="space-y-3">
                  {/* User ID & Name */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-[#00F5C8]">
                        user-{index + 1}
                      </div>
                      <div className="text-white font-medium mt-1">
                        {user.displayName || 'No Name'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="px-3 py-1 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 text-sm transition-colors"
                    >
                      View
                    </button>
                  </div>

                  {/* Email */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Email</div>
                    <div className="text-white text-sm truncate">{user.email}</div>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Phone</div>
                    <div className="text-white text-sm">
                      {formatPhoneNumber(user.phoneNumber)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TABLE FOOTER - IMPROVED FOR MOBILE */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-[#00F5C8] text-gray-900 font-medium rounded hover:bg-[#00d4a8] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* USER DETAILS MODAL - IMPROVED FOR MOBILE */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#00F5C8]">
                  User Details
                </h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-2xl text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#00F5C8] mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Full Name</p>
                      <p className="text-white font-medium">
                        {selectedUser.displayName || 'Not provided'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Email Address</p>
                      <p className="text-white">{selectedUser.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Phone Number</p>
                      <p className="text-white">
                        {formatPhoneNumber(selectedUser.phoneNumber)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-1">User ID</p>
                      <p className="text-white text-sm font-mono break-all">
                        {selectedUser.id || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#00F5C8] mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Account Created</p>
                      <p className="text-white">
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Last Sign In</p>
                      <p className="text-white">
                        {formatDate(selectedUser.lastSignInTime)}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Admin Status</p>
                        <p className={`font-medium ${selectedUser.isAdmin ? 'text-[#00F5C8]' : 'text-red-400'}`}>
                          {selectedUser.isAdmin ? 'Administrator' : 'Regular User'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Email Verified</p>
                        <p className={`font-medium ${selectedUser.emailVerified ? 'text-[#00F5C8]' : 'text-red-400'}`}>
                          {selectedUser.emailVerified ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#00F5C8] mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Photo URL</p>
                      <p className="text-white text-sm break-all">
                        {selectedUser.photoURL || 'Not provided'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Provider</p>
                      <p className="text-white">
                        {selectedUser.providerId || 'Firebase Authentication'}
                      </p>
                    </div>
                  </div>

                  {/* Profile Photo if available */}
                  {selectedUser.photoURL && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-3">Profile Photo</p>
                      <div className="flex justify-center">
                        <img
                          src={selectedUser.photoURL}
                          alt={selectedUser.displayName || 'User'}
                          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-[#00F5C8]/50"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 border-t border-gray-700">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 bg-gray-700 text-white font-medium rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    console.log('Edit user:', selectedUser.id);
                    handleCloseDetails();
                  }}
                  className="px-4 py-2 bg-[#00F5C8] text-gray-900 font-medium rounded hover:bg-[#00d4a8] transition-colors"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER SPACING */}
      <div className="h-6 md:h-8"></div>
    </div>
  );
};

export default AdminUsers;