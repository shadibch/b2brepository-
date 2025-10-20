import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  Divider,
  useMediaQuery,
  Typography ,
  AccordionDetails ,
  useTheme,
  Toolbar,
  Box, } from "@mui/material";
  import MenuIcon from "@mui/icons-material/Menu";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { t ,switchLanguage,isRTL,getCurrentLanguage} from '../utils/translator';
import theme from "../theme/theme";
const GroupSlide = ({ updateProducts,isOpen, toggleSidebar,categoryId }) => {
  const [productGroups, setProductGroups] = useState([]);
  const [selectedSubgroups, setSelectedSubgroups] = useState({});
  const togglelabel = isOpen ?"❮" : "❯";  
  const [open, setOpen] = useState(true);
  const drawerWidth = 240;
  const toggleDrawer = () => setOpen((prev) => !prev);
  const isMobile = useMediaQuery("(max-width:900px)");
  const theme = useTheme();
useEffect(() => {

  console.log(categoryId); // Logs the updated categoryId
  axiosInstance.get(`/api/product_groups/${categoryId}/`)
    .then((response) => setProductGroups(response.data))
    .catch((error) => console.error("Error fetching product groups:", error));
     document.body.classList.toggle("rtl", isRTL());
    
        

}, [getCurrentLanguage(),categoryId]); // ✅ Add categoryId to the dependency array

const clearFilters = () => {
  setSelectedSubgroups({}); // ✅ Clears all selected subgroups

  // ✅ Uncheck all checkboxes by resetting DOM elements
  document.querySelectorAll(".sidebar input[type='checkbox']").forEach(checkbox => {
    checkbox.checked = false;
  });

  // ✅ Trigger an empty filter request to fetch all products
  axiosInstance.post(`/api/filter_products/${categoryId}/`, { subgroup_id_lists: [[]] }) 
    .then((response) => updateProducts(response.data.results)) 
    .catch((error) => console.error("Error clearing filters:", error));
};


  const handleCheckboxChange = (groupId, subgroupId, isChecked) => {
  setSelectedSubgroups((prevState) => {
    const updatedState = { ...prevState };

    if (!updatedState[groupId]) {
      updatedState[groupId] = new Set();
    }

    if (isChecked) {
      updatedState[groupId].add(subgroupId); // ✅ Add when checked
    } else {
      updatedState[groupId].delete(subgroupId); // ✅ Remove when unchecked
    }
	 const subgroup_id_lists = Object.values(updatedState)
  .filter(set => set.size > 0) // ✅ Eliminates empty sets
  .map(set => [...set]); // ✅ Converts sets to arrays

// ✅ If subgroup_id_lists is empty, add an empty list inside
if (subgroup_id_lists.length === 0) {
  subgroup_id_lists.push([]);
}

 document.body.classList.toggle("rtl", isRTL());
	
    axiosInstance.post(`/api/filter_products/${categoryId}/`, { "subgroup_id_lists": subgroup_id_lists })
      .then((response) => updateProducts([...response.data.results])) // 👈 spread to create a new array
      // ✅ Update products in IndexPage
      .catch((error) => console.error("Error filtering products:", error));

    return updatedState;
  });

 
};




  return (

    <Box
    sx={{
      display: "flex",
      direction: isRTL() ? "rtl" : "ltr",
    }}
  >
    {/* Toggle Button */}
    <IconButton
      onClick={toggleDrawer}
      sx={{
        position: "fixed",
        top: 16,
        [isRTL() ? "right" : "left"]: 16,
        zIndex: 1301,
        bgcolor: "background.paper",
        boxShadow: 2,
      }}
    >
      <MenuIcon />
    </IconButton>

    {/* Sidebar Drawer */}
    <Drawer
      anchor={isRTL() ? "right" : "left"}
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      onClose={toggleDrawer}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "background.default",
          color: "text.primary",
          transition: "all 0.3s ease-in-out",
        },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
        }}
      >
        <Box component="span" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
          {t("Group Filters")}
        </Box>
       
      </Toolbar>
      <Divider />

      <List
sx={{
  textAlign: isRTL() ? "right" : "left",
  "& .MuiListItemButton-root": {
    justifyContent: isRTL() ? "flex-end" : "flex-start",
  },
  "& .MuiListItemIcon-root": {
    minWidth: 0,
    mr: isRTL() ? 0 : 2,
    ml: isRTL() ? 2 : 0,
  },
  "& .MuiListItemText-root": {
    textAlign: isRTL() ? "right" : "left",
  },
}}
>
{productGroups.map((group) => (

<Accordion key={group.id} sx={{ mb: 1 ,
    "&.Mui-selected": {
      bgcolor: theme.palette.sidebar?.active || theme.palette.primary.dark,
      color: theme.palette.sidebar?.text || "#fff",
    },}}>


<AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${group.id}-content`}
            id={`panel-${group.id}-header`}
            sx={{
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography sx={{ fontWeight: "bold" }}>{group.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {group.subgroups.map((subgroup) => (
              <FormControlLabel
                key={subgroup.id}
                control={
                  <Checkbox
                    onChange={(e) =>
                      handleCheckboxChange(group.id, subgroup.id, e.target.checked)
                    }
                    checked={
                      selectedSubgroups[group.id]?.has(subgroup.id) || false
                    }
                  />
                }
                label={subgroup.name}
              />
            ))}
          </AccordionDetails>
  </Accordion>
)


)}
</List>

    </Drawer>

    {/* Main content shifts when sidebar opens */}
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        transition: "margin 0.3s ease-in-out",
        marginLeft: !isRTL() && open && !isMobile ? `${drawerWidth}px` : 0,
        marginRight: isRTL() && open && !isMobile ? `${drawerWidth}px` : 0,
        p: 3,
      }}
    >
      {/* Your page content goes here */}
    </Box>
  </Box>

   
  );
};

export default GroupSlide;
