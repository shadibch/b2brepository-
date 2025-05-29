import React, { useState } from "react";
import MenuList from "./MenuList";
import { FaMinus, FaPlus } from "react-icons/fa";

export default function MenuItem({ item }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };
{console.log("item" , JSON.stringify(item))}
  return (
    <li>
      <div className="menu-item">
        <p>{item.label}</p>
        {hasChildren && (
          <span onClick={handleToggle} className="toggle-icon">
            {isExpanded ? <FaMinus /> : <FaPlus />}
          </span>
        )}
      </div>
      {hasChildren && isExpanded && <MenuList list={item.children} />}
    </li>
  );
}