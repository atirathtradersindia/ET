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
    <div className="min-h-screen bg-[#050B14] text-white p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#00F5C8]">
            Product Management
          </h1>
          <p className="text-gray-400">
            Manage your products and inventory
          </p>
        </div>

        <button className="flex items-center bg-[#00F5C8] text-[#050B14] px-4 py-2 rounded-lg font-medium hover:opacity-90">
          <FaPlus className="mr-2" />
          Add Product
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050B14] border border-[#00F5C8]/30 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00F5C8]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#050B14] border border-[#00F5C8]/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00F5C8]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#050B14]">
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <button className="flex items-center px-4 py-2 border border-[#00F5C8]/30 rounded-lg hover:bg-[#00F5C8]/10">
            <FaFilter className="mr-2 text-[#00F5C8]" />
            Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#0B1C2D] border border-[#00F5C8]/20 rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[#00F5C8]">
            Loading products...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#050B14] text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Price</th>
                  <th className="px-6 py-3 text-left">Stock</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
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
                      className="border-t border-[#00F5C8]/10 hover:bg-[#00F5C8]/5"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-[#050B14] rounded flex items-center justify-center">
                            <FaBox className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-gray-400">
                            {p.brand || "No brand"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full bg-[#00F5C8]/10 text-[#00F5C8]">
                          {p.category || "Uncategorized"}
                        </span>
                      </td>

                      <td className="px-6 py-4">${p.price || "0.00"}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
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

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                          {p.status || "active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 flex gap-3">
                        <button className="text-[#00F5C8] hover:opacity-80">
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-400 hover:opacity-80"
                          onClick={() => handleDelete(p.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
