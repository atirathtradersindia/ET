// components/admin/AdminOrders.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { ref, onValue, update } from "firebase/database";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isIpadPro, setIsIpadPro] = useState(false);
  
  const statusDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Detect screen size with iPad Pro specific detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isIpad = /Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
      
      // iPad Pro dimensions: 1024-1366px width in landscape
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsIpadPro((width >= 1024 && width <= 1366) || (isIpad && width >= 1024));
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-hide success popup after 3 seconds
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showOrderModal || showSuccessPopup) {
      // Store current scroll position
      const scrollY = window.scrollY;
      const body = document.body;
      
      // Prevent background scrolling
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.style.overflowY = 'scroll';
      
      return () => {
        // Restore body scroll when modal closes
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflowY = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [showOrderModal, showSuccessPopup]);

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
        setStatusUpdate(newStatus);
      }
      
      setShowStatusDropdown(false);
      
      // Show success popup
      setSuccessMessage(`Order status updated to "${newStatus}" successfully!`);
      setShowSuccessPopup(true);
      
      // Auto close modal after 1.5 seconds
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
      
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
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
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "processing":
      case "in progress":
      case "in development":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "pending":
      case "waiting":
      case "new":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "cancelled":
      case "rejected":
      case "declined":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "on hold":
        return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
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
      
      if (isMobile) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (isIpadPro) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
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

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setStatusUpdate(order.status);
    setShowOrderModal(true);
    setShowStatusDropdown(false);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    setStatusUpdate("");
    setShowStatusDropdown(false);
  };

  const handleStatusSelect = (status) => {
    setStatusUpdate(status);
    setShowStatusDropdown(false);
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
    setSuccessMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-[#00F5C8] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00F5C8] mx-auto mb-4"></div>
          <p className="text-sm sm:text-base">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-4 md:p-5 lg:p-6">
      {/* HEADER */}
      <div className="mb-4 sm:mb-5 lg:mb-6">
        <h1 className={`${isIpadPro ? 'text-2xl' : 'text-xl sm:text-2xl lg:text-3xl'} font-bold text-[#00F5C8] mb-1`}>Admin Panel</h1>
        <p className={`${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm lg:text-base'} text-gray-400`}>Manage users, products and orders</p>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-700 mb-4 sm:mb-5 lg:mb-6"></div>

      {/* TITLE & STATS - OPTIMIZED FOR IPAD PRO */}
      <div className="mb-4 sm:mb-5 lg:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <h2 className={`${isIpadPro ? 'text-2xl' : 'text-lg sm:text-xl lg:text-2xl xl:text-3xl'} font-bold text-[#00F5C8] mb-2`}>Orders Management</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-400">
              <p className={`${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm lg:text-base'}`}>
                {orders.length} total orders
              </p>
              <span className="hidden sm:inline">•</span>
              <p className={`${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm lg:text-base'}`}>
                {filteredOrders.length} filtered
              </p>
              <span className="hidden sm:inline">•</span>
              <p className={`${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm lg:text-base'}`}>
                Real-time updates
              </p>
            </div>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mt-2 md:mt-0">
            <button
              onClick={() => navigate("/admin")}
              className={`px-3 sm:px-4 py-2 border border-[#00F5C8]/30 text-[#00F5C8] rounded hover:bg-[#00F5C8]/10 ${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm lg:text-base'} whitespace-nowrap`}
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS - COMPACT FOR IPAD PRO */}
      <div className="flex flex-col md:flex-row gap-2 sm:gap-3 mb-4 sm:mb-5 lg:mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by ID, name, email, phone..."
            className={`w-full bg-gray-800 border border-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded focus:outline-none focus:ring-2 focus:ring-[#00F5C8] ${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm lg:text-base'} placeholder:text-gray-500`}
          />
        </div>
        <div className="w-full md:w-auto">
          <select
            className={`w-full md:w-auto bg-gray-800 border border-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded focus:outline-none focus:ring-2 focus:ring-[#00F5C8] ${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm lg:text-base'}`}
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

      {/* TABLE CONTAINER - OPTIMIZED FOR IPAD PRO */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {/* Desktop & iPad Pro Table */}
          <table className={`${isIpadPro ? 'table' : 'hidden lg:table'} min-w-full`}>
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className={`px-3 py-2 ${isIpadPro ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-left`}>Order ID</th>
                <th className={`px-3 py-2 ${isIpadPro ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-left`}>Customer</th>
                <th className={`px-3 py-2 ${isIpadPro ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-left`}>Product</th>
                <th className={`px-3 py-2 ${isIpadPro ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-left`}>Date</th>
                <th className={`px-3 py-2 ${isIpadPro ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-left`}>Status</th>
                <th className={`px-3 py-2 ${isIpadPro ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-left`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    {orders.length === 0 ? "No orders found in database" : "No orders match your search"}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <div className={`font-mono ${isIpadPro ? 'text-xs' : 'text-xs sm:text-sm'} text-gray-300`}>
                        {isIpadPro ? `${order.id.substring(0, 10)}...` : `${order.id.substring(0, 8)}...`}
                      </div>
                      <div className={`${isIpadPro ? 'text-xs' : 'text-xs'} text-gray-500 mt-1 truncate ${isIpadPro ? 'max-w-[120px]' : 'max-w-[100px]'}`}>{order.email}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className={`font-medium text-white ${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm'}`}>{order.customerName}</div>
                      <div className={`${isIpadPro ? 'text-xs' : 'text-xs'} text-gray-400 mt-1`}>{order.phone}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className={`font-medium text-white ${isIpadPro ? 'text-xs' : 'text-xs sm:text-sm'} truncate ${isIpadPro ? 'max-w-[180px]' : 'max-w-[150px]'}`}>{order.productName}</div>
                      <div className={`${isIpadPro ? 'text-xs' : 'text-xs'} text-gray-400 mt-1`}>
                        {order.category} • {order.quantity}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className={`${isIpadPro ? 'text-xs' : 'text-xs sm:text-sm'} text-gray-300`}>{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-full ${isIpadPro ? 'text-xs' : 'text-xs'} font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col xs:flex-row gap-1">
                        <button
                          className={`px-2 py-1 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 ${isIpadPro ? 'text-xs' : 'text-xs'} whitespace-nowrap`}
                          onClick={() => handleOpenModal(order)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Tablet Table (768px - 1023px) */}
          <table className={`${isTablet && !isIpadPro ? 'table' : 'hidden'} min-w-full`}>
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-3 py-2 text-xs font-medium text-left">Order ID</th>
                <th className="px-3 py-2 text-xs font-medium text-left">Customer</th>
                <th className="px-3 py-2 text-xs font-medium text-left">Product</th>
                <th className="px-3 py-2 text-xs font-medium text-left">Status</th>
                <th className="px-3 py-2 text-xs font-medium text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    {orders.length === 0 ? "No orders found in database" : "No orders match your search"}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <div className="font-mono text-xs text-gray-300">
                        {order.id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[100px]">{order.email}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-white text-sm">{order.customerName}</div>
                      <div className="text-xs text-gray-400 truncate">{order.phone}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs font-medium text-white truncate max-w-[120px]">{order.productName}</div>
                      <div className="text-xs text-gray-400">{formatPrice(order.total)}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          className="px-2 py-1 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 text-xs"
                          onClick={() => handleOpenModal(order)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className={`${isMobile ? 'block' : 'hidden'} p-3 sm:p-4 space-y-3`}>
            {filteredOrders.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                {orders.length === 0 ? "No orders found in database" : "No orders match your search"}
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-gray-750 border border-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="space-y-3">
                    {/* Order ID & Email */}
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono text-xs sm:text-sm text-[#00F5C8]">
                            ID: {order.id.substring(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate">{order.email}</div>
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
                      <div className="font-medium text-white text-sm sm:text-base">{order.customerName}</div>
                      <div className="text-xs sm:text-sm text-gray-400">{order.phone}</div>
                    </div>

                    {/* Product Info */}
                    <div className="border-t border-gray-700 pt-3">
                      <div className="text-sm font-medium text-white">{order.productName}</div>
                      <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                        <span>{order.category}</span>
                        <span>•</span>
                        <span>{order.quantity}</span>
                        <span>•</span>
                        <span className="font-medium">{formatPrice(order.total)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-3 border-t border-gray-700">
                      <button
                        className="px-3 py-1 bg-[#00F5C8]/20 text-[#00F5C8] rounded hover:bg-[#00F5C8]/30 text-xs sm:text-sm"
                        onClick={() => handleOpenModal(order)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PAGINATION / INFO FOOTER */}
      <div className="mt-4 sm:mt-5 lg:mt-6 flex flex-col md:flex-row md:items-center justify-between text-gray-400">
        <div className="mb-2 md:mb-0">
          <button
            onClick={() => navigate("/admin")}
            className="hover:text-white flex items-center gap-1 text-xs sm:text-sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <div className="text-left md:text-right">
          <div className="text-xs sm:text-sm">Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="text-xs sm:text-sm">Showing {filteredOrders.length} of {orders.length} orders</div>
        </div>
      </div>

      {/* ORDER DETAILS MODAL - OPTIMIZED FOR IPAD PRO */}
      {showOrderModal && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-2 sm:p-3 md:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div 
            className={`bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl w-full ${
              isMobile ? 'max-w-full mx-2' : 
              isIpadPro ? 'max-w-3xl' : 
              'max-w-4xl'
            } max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 z-10">
              <div className="flex justify-between items-center p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className={`${isIpadPro ? 'text-xl' : 'text-lg sm:text-xl lg:text-2xl'} font-bold text-[#00F5C8] truncate`}>Order Details</h3>
                <button
                  onClick={handleCloseModal}
                  className={`text-gray-400 hover:text-white ${isIpadPro ? 'text-xl' : 'text-lg sm:text-xl lg:text-2xl'} bg-gray-900 ${isIpadPro ? 'w-8 h-8' : 'w-7 h-7 sm:w-8 sm:h-8'} rounded-full flex items-center justify-center`}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 overflow-visible">
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Order ID</p>
                    <p className="font-mono text-xs sm:text-sm break-all text-white">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Date</p>
                    <p className="font-medium text-white text-xs sm:text-sm lg:text-base">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 sm:px-3 py-1 rounded-full ${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm'} ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer & Product Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                  <div className="bg-gray-900 p-3 sm:p-4 rounded-lg">
                    <h4 className="text-[#00F5C8] font-medium text-sm sm:text-base lg:text-lg mb-3">Customer Information</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">Full Name</p>
                        <p className="font-medium text-white text-sm sm:text-base lg:text-lg">{selectedOrder.customerName}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Email</p>
                          <p className="font-medium text-xs sm:text-sm text-white break-all">{selectedOrder.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Phone</p>
                          <p className="font-medium text-xs sm:text-sm text-white">{selectedOrder.phone}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">Country Code</p>
                        <p className="font-medium text-white text-sm sm:text-base">{selectedOrder.countryCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 p-3 sm:p-4 rounded-lg">
                    <h4 className="text-[#00F5C8] font-medium text-sm sm:text-base lg:text-lg mb-3">Product Information</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">Product Name</p>
                        <p className="font-medium text-white text-sm sm:text-base lg:text-lg">{selectedOrder.productName}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Category</p>
                          <p className="font-medium text-xs sm:text-sm text-white">{selectedOrder.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Grade</p>
                          <p className="font-medium text-xs sm:text-sm text-white">{selectedOrder.grade}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Quantity</p>
                          <p className="font-medium text-xs sm:text-sm text-white">{selectedOrder.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Packing</p>
                          <p className="font-medium text-xs sm:text-sm text-white">{selectedOrder.packing}</p>
                        </div>
                      </div>
                      {selectedOrder.industry && (
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-1">Industry</p>
                          <p className="font-medium text-xs sm:text-sm text-white">{selectedOrder.industry}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-gray-900 p-3 sm:p-4 rounded-lg relative" ref={statusDropdownRef}>
                  <h4 className="text-[#00F5C8] font-medium text-sm sm:text-base lg:text-lg mb-3">Update Status</h4>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className={`w-full bg-gray-800 border border-gray-700 px-3 sm:px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00F5C8] text-left flex justify-between items-center ${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm lg:text-base'}`}
                      >
                        <span className="capitalize truncate">{statusUpdate || selectedOrder.status}</span>
                        <svg
                          className={`${isIpadPro ? 'w-4 h-4' : 'w-3 h-3 sm:w-4 sm:h-4'} transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Custom Dropdown */}
                      {showStatusDropdown && (
                        <div className="absolute z-[99999] mt-1 w-full bg-gray-800 border border-gray-700 rounded shadow-lg max-h-48 overflow-y-auto">
                          {statusOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleStatusSelect(option)}
                              className={`w-full px-3 sm:px-4 py-2 text-left hover:bg-gray-700 capitalize ${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm'}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, statusUpdate || selectedOrder.status)}
                      disabled={isUpdating || (statusUpdate === selectedOrder.status)}
                      className={`px-3 sm:px-4 py-2 bg-[#00F5C8] text-gray-900 rounded hover:opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${isIpadPro ? 'text-sm' : 'text-xs sm:text-sm lg:text-base'} whitespace-nowrap`}
                    >
                      {isUpdating ? "Updating..." : "Update Status"}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-700">
                  <button
                    className="px-4 py-2 bg-[#00F5C8] text-gray-900 rounded hover:opacity-90 font-medium text-sm sm:text-base"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP NOTIFICATION */}
      {showSuccessPopup && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-3 sm:p-4"
          onClick={handleCloseSuccessPopup}
        >
          <div 
            className="bg-gray-800 border border-gray-700 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md animate-popIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center">
                {/* Success Icon */}
                <div className={`${isMobile ? 'w-12 h-12' : isIpadPro ? 'w-14 h-14' : 'w-16 h-16'} bg-green-500/20 rounded-full flex items-center justify-center mb-3 sm:mb-4`}>
                  <svg className={`${isMobile ? 'w-6 h-6' : isIpadPro ? 'w-7 h-7' : 'w-8 h-8'} text-green-400`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Success Message */}
                <h3 className={`${isMobile ? 'text-lg' : isIpadPro ? 'text-xl' : 'text-xl'} font-bold text-white mb-2`}>Success!</h3>
                <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 px-2">{successMessage}</p>
                
                {/* Close Button */}
                <button
                  onClick={handleCloseSuccessPopup}
                  className="px-4 sm:px-6 py-2 bg-[#00F5C8] text-gray-900 font-medium rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
                >
                  OK
                </button>
                
                {/* Auto-close timer indicator */}
                <div className="mt-4 w-full bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full animate-timer"
                    style={{ animation: 'timer 3s linear forwards' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes timer {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-timer {
          animation: timer 3s linear forwards;
        }
        .animate-popIn {
          animation: popIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;