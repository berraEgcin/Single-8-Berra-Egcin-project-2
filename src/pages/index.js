import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Carousel from '../components/Carousel';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import SearchSortBar from '../components/SearchSortBar';

const API_URL = 'http://localhost:3001';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [campaignItems, setCampaignItems] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, campaignsResponse] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/campaignItems`)
        ]);

        const productData = productsResponse.data;
        setProducts(productData);
        setFilteredProducts(productData);

        const uniqueCategories = [...new Set(productData.map(product => product.category))];
        setCategories(uniqueCategories);

        const campaignProducts = campaignsResponse.data.map(campaign => {
          const product = productData.find(p => p.id === campaign.productId);
          return {
            ...product,
            newPrice: campaign.newPrice,
            isCampaign: true
          };
        }).filter(product => product); 

        setCampaignItems(campaignProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategory, sortOption, products]);

  const applyFilters = () => {
    let filtered = [...products];
    
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (sortOption) {
      switch (sortOption) {
        case 'price-asc':
          filtered.sort((a, b) => {
            const priceA = a.isCampaign ? a.newPrice : a.price;
            const priceB = b.isCampaign ? b.newPrice : b.price;
            return priceA - priceB;
          });
          break;
        case 'price-desc':
          filtered.sort((a, b) => {
            const priceA = a.isCampaign ? a.newPrice : a.price;
            const priceB = b.isCampaign ? b.newPrice : b.price;
            return priceB - priceA;
          });
          break;
        case 'rating-asc':
          filtered.sort((a, b) => {
            const ratingA = a.reviews ? (a.reviews.reduce((sum, review) => sum + review.stars, 0) / a.reviews.length) : 0;
            const ratingB = b.reviews ? (b.reviews.reduce((sum, review) => sum + review.stars, 0) / b.reviews.length) : 0;
            return ratingA - ratingB;
          });
          break;
        case 'rating-desc':
          filtered.sort((a, b) => {
            const ratingA = a.reviews ? (a.reviews.reduce((sum, review) => sum + review.stars, 0) / a.reviews.length) : 0;
            const ratingB = b.reviews ? (b.reviews.reduce((sum, review) => sum + review.stars, 0) / b.reviews.length) : 0;
            return ratingB - ratingA;
          });
          break;
        default:
          break;
      }
    }
    
    setFilteredProducts(filtered);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
  };

  return (
    <div>
      <Navbar />
      
      
      <div className="mb-5">
        <Carousel campaignItems={campaignItems} />
      </div>

      
      
      <div className="container mb-4">
        <SearchSortBar 
          categories={categories}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
        />
      </div>

  
      <div className="container">
        {filteredProducts.length === 0 ? (
          <div className="text-center">
            <h3>No products found</h3>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="col">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
