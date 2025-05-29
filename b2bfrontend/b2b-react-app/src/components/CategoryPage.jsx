import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Container, Button } from "react-bootstrap";
import axiosInstance from "./axiosInstance";
import GroupSlide from "./GroupSlide";
import { useNavigate } from "react-router-dom"; // ✅ Handles navigation
import {API_BASE_URL,DEFAULT_IMAGE} from '../utils/settings';
import { useParams } from "react-router-dom";
import { t ,switchLanguage,isRTL,getCurrentLanguage,formatNumber} from '../utils/translator';
const CategoryPage = () => {
  const { categoryId } = useParams(); //
  const [products, setProducts] = useState([]);
	const [categoryHierarchy, setCategoryHierarchy] = useState([]);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ✅ Sidebar open by default
  const navigate = useNavigate();


  // ✅ Function to truncate long product names
  const truncateText = (text, maxLength = 34) => {
    return text.length > 37 ? `${text.substring(0, maxLength)}...` : text;
  };
   const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // ✅ Toggle sidebar state
  };


  // ✅ Fetch Categories using Axios
 
  
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get(`/api/products/category/${categoryId}`);
      setProducts(response.data.results);
	  axiosInstance.get(`/api/category_hierarchy/${categoryId}/`)
            .then(res => setCategoryHierarchy(res.data))
            .catch(err => console.error("Error fetching category hierarchy:", err));
	   setIsSidebarOpen(true);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };


  useEffect(() => {
	fetchProducts();
  }, []);

  return (
    <>

	{  (<GroupSlide updateProducts={setProducts} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} categoryId={categoryId} />)}
      <Container className={`mt-5 text-center ${isSidebarOpen ? "shrink" : "expand"}`}>
    

        {/* ✅ Bottom Part: Product Grid */}
        <div className={`bottom-section ${isSidebarOpen ? "shrink" : "expand"}`} >
         		           <div className="category-navigation">
				   <a href='/' className="category-link"> {t("home")} &gt; </a>
        {categoryHierarchy.map((category, index) => (
          <a 
            key={category.id} 
            href={`/categorypage/${category.id}`} 
            className="category-link"
          >
            {category.name} {index < categoryHierarchy.length - 1 ? ">" : ""}
          </a>
        ))}
      </div>
          <div className="product-grid">
		  
            {products.map((product) => (
              <div
                key={product.id}
                className="product-item"
                onClick={() => navigate(`/productitem/${product.part_id}`)} // ✅ Navigates on click
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

                {/* ✅ Product Name (Truncated if too long) */}
                <p className="product-name">{truncateText(product.name)}</p>

                {/* ✅ Product Price */}
                <p className="product-price">
  {product.price > 0 ? (
    <>
      <span style={{ color: "red" }}>{formatNumber(product.price,product.currency)}</span>
      {" "}
      <span style={{ color: "black", textDecoration: "line-through", fontSize:12 }}>
        {formatNumber(product.base_price,product.currency)}
      </span>
    </>
  ) : (
    <span>{formatNumber(product.base_price,product.currency)}</span>
  )}
</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
};

export default CategoryPage;
