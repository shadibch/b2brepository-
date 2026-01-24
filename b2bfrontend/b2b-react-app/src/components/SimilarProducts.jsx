import React from "react";
import { Box, CardMedia, Grid, Typography,Card } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TechnicalDetailsTable from "./TechnicalDetailsTable";
import { formatNumber, t } from "../utils/translator";
import { isAuthenticated } from "./axiosInstance";

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
     <Box
     key={product.id}
     component={Card}
     sx={{
       mb: 3,
       p: 2,
       borderRadius: 3, // curved corners
       boxShadow: 3, // subtle elevation
       transition: "transform 0.2s ease, box-shadow 0.2s ease",
       "&:hover": {
         transform: "translateY(-3px)",
         boxShadow: 6, // elevate a bit on hover
       },
     }}
   >
   
   
     <CardMedia
       component="img"
       height="100"
       image={product.media_url}
       alt={product.name || "Product"}
       sx={{
         objectFit: "contain",
         borderRadius: 2, // optional: slightly round the image corners
         mb: 1,
       }}
     />
     <Typography
       variant="h6"
       gutterBottom
       sx={{
         cursor: "pointer",
         color: "primary.main",
        
         transition: "color 0.2s ease",
         "&:hover": { color: "primary.dark" },
       }}
       onClick={() => handleNavigate(product.part_id)}
     >
       {product.name}
     </Typography>
     <TechnicalDetailsTable product={product} />
   
    {isAuthenticated() && (
      <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
        {formatNumber(
          product.price > 0 ? product.price : product.base_price,
          product.currency
        )}
      </Typography>
    )}
   </Box>
      ))}
      
</Grid>
    </Box>
  );
};

export default SimilarProducts;
