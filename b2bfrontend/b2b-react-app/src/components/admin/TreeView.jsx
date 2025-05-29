import React from "react";
import MenuList from "./MenuList";

import "./styles.css";

export default function TreeView({treeData })  {
    {
        console.log("AFter received treeData:", JSON.stringify( treeData))
    }
  return (
    
    <div className="tree-view-container">
      <MenuList list={treeData} />
    </div>
  );
}