import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { Accordion, Form } from "react-bootstrap";
import { t ,switchLanguage,isRTL,getCurrentLanguage} from '../utils/translator';
import("./Sidebar.css");
const GroupSlide = ({ updateProducts,isOpen, toggleSidebar,categoryId }) => {
  const [productGroups, setProductGroups] = useState([]);
  const [selectedSubgroups, setSelectedSubgroups] = useState({});
  const togglelabel = isOpen ?"❮" : "❯";  





useEffect(() => {

  console.log(categoryId); // Logs the updated categoryId
  axiosInstance.get(`/api/product_groups/${categoryId}/`)
    .then((response) => setProductGroups(response.data))
    .catch((error) => console.error("Error fetching product groups:", error));
     document.body.classList.toggle("rtl", isRTL());
    
        

}, [getCurrentLanguage(),categoryId]); // ✅ Add categoryId to the dependency array

const clearFilters = () => {
  setSelectedSubgroups({}); // ✅ Clears all selected subgroups

  // ✅ Uncheck all checkboxes by resetting DOM elements
  document.querySelectorAll(".sidebar input[type='checkbox']").forEach(checkbox => {
    checkbox.checked = false;
  });

  // ✅ Trigger an empty filter request to fetch all products
  axiosInstance.post(`/api/filter_products/${categoryId}/`, { subgroup_id_lists: [[]] }) 
    .then((response) => updateProducts(response.data.results)) 
    .catch((error) => console.error("Error clearing filters:", error));
};


  const handleCheckboxChange = (groupId, subgroupId, isChecked) => {
  setSelectedSubgroups((prevState) => {
    const updatedState = { ...prevState };

    if (!updatedState[groupId]) {
      updatedState[groupId] = new Set();
    }

    if (isChecked) {
      updatedState[groupId].add(subgroupId); // ✅ Add when checked
    } else {
      updatedState[groupId].delete(subgroupId); // ✅ Remove when unchecked
    }
	 const subgroup_id_lists = Object.values(updatedState)
  .filter(set => set.size > 0) // ✅ Eliminates empty sets
  .map(set => [...set]); // ✅ Converts sets to arrays

// ✅ If subgroup_id_lists is empty, add an empty list inside
if (subgroup_id_lists.length === 0) {
  subgroup_id_lists.push([]);
}

 document.body.classList.toggle("rtl", isRTL());
	
    axiosInstance.post(`/api/filter_products/${categoryId}/`, { "subgroup_id_lists": subgroup_id_lists })
      .then((response) => updateProducts(response.data.results)) // ✅ Update products in IndexPage
      .catch((error) => console.error("Error filtering products:", error));

    return updatedState;
  });

 
};




  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"} ${isRTL() ? "rtl" : ""}` }>



      <Accordion>
        {productGroups.map((group) => (
          <Accordion.Item key={group.id} eventKey={String(group.id)}>
            <Accordion.Header>{group.name}</Accordion.Header>
            <Accordion.Body>
              {group.subgroups.map((subgroup) => (
                <Form.Check 
                  key={subgroup.id}
                  type="checkbox"
                  label={subgroup.name}
                  value={subgroup.id}
                 onChange={(e) => handleCheckboxChange(group.id, subgroup.id, e.target.checked)}

                />
              ))}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
	  <div className="clear-filter-container">
  <button className="clear-filter-btn" onClick={clearFilters}>{t('reset')}</button>
</div>

    </div>
  );
};

export default GroupSlide;
