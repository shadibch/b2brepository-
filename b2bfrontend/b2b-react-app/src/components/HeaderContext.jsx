// BranchContext.js

import React, { createContext, useContext, useState } from "react";

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [itemscount, setitemscount] = useState(0);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  return (
    <HeaderContext.Provider value={{
      itemscount,
      setitemscount,
      selectedBranchId,
      setSelectedBranchId,
      refreshCartCount
    }}>
      {children}
    </HeaderContext.Provider>
  );
};

// Hook for easy access
export const useHeaderContext = () => useContext(HeaderContext);
const refreshCartCount = async () => {
  try {
    const response = await axiosInstance.get("/api/cart/");
    setitemscount(response.data.cart_items_count);
  } catch (err) {
    console.error("Error refreshing cart:", err);
  }
};

let branch;
let cartItemsCount

export const selectBranchId = (branchId)=>{
    branch = branchId;
};

export const selectedBranchId = ()=>{
    return branch;
};

export const setitemscount =(cartsItemCount) => {
    cartItemsCount = cartsItemCount;
};

export const itemscounts = () => {
    return cartItemsCount;
}