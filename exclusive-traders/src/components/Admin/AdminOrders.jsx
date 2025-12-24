// components/admin/AdminOrders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { ref, onValue, update, remove } from "firebase/database";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    
    return () => {
      // Cleanup is handled by onValue unsubscribe pattern
    };
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    
    const quotesRef = ref(db, "quotes");
    
    const unsubscribe = onValue(quotesRef, (snapshot) => {
      const data = snapshot.val();
      let ordersList = [];
      
      if (data) {
        ordersList = Object.keys(data).map(key => {
          const order = data[key];
          const contactInfo = order.contactInfo || {};
          const productInfo = order.productInfo || {};
          const estimatedBill = order.estimatedBill || {};
          
          return {
            id: key,
            quoteId: order.id || key,
            customerName: contactInfo.fullName || "Unknown Customer",
            email: contactInfo.email || "No email",
            phone: contactInfo.phone || "No phone",
            countryCode: contactInfo.countryCode || "+91",
            productName: productInfo.productName || "Unknown Product",
            category: productInfo.category || "General",
            grade: productInfo.grade || "Not specified",
            quantity: productInfo.quantity || "Not specified",
            packing: productInfo.packing || "Not specified",
            port: productInfo.port || "Not specified",
            industry: productInfo.industry || "Not specified",
            additionalInfo: productInfo.additionalInfo || "",
            cifRequired: productInfo.cifRequired || false,
            total: estimatedBill.total || "$0.00",
            basePrice: estimatedBill.basePrice || "0.00",
            packingCost: estimatedBill.packingCost || "0.00",
            portPrice: estimatedBill.portPrice || "0.00",
            freightCost: estimatedBill.freightCost || "0.00",
            insuranceCost: estimatedBill.insuranceCost || "0.00",
            transportCost: estimatedBill.transportCost || "0.00",
            quantityPrice: estimatedBill.quantityPrice || "0",
            destinationCountry: estimatedBill.destinationCountry || "",
            destinationPort: estimatedBill.destinationPort || "",
            status: order.status || "new",
            source: order.source || "website",
            createdAt: order.createdAt || order.timestamp || new Date().toISOString(),
            database: order.database || "firebasegetquote",
            storedIn: order.storedIn || "firebasegetquote-database",
            originalData: order
          };
        });
        
        ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });
    
    return unsubscribe;
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const orderRef = ref(db, `quotes/${orderId}`);
      await update(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      setStatusUpdate("");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }
    
    setIsUpdating(true);
    try {
      const orderRef = ref(db, `quotes/${orderId}`);
      await remove(orderRef);
      
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      if (selectedOrder?.id === orderId) {
        setShowOrderModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm.trim()) return true;
    
    const q = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.email.toLowerCase().includes(q) ||
      (order.phone && order.phone.toLowerCase().includes(q)) ||
      (order.productName && order.productName.toLowerCase().includes(q)) ||
      (order.category && order.category.toLowerCase().includes(q)) ||
      (order.status && order.status.toLowerCase().includes(q))
    );
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "processing":
      case "in progress":
      case "in development":
        return "bg-blue-500/20 text-blue-400";
      case "pending":
      case "waiting":
      case "new":
        return "bg-yellow-500/20 text-yellow-400";
      case "cancelled":
      case "rejected":
      case "declined":
        return "bg-red-500/20 text-red-400";
      case "on hold":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatPrice = (amount) => {
    if (!amount) return "$0.00";
    if (typeof amount === "number") {
      return `$${amount.toFixed(2)}`;
    }
    if (typeof amount === "string") {
      if (/^\$/.test(amount)) return amount;
      if (/^\d+/.test(amount)) {
        const num = parseFloat(amount);
        if (!isNaN(num)) {
          return `$${num.toFixed(2)}`;
        }
      }
      return `$${amount}`;
    }
    return "$0.00";
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "No date";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const statusOptions = [
    "new",
    "pending",
    "processing",
    "in progress",
    "on hold",
    "completed",
    "cancelled",
    "rejected"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-[#00F5C8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00F5C8] mx-auto mb-4"></div>
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      {/* HEADER - FIXED ALIGNMENT */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#00F5C8] mb-1">Admin Panel</h1>
        <p className="text-gray-400 text-base md:text-lg">Manage users, products and orders</p>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-700 mb-4 md:mb-6"></div>

      {/* TITLE & STATS - IMPROVED MOBILE LAYOUT */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-[#00F5C8] mb-2">Orders Management</h2>
            <p className="text-gray-400 text-sm md:text-base">
              {orders.length} total orders • {filteredOrders.length} filtered • Real-time updates
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-[#00F5C8] text-gray-900 rounded hover:opacity-90 font-medium flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2 border border-[#00F5C8]/30 text-[#00F5C8] rounded hover:bg-[#00F5C8]/10"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS - IMPROVED MOBILE LAYOUT */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by ID, name, email, phone..."
            className="w-full bg-gray-800 border border-gray-700 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-[#00F5C8]"
          />
        </div>
        <div className="w-full md:w-auto">
          <select
            className="w-full md:w-auto bg-gray-800 border border-gray-700 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-[#00F5C8]"
            onChange={(e) => {
              if (e.target.value === "all") {
                setSearchTerm("");
              } else {
                setSearchTerm(e.target.value);
              }
            }}
          >
            <option value="all">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE CONTAINER - RESPONSIVE */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden md:table min-w-full">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400">
                    {orders.length === 0 ? "No orders found in database" : "No orders match your search"}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm text-gray-300">
                        {order.id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{order.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{order.customerName}</div>
                      <div className="text-sm text-gray-400 mt-1">{order.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{order.productName}</div>
                      <div className="text-xs text-gray-400 mt-1">{order.category} • {order.quantity}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 text-sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusUpdate(order.status);
                            setShowOrderModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={isUpdating}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                {orders.length === 0 ? "No orders found in database" : "No orders match your search"}
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-gray-750 border border-gray-700 rounded-lg p-4">
                  <div className="space-y-3">
                    {/* Order ID & Email */}
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono text-sm text-[#00F5C8]">
                            ID: {order.id.substring(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{order.email}</div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <div className="font-medium text-white">{order.customerName}</div>
                      <div className="text-sm text-gray-400">{order.phone}</div>
                    </div>

                    {/* Product Info */}
                    <div className="border-t border-gray-700 pt-3">
                      <div className="text-sm font-medium text-white">{order.productName}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {order.category} • {order.quantity} • {formatPrice(order.total)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-3 border-t border-gray-700">
                      <button
                        className="px-3 py-1 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 text-sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                      >
                        View Details
                      </button>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusUpdate(order.status);
                            setShowOrderModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={isUpdating}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FOOTER - IMPROVED MOBILE LAYOUT */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between text-gray-400 text-sm">
        <div className="mb-2 md:mb-0">
          <button
            onClick={() => navigate("/admin")}
            className="hover:text-white flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <div className="text-right">
          <div>Updated: {new Date().toLocaleTimeString()}</div>
          <div>Showing {filteredOrders.length} of {orders.length} orders</div>
        </div>
      </div>

      {/* ORDER DETAILS MODAL - IMPROVED FOR MOBILE */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#00F5C8]">Order Details</h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Order ID</p>
                    <p className="font-mono text-sm break-all text-white">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Date</p>
                    <p className="font-medium text-white">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer & Product Info - Stacked on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <h4 className="text-[#00F5C8] font-medium mb-3">Customer Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Full Name</p>
                        <p className="font-medium text-white">{selectedOrder.customerName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Email</p>
                          <p className="font-medium text-sm text-white truncate">{selectedOrder.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Phone</p>
                          <p className="font-medium text-sm text-white">{selectedOrder.phone}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Country Code</p>
                        <p className="font-medium text-white">{selectedOrder.countryCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 p-4 rounded-lg">
                    <h4 className="text-[#00F5C8] font-medium mb-3">Product Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Product Name</p>
                        <p className="font-medium text-white">{selectedOrder.productName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Category</p>
                          <p className="font-medium text-sm text-white">{selectedOrder.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Grade</p>
                          <p className="font-medium text-sm text-white">{selectedOrder.grade}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Quantity</p>
                          <p className="font-medium text-sm text-white">{selectedOrder.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Packing</p>
                          <p className="font-medium text-sm text-white">{selectedOrder.packing}</p>
                        </div>
                      </div>
                      {selectedOrder.industry && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Industry</p>
                          <p className="font-medium text-sm text-white">{selectedOrder.industry}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Update - Stacked on mobile */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-[#00F5C8] font-medium mb-3">Update Status</h4>
                  <div className="flex flex-col md:flex-row gap-3">
                    <select
                      value={statusUpdate || selectedOrder.status}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00F5C8]"
                    >
                      {statusOptions.map(option => (
                        <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, statusUpdate || selectedOrder.status)}
                      disabled={isUpdating || (statusUpdate === selectedOrder.status)}
                      className="px-4 py-2 bg-[#00F5C8] text-gray-900 rounded hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Updating..." : "Update Status"}
                    </button>
                  </div>
                </div>

                {/* Actions - Stacked on mobile */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-700">
                  <button
                    className="px-4 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this order?")) {
                        handleDeleteOrder(selectedOrder.id);
                        setShowOrderModal(false);
                      }
                    }}
                    disabled={isUpdating}
                  >
                    Delete Order
                  </button>
                  <button
                    className="px-4 py-2 bg-[#00F5C8] text-gray-900 rounded hover:opacity-90 font-medium"
                    onClick={() => setShowOrderModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;