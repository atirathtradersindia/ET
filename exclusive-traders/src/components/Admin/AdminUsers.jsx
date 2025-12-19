// components/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, deleteUser, toggleUserStatus } from '../../firebase';
import { auth } from '../../firebase';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return navigate('/signin');

        const token = await user.getIdTokenResult();
        const isAdmin = token.claims.admin || user.email === 'admin@exclusivetrader.com';
        if (!isAdmin) return navigate('/');

        await fetchUsers();
      } catch (err) {
        setError('Authentication failed');
      } finally {
        setLoading(false);
      }
    };
    checkAdminAuth();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch {
      setError('Failed to fetch users');
    }
  };

  const handleToggleStatus = async (id, status) => {
    await toggleUserStatus(id, status);
    fetchUsers();
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const filteredUsers = users.filter((u) =>
    `${u.email} ${u.displayName} ${u.phoneNumber} ${u.id}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const formatPhoneNumber = (phone) => phone || 'Not provided';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071B2E] flex items-center justify-center text-white">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071B2E] text-white p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#22F5C3]">Admin Panel</h1>
        <p className="text-[#B9C6D2]">Manage users, products and orders</p>
      </div>

      {/* Search */}
      <div className="flex justify-center mb-6">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full max-w-lg px-4 py-2 rounded bg-[#0B2A3C] border border-[#22F5C3]/30 text-white focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-[#22F5C3]/30 rounded">
          <thead className="bg-[#0B2A3C]">
            <tr className="text-[#22F5C3] text-sm">
              <th className="p-3 text-left">LID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, i) => (
              <tr
                key={user.id}
                className="border-t border-[#22F5C3]/10 hover:bg-[#0B2A3C]"
              >
                <td className="p-3">user-{i + 1}</td>
                <td className="p-3">{user.displayName || 'No Name'}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{formatPhoneNumber(user.phoneNumber)}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleViewUser(user)}
                    className="text-[#22F5C3] hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#0B2A3C] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl text-[#22F5C3] mb-4">User Details</h3>

            <p><span className="text-gray-400">Name:</span> {selectedUser.displayName}</p>
            <p><span className="text-gray-400">Email:</span> {selectedUser.email}</p>
            <p><span className="text-gray-400">Phone:</span> {selectedUser.phoneNumber}</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  handleToggleStatus(selectedUser.id, selectedUser.isActive);
                  setShowUserModal(false);
                }}
                className="px-4 py-2 bg-[#22F5C3] text-[#071B2E] rounded"
              >
                Toggle Status
              </button>
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-600 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
