import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { t, isRTL } from "../../utils/translator";

// ---------------------- Translation Fields ----------------------
const TranslationFields = ({ translations, setTranslations, isEditMode = true }) => (
  <Grid container spacing={2}>
    {["en", "ar"].map((lang) => (
      <Grid item xs={6} key={lang}>
        <TextField
          fullWidth
          label={`${t("Name")} (${lang.toUpperCase()})`}
          value={translations.find((tr) => tr.language === lang)?.name || ""}
          onChange={(e) => {
            if (!isEditMode) return;
            const newTranslations = [...translations];
            const index = newTranslations.findIndex((tr) => tr.language === lang);
            if (index >= 0) {
              newTranslations[index].name = e.target.value;
            } else {
              newTranslations.push({ language: lang, name: e.target.value });
            }
            setTranslations(newTranslations);
          }}
          disabled={!isEditMode}
        />
      </Grid>
    ))}
  </Grid>
);

// ---------------------- SubGroup Form ----------------------
const SubGroupForm = ({ subgroups, setSubgroups, isEditMode = true }) => {
  const updateSubgroup = (index, field, value) => {
    if (!isEditMode) return;
    const updated = [...subgroups];
    if (field === "translations") {
      updated[index].translations = value;
    } else {
      updated[index][field] = value;
    }
    setSubgroups(updated);
  };

  const addSubgroup = () => {
    if (!isEditMode) return;
    setSubgroups((prev) => [
      ...prev,
      {
        name: "",
        translations: [
          { language: "en", name: "" },
          { language: "ar", name: "" },
        ],
      },
    ]);
  };

  const removeSubgroup = (index) => {
    if (!isEditMode) return;
    const updated = [...subgroups];
    updated.splice(index, 1);
    setSubgroups(updated);
  };

  return (
    <Box>
      {subgroups.map((sg, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            label={t("Base Name")}
            value={sg.name || ""}
            onChange={(e) => updateSubgroup(index, "name", e.target.value)}
            disabled={!isEditMode}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t("Translations")}
          </Typography>
          <TranslationFields
            translations={sg.translations}
            setTranslations={(newTranslations) =>
              updateSubgroup(index, "translations", newTranslations)
            }
            isEditMode={isEditMode}
          />
          {isEditMode && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => removeSubgroup(index)}
              sx={{ mt: 2 }}
            >
              {t("Remove Subgroup")}
            </Button>
          )}
        </Paper>
      ))}
      {isEditMode && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addSubgroup}
          sx={{ mt: 1 }}
        >
          {t("Add Subgroup")}
        </Button>
      )}
    </Box>
  );
};

// ---------------------- Group Form ----------------------
const GroupForm = ({ onSaved, selectedGroup, setSelectedGroup, isEditMode = true, onEdit }) => {
  const [name, setName] = useState("");
  const [translations, setTranslations] = useState([
    { language: "en", name: "" },
    { language: "ar", name: "" },
  ]);
  const [subgroups, setSubgroups] = useState([]);
  const [alert, setAlert] = useState(null);

  const clearForm = () => {
    setName("");
    setTranslations([
      { language: "en", name: "" },
      { language: "ar", name: "" },
    ]);
    setSubgroups([]);
    setSelectedGroup(null);
  };

  useEffect(() => {
    if (selectedGroup) {
      setName(selectedGroup.base_name || "");
      setTranslations(
        selectedGroup.translations || [
          { language: "en", name: "" },
          { language: "ar", name: "" },
        ]
      );
      setSubgroups(
        (selectedGroup.subgroups || []).map((sg) => ({
          
          name: sg.base_name,
          id:sg.id,
          translations: sg.translations || [
            { language: "en", name: "" },
            { language: "ar", name: "" },
          ],
        }))
      );
    } else clearForm();
  }, [selectedGroup]);

  const handleSubmit = async () => {
    if (!isEditMode) return;
    
    const payload = { name, translations, subgroups };
   
    try {
      if (selectedGroup?.id)
        await axiosInstance.put(
          `/api/admin/product-groups/${selectedGroup.id}/`,
          payload
        );
      else 
      
      await axiosInstance.post("/api/admin/product-groups/", payload);

      setAlert({
        type: "success",
        text: selectedGroup
          ? t("Group updated successfully")
          : t("Group created successfully"),
      });
      onSaved();
      clearForm();
    } catch (err) {
      setAlert({ type: "error", text: t("Error saving group") });
      console.error(err);
    }
  };

  return (
    <Card variant="outlined" sx={{ backgroundColor: "background.paper", boxShadow: 1 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{t("Group Form")}</Typography>
          <Box>
            {!isEditMode && selectedGroup && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={onEdit}
                sx={{ mr: 1 }}
              >
                {t("Edit")}
              </Button>
            )}
            {isEditMode && (
              <Button variant="outlined" onClick={() => { clearForm(); onSaved(); }}>
                {t("New Group")}
              </Button>
            )}
          </Box>
        </Box>

        <TextField
          fullWidth
          label={t("Group Base Name")}
          value={name}
          onChange={(e) => isEditMode && setName(e.target.value)}
          disabled={!isEditMode}
          sx={{ mb: 3 }}
        />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t("Group Translations")}
        </Typography>
        <TranslationFields translations={translations} setTranslations={setTranslations} isEditMode={isEditMode} />

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          {t("Subgroups")}
        </Typography>
        <SubGroupForm subgroups={subgroups} setSubgroups={setSubgroups} isEditMode={isEditMode} />

        {isEditMode && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            {selectedGroup ? t("Update") : t("Create")} {t("Group")}
          </Button>
        )}

        <Snackbar open={!!alert} autoHideDuration={3000} onClose={() => setAlert(null)}>
          {alert && <Alert severity={alert.type}>{alert.text}</Alert>}
        </Snackbar>
      </CardContent>
    </Card>
  );
};

