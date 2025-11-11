import React from "react";
import { Box, CardMedia, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TechnicalDetailsTable from "./TechnicalDetailsTable";
import { t } from "../utils/translator";

const SimilarProducts = ({ similarProducts = [] }) => {
  const navigate = useNavigate();

  const handleNavigate = (partId) => {
    navigate(`/productitem/${partId}`);
  };

  if (!similarProducts || similarProducts.length === 0) {
    return null; // or show a message like: <Typography>No similar products</Typography>
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t("similar_products")}
      </Typography>
      <Grid container spacing={1}>
      {similarProducts.map((product) => (
        <Box key={product.id} sx={{ mb: 2 }}>


          <CardMedia
                component="img"
                height="100"
                image={product.image_path}
                alt="Main Product"
                sx={{ objectFit: 'contain' }}
              />
                        <Typography
            variant="h6"
            gutterBottom
            sx={{
              cursor: "pointer",
              color: "primary.main",
              textDecoration: "underline",
              transition: "color 0.2s ease",
              "&:hover": { color: "primary.dark" },
            }}
            onClick={() => handleNavigate(product.part_id)}
          >
            {product.name}
          </Typography>
          <TechnicalDetailsTable product={product} />
        </Box>
      ))}
      
</Grid>
    </Box>
  );
};

export default SimilarProducts;
