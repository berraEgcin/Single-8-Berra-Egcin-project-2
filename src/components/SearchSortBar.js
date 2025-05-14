import React from 'react';

const SearchSortBar = ({ categories, onSearchChange, onCategoryChange, onSortChange }) => {
  return (
    <div className="row filters-container mb-4">
      <div className="col-md-3 col-sm-6 mb-2">
        <div className="input-group">
          <span className="input-group-text rounded-start border-end-0">Categories</span>
          <select 
            className="form-select rounded-end border-start-0"
            onChange={(e) => onCategoryChange(e.target.value)}
            defaultValue="all"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="col-md-4 col-sm-6 mb-2">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search products..."
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="col-md-4 col-sm-12 mb-2">
        <div className="input-group">
          <select 
            className="form-select"
            onChange={(e) => onSortChange(e.target.value)}
            defaultValue=""
          >
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-asc">Rating: Low to High</option>
            <option value="rating-desc">Rating: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchSortBar;