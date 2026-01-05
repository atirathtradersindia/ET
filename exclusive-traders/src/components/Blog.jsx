// src/components/Blog.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Global Rice Trade 2024: Navigating New Market Dynamics",
      excerpt: "Explore the evolving landscape of international rice trade with insights on emerging markets, pricing trends, and supply chain innovations.",
      image: "https://etimg.etb2bimg.com/photo/107855000.cms",
    },
    {
      id: 2,
      title: "Wheat Import Strategies for European Markets",
      excerpt: "Master the complexities of wheat import regulations, quality standards, and logistics for successful European market entry.",
      image: "https://www.desmud.org/uploads/9d8e3b3a7c9447ff686bc1e0e9058f87.jpg",
    },
    {
      id: 3,
      title: "Sustainable Coffee Sourcing: From Farm to Global Markets",
      excerpt: "Discover how ethical sourcing and sustainable practices are reshaping the global coffee trade landscape.",
      image: "https://www.iisd.org/ssi/wp-content/uploads/2019/07/coffee-header-1024x683-1.jpg",
    },
    {
      id: 4,
      title: "Spice Export Opportunities in Middle Eastern Markets",
      excerpt: "Learn how to capitalize on the growing demand for premium spices in GCC countries and beyond.",
      image: "https://media.istockphoto.com/id/532239993/photo/spices-in-the-spice-souk-in-dubai.jpg?s=612x612&w=0&k=20&c=TaEW_D8YyNI7XLlYCETeXD5yWP2slyUT4cofMn8mmSw=",
    },
    {
      id: 5,
      title: "Nut Export Regulations and Market Access Strategies",
      excerpt: "Navigate the complex world of nut exports with our comprehensive guide to regulations, certifications, and market entry.",
      image: "https://cdn.momex.ae/momex-storage/static/blog_images/Nuts_and_Food_Export_A_Comprehensive_Guide_for_the_International_Market_momex_74ff6.webp",
    },
    {
      id: 6,
      title: "Pulse Trading: Opportunities in Emerging Markets",
      excerpt: "Discover the growing demand for pulses in developing economies and how to build sustainable export relationships.",
      image: "https://media.istockphoto.com/id/1143901429/photo/finance-investment-stock-market-chart-graph-currency-exchange-global-business-fintech.jpg?s=612x612&w=0&k=20&c=Gxi0YYjQiE2kCZL5y9hU2LCQshUl5mVsJsYWjj5ckFQ=",
    },
    {
      id: 7,
      title: "Tea Export Dynamics: Traditional Markets vs Emerging Opportunities",
      excerpt: "Analyze the shifting patterns in global tea trade and identify new growth markets for premium tea exports.",
      image: "https://i0.wp.com/elmarspices.com/wp-content/uploads/2023/03/tea2.jpg?resize=640%2C397&ssl=1",
    },
    {
      id: 8,
      title: "Sugar Trading in Volatile Markets: Risk Management Strategies",
      excerpt: "Learn how to navigate price volatility and supply chain challenges in the global sugar trade.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFvgaCxLt6d1jCubTN6okL3pFMscFUcCKUKjFnEpnchQJABF4bBtlH-Ayu1xUaEfOoSKw&usqp=CAU",
    }
  ];

  return (
    <div className="min-h-screen bg-dark text-light py-8 px-4 professional-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up px-4">
          <h1 className="professional-heading text-secondary text-shadow-black text-3xl md:text-4xl lg:text-5xl">
            Global Trade Insights: Import & Export Expertise
          </h1>
          <p className="professional-body max-w-3xl mx-auto mt-4 text-base md:text-lg">
            Stay informed with the latest trends, market analysis, and strategic insights 
            from the forefront of global agricultural trade and commodity markets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 innovation-grid px-2">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="innovation-feature-card animate-fade-in-up flex flex-col h-full bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-secondary/30 transition-all duration-300 hover:shadow-neon"
              style={{ animationDelay: `${post.id * 0.1}s` }}
            >
              {/* Image Section - Responsive Height */}
              <div className="relative overflow-hidden rounded-t-xl flex-shrink-0">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-40 sm:h-44 md:h-48 object-cover transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Content Section - Flexible */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Title - Better responsive handling */}
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-light leading-snug sm:leading-tight min-h-[3.5rem] sm:min-h-[4rem] flex items-start overflow-hidden">
                  <span className="line-clamp-2">{post.title}</span>
                </h3>
                
                {/* Excerpt - Better responsive handling */}
                <p className="text-gray-300 mb-4 professional-body flex-grow text-sm sm:text-base leading-relaxed line-clamp-3 min-h-[4.5rem]">
                  {post.excerpt}
                </p>

                {/* Read More Button - Fixed at Bottom */}
                <div className="mt-auto pt-3 border-t border-gray-600/50">
                  <Link
                    to={`/blog/${post.id}`}
                    className="w-full text-secondary hover:text-accent font-medium transition-colors duration-300 py-2 px-4 rounded-lg text-center hover:bg-secondary/10 block text-sm sm:text-base"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Custom CSS for better text handling on mobile */}
      <style jsx>{`
        @media (max-width: 640px) {
          .professional-heading {
            font-size: 1.75rem;
            line-height: 2rem;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          .innovation-feature-card {
            margin-bottom: 1rem;
          }
          
          /* Ensure text doesn't overflow on mobile */
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-word;
          }
          
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-word;
          }
          
          /* Better spacing on mobile */
          .grid {
            gap: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .professional-heading {
            font-size: 1.5rem;
            line-height: 1.8rem;
          }
          
          .professional-body {
            font-size: 0.9rem;
          }
          
          .innovation-feature-card h3 {
            font-size: 1rem;
            min-height: 3rem;
          }
          
          .innovation-feature-card p {
            font-size: 0.85rem;
            min-height: 4rem;
          }
        }
        
        /* Fix for very small screens */
        @media (max-width: 360px) {
          .professional-heading {
            font-size: 1.3rem;
          }
          
          .innovation-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Blog;