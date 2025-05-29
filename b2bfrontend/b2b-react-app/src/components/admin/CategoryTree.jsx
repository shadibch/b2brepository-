
import React, { useState, useEffect } from "react";
import TreeView from "./TreeView";

import axiosInstance from "../axiosInstance";


const CategoryTree = ({ onSelectCategory, onCreateCategory }) => {
  const [treeData, setTreeData] = useState([]);


  useEffect(() => {
    axiosInstance.get("/api/admin/categories/")
      .then((res) => {
        console.log("API Response:", res.data); // Debugging API response
        setTreeData(res.data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);
  

  const handleDrop = (updatedTree) => {
    setTreeData(updatedTree);
    axiosInstance.post("/api/admin/updatecategory", { tree: updatedTree });
  };

  const handleContextMenu = (event, node) => {
    event.preventDefault();
    onCreateCategory(node);
  };

  return (
    <>
    {console.log("TreeView received treeData:", JSON.stringify( treeData))
    }
      {treeData.length === 0 ? (
        <div>Loading categories...</div>
      ) : (
        <TreeView treeData={treeData} />
      )}
    </>
  );
  
};

export default CategoryTree;
