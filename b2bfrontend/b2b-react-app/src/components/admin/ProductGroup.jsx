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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { t, isRTL } from "../../utils/translator";

// ---------------------- Translation Fields ----------------------
const TranslationFields = ({ translations, setTranslations }) => (
  <Grid container spacing={2}>
    {["en", "ar"].map((lang) => (
      <Grid item xs={6} key={lang}>
        <TextField
          fullWidth
          label={`${t("Name")} (${lang.toUpperCase()})`}
          value={translations.find((tr) => tr.language === lang)?.name || ""}
          onChange={(e) => {
            const newTranslations = [...translations];
            const index = newTranslations.findIndex((tr) => tr.language === lang);
            if (index >= 0) {
              newTranslations[index].name = e.target.value;
            } else {
              newTranslations.push({ language: lang, name: e.target.value });
            }
            setTranslations(newTranslations);
          }}
        />
      </Grid>
    ))}
  </Grid>
);

// ---------------------- SubGroup Form ----------------------
const SubGroupForm = ({ subgroups, setSubgroups }) => {
  const updateSubgroup = (index, field, value) => {
    const updated = [...subgroups];
    if (field === "translations") {
      updated[index].translations = value;
    } else {
      updated[index][field] = value;
    }
    setSubgroups(updated);
  };

  const addSubgroup = () => {
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
          />
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
        </Paper>
      ))}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={addSubgroup}
        sx={{ mt: 1 }}
      >
        {t("Add Subgroup")}
      </Button>
    </Box>
  );
};

// ---------------------- Group Form ----------------------
const GroupForm = ({ onSaved, selectedGroup, setSelectedGroup }) => {
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
          translations: sg.translations || [
            { language: "en", name: "" },
            { language: "ar", name: "" },
          ],
        }))
      );
    } else clearForm();
  }, [selectedGroup]);

  const handleSubmit = async () => {
    const payload = { name, translations, subgroups };
    try {
      if (selectedGroup?.id)
        await axiosInstance.put(
          `/api/admin/product-groups/${selectedGroup.id}/`,
          payload
        );
      else await axiosInstance.post("/api/admin/product-groups/", payload);

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
          <Button variant="outlined" onClick={() => { clearForm(); onSaved(); }}>
            {t("New Group")}
          </Button>
        </Box>

        <TextField
          fullWidth
          label={t("Group Base Name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t("Group Translations")}
        </Typography>
        <TranslationFields translations={translations} setTranslations={setTranslations} />

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          {t("Subgroups")}
        </Typography>
        <SubGroupForm subgroups={subgroups} setSubgroups={setSubgroups} />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={handleSubmit}
        >
          {selectedGroup ? t("Update") : t("Create")} {t("Group")}
        </Button>

        <Snackbar open={!!alert} autoHideDuration={3000} onClose={() => setAlert(null)}>
          {alert && <Alert severity={alert.type}>{alert.text}</Alert>}
        </Snackbar>
      </CardContent>
    </Card>
  );
};

// ---------------------- Group Table ----------------------
const GroupTable = ({ groups, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(groups.length / perPage);

  const displayed = groups.slice((page - 1) * perPage, page * perPage);

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
  <Typography
    sx={{
      flexGrow: 1,
      cursor: "pointer",
    }}
    onClick={(e) => {
      e.stopPropagation();
      onEdit(group);
    }}
  >
    {group.name}
  </Typography>
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
    </Card>
  );
};

// ---------------------- Main Page ----------------------
export default function ProductGroupManager() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/product-groups/");
      setGroups(res.data.results || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
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
      <Grid item xs={12}>
        <GroupForm
          onSaved={fetchGroups}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />
      </Grid>

      <Grid item xs={12}>
        <GroupTable groups={groups} onEdit={setSelectedGroup} />
      </Grid>
    </Box>
  );
}