// ---------------------- Group Table ----------------------
const GroupTable = ({ groups, onEdit, onDelete, isEditMode = true }) => {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const perPage = 10;
  const totalPages = Math.ceil(groups.length / perPage);

  const displayed = groups.slice((page - 1) * perPage, page * perPage);

  const handleDeleteClick = (group, e) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setGroupToDelete(group);
    setShowDeleteDialog(true);
  };

  const handleEditClick = (group, e) => {
    if (!isEditMode) return;
    e.stopPropagation();
    onEdit(group);
  };

  const handleConfirmDelete = async () => {
    if (groupToDelete && onDelete) {
      await onDelete(groupToDelete.id);
      setShowDeleteDialog(false);
      setGroupToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setGroupToDelete(null);
  };

  return (
    <Card variant="outlined" sx={{ backgroundColor: "background.paper", boxShadow: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t("Groups")}
        </Typography>
        {displayed.map((group) => (
          <Accordion
            key={group.id}
            expanded={expanded === group.id}
            onChange={() => setExpanded(expanded === group.id ? false : group.id)}
          >
   <AccordionSummary
  expandIcon={<ExpandMoreIcon />}
  sx={{
    textAlign: isRTL() ? "right" : "left",
    backgroundColor: "primary.main",
    color: "primary.contrastText",
    "& .MuiTypography-root": {
      textAlign: isRTL() ? "right" : "left",
      width: "100%",
    },
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
    <Typography
      sx={{
        flexGrow: 1,
        cursor: isEditMode ? "pointer" : "default",
      }}
      onClick={(e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        onEdit(group);
      }}
    >
      {group.name}
    </Typography>
    {isEditMode && (
      <IconButton
        size="small"
        onClick={(e) => handleDeleteClick(group, e)}
        sx={{
          color: "primary.contrastText",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    )}
  </Box>
</AccordionSummary>

<AccordionDetails>
  <Table size="small">
    <TableHead>
      <TableRow
        sx={{
          backgroundColor: "primary.main",
        }}
      >
        <TableCell
          align="center"
          sx={{
            color: "primary.contrastText",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          {t("Subgroup")}
        </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {(group.subgroups || []).map((sg, index) => {
        // ✅ Get subgroup display name (translated)
        const subgroupName =
          sg.translations?.find((tr) => tr.language === (isRTL() ? "ar" : "en"))?.name ||
          sg.base_name ||
          sg.name ||
          t("Unnamed Subgroup");

        return (
          <TableRow
            key={sg.id || index}
            sx={{
              backgroundColor:
                index % 2 === 0
                  ? "action.hover" // even rows - lighter shade
                  : "background.paper", // odd rows - default
              "&:hover": {
                backgroundColor: "action.selected", // highlight on hover
              },
            }}
          >
            <TableCell
              align="center"
              sx={{
                textAlign: isRTL() ? "right" : "left",
                direction: isRTL() ? "rtl" : "ltr",
              }}
            >
              {subgroupName}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
</AccordionDetails>

          </Accordion>
        ))}
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} />
        </Box>
      </CardContent>

      <Dialog open={showDeleteDialog} onClose={handleCancelDelete}>
        <DialogTitle>{t("Confirm Delete")}</DialogTitle>
        <DialogContent>
          {t("Are you sure you want to delete this group?")}
          {groupToDelete && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
              {groupToDelete.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>{t("Cancel")}</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            {t("Delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

// ---------------------- Main Page ----------------------
export default function ProductGroupManager() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [alert, setAlert] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/product-groups/");
      setGroups(res.data.results || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setAlert({ type: "error", text: t("Error fetching groups") });
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await axiosInstance.delete(`/api/admin/group/${groupId}/`);
      setAlert({
        type: "success",
        text: t("Group deleted successfully"),
      });
      // Clear selected group if it was deleted
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
      fetchGroups();
    } catch (err) {
      setAlert({
        type: "error",
        text: err.response?.data?.error || t("Error deleting group"),
      });
      console.error("Error deleting group:", err);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    // When selecting a group, switch to edit mode
    setIsEditMode(true);
  };

  const handleNewGroup = () => {
    // Clear selected group and enable edit mode for new group
    setSelectedGroup(null);
    setIsEditMode(true);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <Box
      p={3}
      dir={isRTL() ? "rtl" : "ltr"}
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {t("Product Groups")}
        </Typography>
        {!isEditMode && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            {t("Edit")}
          </Button>
        )}
      </Box>

      <Grid item xs={12}>
        <GroupForm
          onSaved={fetchGroups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          isEditMode={isEditMode}
          onEdit={handleEdit}
        />
      </Grid>

      <Grid item xs={12}>
        <GroupTable 
          groups={groups} 
          onEdit={handleSelectGroup} 
          onDelete={handleDeleteGroup}
          isEditMode={isEditMode}
        />
      </Grid>

      <Snackbar open={!!alert} autoHideDuration={3000} onClose={() => setAlert(null)}>
        {alert && <Alert severity={alert.type}>{alert.text}</Alert>}
      </Snackbar>
    </Box>
  );
}
