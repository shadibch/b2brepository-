import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

const TechnicalDetailsTable = ({ product }) => {
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
        mt: 2,
      }}
    >
      <Table size="small">
        <TableBody>
          {product.subgroups.map((subgroup, index) => (
            <TableRow
              key={index}
              sx={{
                bgcolor:
                  index % 2 === 0
                    ? theme.palette.action.hover
                    : theme.palette.background.paper,
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 600,
                  width: "40%",
                  borderRight: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.action.selected,
                  fontSize: "0.875rem",
                  py: 1,
                  px: 2,
                }}
              >
                {subgroup.group}
              </TableCell>
              <TableCell
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.875rem",
                  py: 1,
                  px: 2,
                }}
              >
                {subgroup.name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TechnicalDetailsTable;
