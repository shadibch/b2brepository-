import React, { useEffect, useState } from "react";

import { Container, Button } from "react-bootstrap";





import axiosInstance from "../axiosInstance";
import { formatNumber, isRTL, t } from "../../utils/translator";
import { API_BASE_URL, DEFAULT_IMAGE } from "../../config";
import { Checkbox } from "antd";
const Products = ({ reference_id ,onSelectionChange,reference_key }) => {
  
  const [products, setProducts] = useState([]);
	const [checkedProducts, setCheckedProducts] = useState([]);
  const [query, setQuery] = useState('');


  const handleSearch = async (reference_id) => {
    try {
      const response = await axiosInstance.get(`/api/search_text?${reference_key}=${reference_id}&q=${query}`);
      setProducts(response.data.results);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
  // ✅ Function to truncate long product names
  const truncateText = (text, maxLength = 34) => {
    return text.length > 37 ? `${text.substring(0, maxLength)}...` : text;
  };



  
  const fetchProducts = async (reference_id) => {
    try {
      const response = await axiosInstance.get(`/api/products/?${reference_key}=${reference_id}`);
      setProducts(response.data.results);
	   
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const handleCheckboxChange = (product, checked) => {
    const updated = checked
      ? [...checkedProducts, product]
      : checkedProducts.filter((p) => p.id !== product.id);

    setCheckedProducts(updated);
    onSelectionChange(updated);
  };

  
  useEffect(() => {
    // Load correct CSS based on language direction
    if (isRTL()) {
      import("../IndexPage_rtl.css");
    } else {
      import("../IndexPage.css");
    }
  

  setProducts([]);

      // Otherwise, fetch products normally
      fetchProducts(reference_id);
    
  
    // --- NEW: Listen for custom 'searchResults' event
    const handleSearchEvent = (event) => {
      setProducts(event.detail); // event.detail contains new search results
    };
  

   
    
    window.addEventListener('searchResults', handleSearchEvent);
  
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('searchResults', handleSearchEvent);
    };
  
  }, [location.state, setProducts,reference_id]);
  

  return (
    <>
	
      <Container className={`mt-5 text-center ${ 
              isRTL() ? "expand-rtl" : "expand"   }`}>
        <header className="header">
    


      <div className="header-middle">
        <input
          type="text"
          placeholder={`${t('search')}...`} // ✅ Use template literal for translation
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="search-button" onClick={()=>handleSearch(reference_id)}>  {t('search')}</button>
      </div>


    </header>


        {/* ✅ Bottom Part: Product Grid */}
        <div className={`bottom-section  "expand"`} >
         
          <div className="product-grid">
          {products.map((product) => (
  <div
    key={product.id}
    className="product-item"
    onClick={() => console.log(`/productitem/${product.part_id}`)}
    onMouseEnter={(e) => {
      if (product.media_url) {
        e.currentTarget.querySelector("img").src = `${product.media_url}`;
      }
    }}
    onMouseLeave={(e) => {
      if (product.media_url) {
        e.currentTarget.querySelector("img").src = `${product.media_url}`;
      
      }
    }}
  >
    {/* ✅ Product Image */}
    <Checkbox id={product.id}   onChange={(e) => handleCheckboxChange(product, e.target.checked)}/>
    <img
      src={product.media_url ? `${product.media_url}` : DEFAULT_IMAGE}
      alt={product.name}
      className="product-image"
    />

    {/* ✅ Product Name */}
    <p className="product-name">{truncateText(product.name)}</p>

    {/* ✅ Product Price */}
    <p className="product-price">
      {product.price > 0 ? (
        <>
          <span style={{ color: "red" }}>{formatNumber(product.price, product.currency)}</span>{" "}
          <span style={{ color: "black", textDecoration: "line-through", fontSize: 12 }}>
            {formatNumber(product.base_price, product.currency)}
          </span>
        </>
      ) : (
        <span>{formatNumber(product.base_price, product.currency)}</span>
      )}
    </p>

    {/* ✅ Availability - moved to new line */}
    <p>
      <span
        style={{
          color: product.availibility === 'M' ? 'red' : 'green',
          fontWeight: 'bold'
        }}
      >
        {t(product.availibility === 'M' ? 'Market' : 'Stock')}
      </span>
    </p>
  </div>
))}

          </div>
        </div>
      </Container>

    </>
  );
};

export default Products;
