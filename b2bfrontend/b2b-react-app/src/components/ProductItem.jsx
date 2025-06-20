import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {isAuthenticated} from "./axiosInstance";
import axiosInstance from "./axiosInstance";
import ReactDOM from "react-dom";
import { setitemscount, useHeaderContext } from "./HeaderContext";
import { t ,isRTL,formatNumber} from '../utils/translator';
import {API_BASE_URL} from '../utils/settings'
const ProductItem = () => {
  const { partId } = useParams(); // ✅ Extract product ID from URL
  const [product, setProduct] = useState(null);
  const [categoryHierarchy, setCategoryHierarchy] = useState([]); // ✅ State for categories
  const [selectedImage, setSelectedImage] = useState(""); // ✅ Stores main image
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Controls modal visibility

  const [quantity, setQuantity] = useState(1);
  const {  selectedBranchId } = useHeaderContext();
  const { refreshCartCount } = useHeaderContext();
  const handleAddToCart = () => {
    // Send quantity to API or cart manager
    
    console.log("Adding to cart:", quantity);
    axiosInstance.post(`/api/add-item/${selectedBranchId}/`,{
      
        "product": product.id,
        "quantity": quantity
    }
    )
    .then(response => {
      const searchEvent = new CustomEvent('updateCart');
      window.dispatchEvent(searchEvent);
    })
    .catch(error => console.error("Error fetching product:", error));
  };
  

const Modal = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
};

  useEffect(() => {
    import("./ProductItem.css");
    
    axiosInstance.get(`/api/product/${partId}/`)
      .then(response => {
        setProduct(response.data);
        const closestCategory = response.data.closest_category;
        if (closestCategory) {
        const res =   axiosInstance.get(`/api/category_hierarchy/${closestCategory}/`)
            .then(res => {
              setCategoryHierarchy(res.data);
              console.log(res.data);
            })
            .catch(err => console.error("Error fetching category hierarchy:", err));
        }
        if (response.data.media_list.length > 0) {
          setSelectedImage(API_BASE_URL + response.data.media_list[0]);
        }
      })
      .catch(error => console.error("Error fetching product:", error));
  }, [partId]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-container">
      {/* LEFT: Image Display */}
      <div className="image-gallery">

        <div className="thumbnail-bar">
          {product.media_list.map((img, index) => (
            <img 
              key={index} 
              src={API_BASE_URL + img} 
              alt={`Preview ${index}`} 
              className="thumbnail"
              onMouseEnter={() => setSelectedImage(API_BASE_URL + img)} // ✅ Hover to preview
              onClick={() => setSelectedImage(API_BASE_URL + img)} // ✅ Click to magnify
            />
          ))}
        </div>
		<div>
		           <div className="category-navigation">
				   <a href='/' className="category-link">{t('home')}  &gt; </a>
        {categoryHierarchy.map((category, index) => (
          <a 
            key={category.id} 
            href={`/categorypage/${category.id}`} 
            className="category-link"
          >
            {category.name} {index < categoryHierarchy.length - 1 ?  '>' : ""}
          </a>
        ))}
      </div>
		   <img 
          className="main-image" 
          src={selectedImage} 
          alt="Main Product" 
          onClick={() => setIsModalOpen(true)} // ✅ Opens modal on click
        />
        {isAuthenticated() &&(<>
        <></>
        <div className="add_container">

  <input
    id="quantity"
    type="number"
    min="1"
    value={quantity}
    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
    className="quantity-input"
  />
  <button className="add_to_cart" onClick={handleAddToCart}>{t('add_to_cart')}</button>
</div>

        </>)}
		</div>
      </div>

      {/* Modal for Full Image */}

	

      {/* RIGHT: Product Info */}
      <div className="product-info">
        <h2 className="product-header">{product.name}</h2>
		
        <hr />
		<div className="price">{product.price > 0 ? (
    <>
      <span style={{ color: "red" }}>  {formatNumber(product.price, product.currency)} </span>
      {" "}
      <span style={{ color: "black", textDecoration: "line-through" }}>
       {formatNumber(product.base_price, product.currency)}   
      </span>
    </>
  ) : (
    <span>   {formatNumber(product.base_price, product.currency)}   </span>
  )}</div>
  <div style={{color: product.availibility == 'M'
  ? 
    'red' : 'green' ,fontWeight:'bold'}}>{
      t(product.availibility == 'M' ? 'Market' : 'Stock')}</div>
        {/* Attributes */}
        {product.attributs && (
          <div className="attributes">
            {Object.entries(product.attributs).map(([key, value]) => (
              <p key={key}>
                <strong>{key}: </strong> {value}
              </p>
            ))}
          </div>
        )}
		  {isModalOpen && (
        <div className="dialog-modal" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content"  onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Magnified Product" />
          </div>
        </div>
      )}
        <hr />

        {/* About Section */}
        <h3 dir={isRTL() ? "rtl" : "ltr"}><strong>{t("about_this_item")}</strong></h3>
        <p 
          dangerouslySetInnerHTML={{ __html: product.description }}
          dir={isRTL() ? "rtl" : "ltr"}
        ></p>
      </div>
    </div>
  );
};

export default ProductItem;
