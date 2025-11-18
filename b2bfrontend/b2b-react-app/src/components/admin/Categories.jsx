import React, { useEffect, useState } from "react";

import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { Box, Menu, MenuItem } from "@mui/material";
import axiosInstance from "../axiosInstance";
import { t } from "../../utils/translator";


/**
 * CategoryTree component using MUI RichTreeView
 */
const CategoryTree = ({

  selectedCategory,
  onSelect,
  expandedCategories,
  setExpandedCategories,
  selectedContextProduct,
  handleMovedSelectedProduct
}) => {
  // 🔹 Convert category objects into a tree data structure MUI RichTreeView understands
  useEffect(() => {
    axiosInstance
      .get("/api/admin/categories/")
      .then((res) => {
        const formatted = [{ id: '1', label: t('Root'), children: formatTree(res.data) }];
        setTreeData(formatted);
      })
      .catch((error) => console.error("Error fetching categories:", error))
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Convert backend data to MUI Tree format
  const formatTree = (nodes) => (
    nodes.map(n => ({ id: String(n.id || `node-${Math.random()}`), label: n.label || n.name || n.title || '', children: n.children ? formatTree(n.children) : [] }))
  );

    const [contextMenuAnchor, setContextMenuAnchor] = useState(null);
    const [treeData, setTreeData] = useState([]);
    const [selectedNode,setSelectedNode] = useState();
  const handleContextMenu = (event, node) => {
    event.preventDefault();
    setSelectedNode(node);
    setContextMenuAnchor({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
  };

  // 🔹 Handle expand/collapse
  const handleToggle = (event, nodeIds) => {
    setExpandedCategories(new Set(nodeIds));
  };
  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children?.length) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  
  // 🔹 Handle selection
  const handleSelect = (event, nodeId) => {
    console.log(selectedContextProduct);
    const node = findNodeById(treeData, nodeId);

    if (node) {
      setSelectedNode({ id: node.id, label: node.label });
      onSelect({ id: node.id, label: node.label });
    }
  };

  const handleMovedProduct = ()=> {
    handleMovedSelectedProduct();
    setContextMenuAnchor(null);
    
  };
  const handleCloseContextMenu = () => setContextMenuAnchor(null);

  return (
   <Box>
      <RichTreeView
        aria-label="category tree"
        items={treeData}
        onItemClick={handleSelect}
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        defaultExpandedItems={treeData.length ? [treeData[0].id] : []}
        expandedItems={[...expandedCategories].map(String)}
        selectedItems={
          selectedCategory ? [String(selectedCategory.id)] : []
        }
        onExpandedItemsChange={(event, nodeIds) =>
          handleToggle(event, nodeIds)
        }
        onContextMenu={(event, itemId) => {
        
          if (selectedNode) handleContextMenu(event, selectedNode);
        }}
        onSelectedItemsChange={(event, nodeIds) => {
          // RichTreeView passes array for multiple selection, so handle accordingly
          const selectedId = Array.isArray(nodeIds)
            ? nodeIds[0]
            : nodeIds;
          handleSelect(event, selectedId);
        }}
        sx={{
          "& .MuiTreeItem-label": {
            cursor: "pointer",
            fontWeight: (theme) =>
              selectedCategory ? "bold" : "normal",
          },
        }}
      />
      <Menu
        open={!!contextMenuAnchor && !!selectedContextProduct}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuAnchor !== null
            ? { top: contextMenuAnchor.mouseY, left: contextMenuAnchor.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleMovedProduct}>Move product here</MenuItem>
           </Menu>
</Box>   
  );
};

export default CategoryTree;
