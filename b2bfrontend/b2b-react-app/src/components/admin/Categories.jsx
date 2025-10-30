import React from "react";

import { ExpandMore, ChevronRight } from "@mui/icons-material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

/**
 * CategoryTree component using MUI RichTreeView
 */
const CategoryTree = ({
  categories = [],
  selectedCategory,
  onSelect,
  expandedCategories,
  setExpandedCategories,
}) => {
  // 🔹 Convert category objects into a tree data structure MUI RichTreeView understands
  const transformCategories = (cats) =>
    cats.map((cat) => ({
      id: String(cat.id),
      label: cat.label || cat.name,
      children: cat.children ? transformCategories(cat.children) : [],
    }));

  const treeItems = transformCategories(categories);

  // 🔹 Handle expand/collapse
  const handleToggle = (event, nodeIds) => {
    setExpandedCategories(new Set(nodeIds));
  };

  // 🔹 Handle selection
  const handleSelect = (event, nodeId) => {
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
    const node = findNodeById(treeItems, nodeId);
    if (node) {
      onSelect({ id: node.id, label: node.label });
    }
  };

  return (
   
      <RichTreeView
        aria-label="category tree"
        items={treeItems}
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        expandedItems={[...expandedCategories].map(String)}
        selectedItems={
          selectedCategory ? [String(selectedCategory.id)] : []
        }
        onExpandedItemsChange={(event, nodeIds) =>
          handleToggle(event, nodeIds)
        }
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
   
  );
};

export default CategoryTree;
