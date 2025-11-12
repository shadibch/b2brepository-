import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import {
  Box,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

const CategoryTree = ({ onSelectCategory, onCreateCategory, onDropCategory }) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // 🔹 Fetch categories
  useEffect(() => {
    axiosInstance
      .get("/api/admin/categories/")
      .then((res) => {
        const formattedData = formatTreeData(res.data);
        setTreeData(formattedData);
      })
      .catch((error) => console.error("Error fetching categories:", error))
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Convert backend data to MUI Tree format
  const formatTreeData = (nodes) =>
    nodes.map((node) => ({
      id: node.id,
      label: node.name,
      children: node.children ? formatTreeData(node.children) : [],
    }));

  // 🔹 Find node by id
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

  // 🔹 Handle select
  const handleNodeSelect = (event, nodeId) => {
    const node = findNodeById(treeData, nodeId);
    if (node && onSelectCategory) onSelectCategory(node);
  };

  // 🔹 Handle right-click (context menu)
  const handleContextMenu = (event, node) => {
    event.preventDefault();
    setSelectedNode(node);
    setContextMenuAnchor({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    });
  };

  const handleCloseContextMenu = () => setContextMenuAnchor(null);

  const handleCreateCategory = () => {
    if (onCreateCategory && selectedNode) onCreateCategory(selectedNode);
    handleCloseContextMenu();
  };

  const handleDropCategory = () => {
    if (onDropCategory && selectedNode) onDropCategory(selectedNode);
    handleCloseContextMenu();
  };

  // 🔹 Handle drag/drop (optional)
  const handleDrop = async (updatedTree) => {
    setTreeData(updatedTree);
    try {
      await axiosInstance.post("/api/admin/updatecategory", {
        tree: updatedTree,
      });
    } catch (err) {
      console.error("Error updating category tree:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading categories...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 400, bgcolor: "background.paper", p: 2 }}>
      <RichTreeView
        items={treeData}
        defaultExpandedItems={treeData.length ? [treeData[0].id] : []}
        slots={{
          expandIcon: ExpandMore,
          collapseIcon: ChevronRight,
        }}
        onItemClick={handleNodeSelect}
        onContextMenu={(event, itemId) => {
          const node = findNodeById(treeData, itemId);
          if (node) handleContextMenu(event, node);
        }}
        sx={{
          "& .MuiTreeItem-label": {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
          },
        }}
      />

      {/* 🔹 Context Menu */}
      <Menu
        open={!!contextMenuAnchor}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuAnchor !== null
            ? { top: contextMenuAnchor.mouseY, left: contextMenuAnchor.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCreateCategory}>Create Category</MenuItem>
        <MenuItem onClick={handleDropCategory}>Drop</MenuItem>
      </Menu>
    </Box>
  );
};

export default CategoryTree;
