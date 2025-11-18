import React, { useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { t } from "../../utils/translator";

function ProductTable({ products, selected, handleProductSelect, handleDelete, getProductImage,handleContextProductSelected }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [contextProduct, setContextProduct] = useState(null);

  const handleContextMenu = (event, product) => {
    event.preventDefault(); // Prevent the default right-click menu
    setContextProduct(product);
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : // re-open the menu
          null
    );
  };

  const handleClose = () => {
    setContextMenu(null);
    setContextProduct(null);
  };

  const handleMoveTo = () => {
    console.log("Move to clicked for:", contextProduct);
    handleContextProductSelected(contextProduct);
    // add your "move to" logic here
    handleClose();
  };

  return (
    <>
      <TableContainer sx={{ maxHeight: 420 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t("Image")}</TableCell>
              <TableCell>{t("Product Name")}</TableCell>
              <TableCell>{t("Part ID")}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p.id}
                hover
                selected={selected?.id === p.id}
                onClick={() => handleProductSelect(p)}
                onContextMenu={(e) => handleContextMenu(e, p)} // Right-click handler
                sx={{ cursor: "pointer" }}
              >
                <TableCell sx={{ width: 80 }}>
                  <Avatar
                    src={getProductImage(p)}
                    variant="rounded"
                    sx={{ width: 60, height: 60 }}
                  />
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.part_id}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Contextual Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleMoveTo}>{t("Move To")}</MenuItem>
        {/* Add more menu items here if needed */}
      </Menu>
    </>
  );
}

export default ProductTable;
