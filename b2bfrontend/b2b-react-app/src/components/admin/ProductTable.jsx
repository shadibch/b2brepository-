import React, { useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { t, isRTL } from "../../utils/translator";
import { formatNumber } from "../../utils/translator";

function ProductTable({ products, selected, handleProductSelect, handleDelete, getProductImage }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [contextProduct, setContextProduct] = useState(null);

  const handleClose = () => {
    setContextMenu(null);
    setContextProduct(null);
  };

  const handleMoveTo = () => {
    handleContextProductSelected(contextProduct);
    handleClose();
  };

  const align = isRTL() ? 'right' : 'left';

  return (
    <>
      <Box
  sx={{
    display: "grid",
    gap: 3,
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  }}
>
       
          {products.map((p) => (

              <Card
              key={p.id}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
                onClick={() => handleProductSelect(p)}
                onContextMenu={(e) => handleContextMenu(e, p)}
              >
               
             
                  <CardMedia
                    component="img"
                    height="200"
                    image={getProductImage(p)}
                    alt={p.name || t('Product Image')}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ textAlign: align }}>
                    <Typography 
                      variant="subtitle1" 
                      component="div"
                      sx={{ 
                        fontWeight: 'bold',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {p.name || t('No Name')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {t("Part ID")}: {p.part_id || '-'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.primary"
                      fontWeight="medium"
                    >
                      {formatNumber(p.base_price || 0)} {p.currency || 'SAR'}
                    </Typography>
                  </CardContent>

                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: align === 'right' ? 'auto' : 8,
                    left: align === 'right' ? 8 : 'auto',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id);
                    }}
                    sx={{ 
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'error.light', color: 'white' },
                      boxShadow: 2,
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>

          ))}
     
      </Box>

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
      </Menu>
    </>
  );
}

export default ProductTable;
