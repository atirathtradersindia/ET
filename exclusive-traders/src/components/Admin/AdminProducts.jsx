import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, remove } from "firebase/database";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaBox,
} from "react-icons/fa";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const db = getDatabase();
      const snapshot = await get(ref(db, "products"));

      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map((id) => ({
          id,
          ...data[id],
        }));
        setProducts(list);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const db = getDatabase();
      await remove(ref(db, `products/${id}`));
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory =
      selectedCategory === "all" || p.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-[#050B14] text-white p-4 md:p-6 space-y-6">
      {/* HEADER - Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#00F5C8]">
            Product Management
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Manage your products and inventory
          </p>
        </div>

        <button className="flex items-center justify-center bg-[#00F5C8] text-[#050B14] px-4 py-2 rounded-lg font-medium hover:opacity-90 w-full md:w-auto">
          <FaPlus className="mr-2" />
          Add Product
        </button>
      </div>

      {/* FILTERS - Responsive Grid */}
      <div className="bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl p-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search - Full width on mobile, spans 6 on desktop */}
          <div className="md:col-span-6 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050B14] border border-[#00F5C8]/30 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00F5C8] text-sm md:text-base"
            />
          </div>

          {/* Category Filter - Full width on mobile, spans 4 on desktop */}
          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#050B14] border border-[#00F5C8]/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00F5C8] text-sm md:text-base"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#050B14]">
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Button - Full width on mobile, spans 2 on desktop */}
          <div className="md:col-span-2">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-[#00F5C8]/30 rounded-lg hover:bg-[#00F5C8]/10 text-sm md:text-base">
              <FaFilter className="mr-2 text-[#00F5C8]" />
              <span className="hidden md:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLE - Responsive with horizontal scroll on mobile */}
      <div className="bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[#00F5C8]">
            Loading products...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#00F5C8]/10">
              <thead className="bg-[#050B14]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#00F5C8]/10">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#00F5C8]/5 transition-colors duration-150"
                    >
                      {/* Product Column */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-10 w-10 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-[#050B14] rounded flex items-center justify-center flex-shrink-0">
                              <FaBox className="text-gray-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm md:text-base truncate">
                              {p.name}
                            </p>
                            <p className="text-xs md:text-sm text-gray-400 truncate">
                              {p.brand || "No brand"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Column */}
                      <td className="px-4 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full bg-[#00F5C8]/10 text-[#00F5C8] text-xs md:text-sm whitespace-nowrap">
                          {p.category || "Uncategorized"}
                        </span>
                      </td>

                      {/* Price Column */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm md:text-base font-medium">
                          ${p.price || "0.00"}
                        </span>
                      </td>

                      {/* Stock Column */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs md:text-sm whitespace-nowrap ${
                            (p.stock || 0) > 10
                              ? "bg-green-500/20 text-green-400"
                              : (p.stock || 0) > 0
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {p.stock || 0}
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="px-4 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs md:text-sm whitespace-nowrap">
                          {p.status || "active"}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-4 py-4">
                        <div className="flex gap-2 md:gap-3">
                          <button 
                            className="p-1.5 md:p-2 text-[#00F5C8] hover:bg-[#00F5C8]/10 rounded transition-colors duration-200"
                            title="Edit"
                          >
                            <FaEdit className="text-sm md:text-base" />
                          </button>
                          <button
                            className="p-1.5 md:p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors duration-200"
                            onClick={() => handleDelete(p.id)}
                            title="Delete"
                          >
                            <FaTrash className="text-sm md:text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer - Responsive */}
        {filteredProducts.length > 0 && (
          <div className="px-4 py-3 bg-[#050B14] border-t border-[#00F5C8]/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-xs md:text-sm text-gray-400">
                Showing {filteredProducts.length} of {products.length} products
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto">
                <button className="px-3 py-1.5 border border-[#00F5C8]/30 rounded text-xs md:text-sm text-gray-400 hover:bg-[#00F5C8]/10 transition-colors duration-200 whitespace-nowrap">
                  ← Previous
                </button>
                <button className="px-3 py-1.5 border border-[#00F5C8] bg-[#00F5C8]/20 rounded text-xs md:text-sm text-[#00F5C8] whitespace-nowrap">
                  1
                </button>
                <button className="px-3 py-1.5 border border-[#00F5C8]/30 rounded text-xs md:text-sm text-gray-400 hover:bg-[#00F5C8]/10 transition-colors duration-200 whitespace-nowrap">
                  2
                </button>
                <button className="px-3 py-1.5 border border-[#00F5C8]/30 rounded text-xs md:text-sm text-gray-400 hover:bg-[#00F5C8]/10 transition-colors duration-200 whitespace-nowrap">
                  3
                </button>
                <button className="px-3 py-1.5 border border-[#00F5C8]/30 rounded text-xs md:text-sm text-gray-400 hover:bg-[#00F5C8]/10 transition-colors duration-200 whitespace-nowrap">
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Summary Card (Hidden on Desktop) */}
      <div className="md:hidden bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[#00F5C8] font-medium">Summary</h3>
          <span className="text-sm text-gray-400">
            {filteredProducts.length} products
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#050B14] rounded-lg p-3">
            <p className="text-xs text-gray-400">Active</p>
            <p className="text-lg font-bold text-green-400">
              {products.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-[#050B14] rounded-lg p-3">
            <p className="text-xs text-gray-400">Low Stock</p>
            <p className="text-lg font-bold text-yellow-400">
              {products.filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center pt-4">
        <p className="text-xs md:text-sm text-gray-500">
          Products are automatically synced from your database.
          Changes may take a few moments to reflect.
        </p>
      </div>
    </div>
  );
};

export default AdminProducts;