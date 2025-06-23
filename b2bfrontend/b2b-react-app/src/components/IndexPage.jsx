import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Container, Button } from "react-bootstrap";
import axiosInstance from "./axiosInstance";
import GroupSlide from "./GroupSlide";
import { t ,switchLanguage,isRTL,getCurrentLanguage,formatNumber} from '../utils/translator';
import { useNavigate,useLocation  } from "react-router-dom"; // ✅ Handles navigation
import {API_BASE_URL,DEFAULT_IMAGE} from '../utils/settings';
const IndexPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
	const [categoryId,setCategoryId] = useState([]);
   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ Sidebar open by default
const navigate = useNavigate();



  // ✅ Function to truncate long product names
  const truncateText = (text, maxLength = 34) => {
    return text.length > 37 ? `${text.substring(0, maxLength)}...` : text;
  };
   const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // ✅ Toggle sidebar state
  };


  // ✅ Fetch Categories using Axios
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/api/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/api/products/");
      setProducts(response.data.results);
	   setIsSidebarOpen(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const fetchProductsByCategory = async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/api/products/category/${categoryId}`);
	  setCategoryId(categoryId);
	   setIsSidebarOpen(true);
      setProducts(response.data.results); // ✅ Update product list dynamically
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const location = useLocation();
  useEffect(() => {
    // Load correct CSS based on language direction
    if (isRTL()) {
      import("./IndexPage_rtl.css");
    } else {
      import("./IndexPage.css");
    }
  
    // Fetch categories initially
    fetchCategories();
  
    // If coming from navigation (location.state), set products
    if (location.state?.results) {
      setProducts(location.state.results);
      window.history.replaceState({}, document.title);
    } else {
      // Otherwise, fetch products normally
      fetchProducts();
    }
  
    // --- NEW: Listen for custom 'searchResults' event
    const handleSearchEvent = (event) => {
      setProducts(event.detail); // event.detail contains new search results
    };
  

    const dispatchEvent = (event)=>{
      navigate(event.detail);
    };
    window.addEventListener('dispatch', dispatchEvent);
    window.addEventListener('searchResults', handleSearchEvent);
  
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('searchResults', handleSearchEvent);
    };
  
  }, [location.state, setProducts]);
  
    if(localStorage.getItem("authToken") &&
     localStorage.getItem("main_url")&& localStorage.getItem("main_url")!="/" ) {

      navigate(localStorage.getItem("main_url"));
    }
  return (
    <>
	{ categoryId >0 && (<GroupSlide updateProducts={setProducts} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} categoryId={categoryId} />)}
      <Container className={`mt-5 text-center ${!isSidebarOpen ? 
              isRTL() ? "expand-rtl" : "expand" :isRTL() ? "shrink-rtl" : "shrink"} }`}>
        {/* Upper Part: Rounded Buttons for Categories */}
        <div className={`categories-container`}>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline-primary"
              className="category-button"
              data-id={category.id} 
			   onClick={() => fetchProductsByCategory(category.id)}// ✅ Stores ID as a hidden attribute
            >
              <img src={category.file} alt={category.name} className="category-icon" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* ✅ Bottom Part: Product Grid */}
        <div className={`bottom-section ${isSidebarOpen ? "shrink" : "expand"}`} >
         
          <div className="product-grid">
          {products.map((product) => (
  <div
    key={product.id}
    className="product-item"
    onClick={() => navigate(`/productitem/${product.part_id}`)}
    onMouseEnter={(e) => {
      if (product.media_list.length > 1) {
        e.currentTarget.querySelector("img").src = `${API_BASE_URL}${product.media_list[1]}`;
      }
    }}
    onMouseLeave={(e) => {
      if (product.media_list.length > 1) {
        e.currentTarget.querySelector("img").src = `${API_BASE_URL}${product.media_list[0]}`;
      }
    }}
  >
    {/* ✅ Product Image */}
    <img
      src={product.media_list.length > 0 ? `${API_BASE_URL}${product.media_list[0]}` : DEFAULT_IMAGE}
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

export default IndexPage;
