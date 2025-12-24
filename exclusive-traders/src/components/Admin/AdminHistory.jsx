import React from 'react';

const AdminHistory = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header - EXACTLY like the image */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#00F5C8] mb-2">Admin Panel </h1>
        <p className="text-xl text-gray-300 font-medium">
          Manage users, products and orders
        </p>
      </div>

      {/* Empty page - no boxes or content */}
      
      {/* Minimal footer */}
      <div className="mt-12 pt-8 border-t border-gray-700 text-center">
        <p className="text-gray-400 text-lg">
          Admin Panel • System History Section
        </p>
      </div>
    </div>
  );
};

export default AdminHistory;