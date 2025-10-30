import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { ExpandMore, ChevronRight, MoreVert } from "@mui/icons-material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

const CategoryTree = ({ onSelectCategory, onCreateCategory }) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // 🔹 Fetch categories on mount
  useEffect(() => {
    axiosInstance
      .get("/api/admin/categories/")
      .then((res) => {
        console.log("API Response:", res.data);
        const formattedData = formatTreeData(res.data);
        setTreeData(formattedData);
      })
      .catch((error) => console.error("Error fetching categories:", error))
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Convert your backend format to MUI tree node format
  const formatTreeData = (nodes) =>
    nodes.map((node) => ({
      id: node.id,
      label: node.name,
      children: node.children ? formatTreeData(node.children) : [],
    }));

  // 🔹 Handle node selection
  const handleNodeSelect = (event, nodeId) => {
    const node = findNodeById(treeData, nodeId);
    if (node && onSelectCategory) onSelectCategory(node);
  };

  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 🔹 Context menu (right-click) handler
  const handleContextMenu = (event, node) => {
    event.preventDefault();
    setContextMenuAnchor(event.currentTarget);
    setSelectedNode(node);
  };

  const handleCloseContextMenu = () => {
    setContextMenuAnchor(null);
  };

  const handleCreateCategory = () => {
    if (onCreateCategory && selectedNode) onCreateCategory(selectedNode);
    handleCloseContextMenu();
  };

  // 🔹 Handle drag/drop (optional — depends on MUI X Pro)
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

    
    </Box>
  );
};

export default CategoryTree;
