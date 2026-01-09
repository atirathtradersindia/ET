import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AllProductsPage = ({ showIndustryProducts, currentUser, onBackToIndustries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const allIndustries = useMemo(() => [
    { id: 'Chocolate', name: 'Chocolate', image: 'https://shreejifoods.in/cdn/shop/products/IMG_19032021_095047__500_x_500_pixel.jpg?v=1616404272' },
    { id: 'Rice', name: 'Rice', image: 'https://articles-1mg.gumlet.io/articles/wp-content/uploads/2017/02/rsz_shutterstock_291146909.jpg?compress=true&quality=80&w=640&dpr=2.6' },
    { id: 'Perfumes', name: 'Perfumes', image: 'https://www.shutterstock.com/image-photo/mockup-bue-fragrance-perfume-bottle-260nw-1914090385.jpg' },
    { id: 'Clothes', name: 'Clothes', image: 'https://www.rd.com/wp-content/uploads/2022/08/GettyImages-1395657872-e1660072866664.jpg' },
    { id: 'Electronics', name: 'Electronics', image: 'https://ecelectronics.com/wp-content/uploads/2020/04/Modern-Electronics-EC-.jpg' },
    { id: 'Fruits', name: 'Fruits', image: 'https://images.ctfassets.net/prxuf37q3ta2/HKBan6gdluv8p5x3izTGO/2c495a4223d82796f76aab71c1f27af7/1534x864_Small_Fruit_and_veg.jpg?w=1280&q=70&fm=webp' },
    { id: 'Vegetables', name: 'Vegetables', image: 'https://jbmsmartstart.in/wp-content/uploads/2023/09/vegetable-names.jpg' },
    { id: 'Spices', name: 'Spices', image: 'https://pureleven.com/cdn/shop/articles/spices-to-boost-immunity.webp?v=1750638090&width=1100' },
    { id: 'Pulses', name: 'Pulses', image: 'https://media.licdn.com/dms/image/v2/C4E12AQEYXX5FJg6_mg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1520104330626?e=2147483647&v=beta&t=zBw9n6cv7e4ilmRW8MlfGvZkBdjuReWAXqE77OcfeCI' },
    { id: 'Dry Fruits', name: 'Dry Fruits', image: 'https://nutribinge.in/cdn/shop/articles/image3.jpg?v=1713258139' },
    { id: 'Flowers', name: 'Rose', image: 'https://t4.ftcdn.net/jpg/01/88/05/15/360_F_188051555_5Ut1whbPuoV6ntmuifVhBCGOmyyqD3t8.jpg' },
    { id: 'Oil', name: 'Oil', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOV0h8ngl5wQ3wftaOJAzaKTAwdbrp4UM6gg&s' },
    { id: 'Beverages', name: 'Beverages', image: 'https://agronfoodprocessing.com/wp-content/uploads/2023/08/drinks.jpg' },
    { id: 'Tea', name: 'Tea', image: 'https://domf5oio6qrcr.cloudfront.net/medialibrary/8468/conversions/Tea-thumb.jpg' },
  ], []);

  // Filter industries based on search term
  const filteredIndustries = useMemo(() => {
    if (!searchTerm.trim()) return allIndustries;
    
    const term = searchTerm.toLowerCase().trim();
    return allIndustries.filter(industry => 
      industry.name.toLowerCase().includes(term) ||
      industry.id.toLowerCase().includes(term)
    );
  }, [searchTerm, allIndustries]);

  const handleIndustryClick = (industryId) => {
    // REMOVE THE SIGN-IN CHECK - Allow viewing without sign-in
    showIndustryProducts(industryId);
  };

  const handleBackToIndustries = () => {
    if (onBackToIndustries) {
      onBackToIndustries();
    } else {
      // Navigate back to home page
      navigate('/');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <section id="all-products" className="py-20 bg-dark min-h-screen">
      <div className="container mx-auto px-4">
        {/* Simple Home Button at Top */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-secondary hover:text-accent transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </button>
        </div>

        <div className="section-title text-center mb-12">
          <h2 className="text-4xl text-secondary mb-4 text-shadow-black font-serif">All Products</h2>
          <p className="text-gray max-w-2xl mx-auto">
            Explore our complete range of {allIndustries.length} products across all industries
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <div className="flex items-center bg-gray-800 rounded-lg shadow-lg p-2">
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button
                className="ml-2 bg-secondary hover:bg-accent text-dark font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center"
                onClick={() => document.querySelector('input').focus()}
              >
                <i className="fas fa-search mr-2"></i>
                Search
              </button>
            </div>
            
            {/* Search Info */}
            <div className="mt-3 flex justify-between items-center text-sm text-gray-400">
              <span>
                {searchTerm ? (
                  <span>
                    Found {filteredIndustries.length} product{filteredIndustries.length !== 1 ? 's' : ''} 
                    for "<span className="text-secondary font-semibold">{searchTerm}</span>"
                  </span>
                ) : (
                  <span>Type to search among {allIndustries.length} products</span>
                )}
              </span>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="text-secondary hover:text-accent transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        </div>
       
        {filteredIndustries.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-lg p-12 max-w-md mx-auto">
              <i className="fas fa-search text-5xl text-gray-500 mb-4"></i>
              <h3 className="text-2xl text-white mb-2">No products found</h3>
              <p className="text-gray-400 mb-6">
                No products match your search for "<span className="text-secondary">{searchTerm}</span>"
              </p>
              <button
                onClick={clearSearch}
                className="bg-secondary hover:bg-accent text-dark font-bold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                Clear Search & Show All Products
              </button>
            </div>
          </div>
        ) : (
          <div className="industries-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredIndustries.map(industry => (
              <div
                key={industry.id}
                className="industry-item cursor-pointer transform transition-transform hover:scale-105 bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-secondary"
                onClick={() => handleIndustryClick(industry.id)}
              >
                <img 
                  src={industry.image} 
                  alt={industry.name} 
                  className="w-full h-48 object-cover mb-4 rounded-lg" 
                />
                <h3 className="text-xl font-semibold text-center text-white">{industry.name}</h3>
                
                {/* Highlight search term in product name */}
                {searchTerm && (
                  <div className="text-center mt-2">
                    <span className="text-sm bg-secondary/20 text-secondary px-2 py-1 rounded">
                      Matches your search
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Only one back button at the bottom */}
        <div className="text-center mt-12">
          <button
            onClick={handleBackToIndustries}
            className="bg-secondary hover:bg-accent text-dark font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Industries
          </button>
        </div>
      </div>
    </section>
  );
};

export default AllProductsPage;