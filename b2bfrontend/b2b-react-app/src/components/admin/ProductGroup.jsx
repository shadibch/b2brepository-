import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { Form, Button, Card, Tabs, Tab, Alert, Pagination } from "react-bootstrap";
import { t, switchLanguage, isRTL, getCurrentLanguage, formatNumber, formatDate, formatLocal } from '../../utils/translator';
import './ProductGroup.css';
import './shared.css';

const TranslationFields = ({ translations, setTranslations }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {["en", "ar"].map((lang) => (
                <div key={lang} className="form-group">
                    <Form.Label className="form-label">{t('Name')} ({lang.toUpperCase()})</Form.Label>
                    <Form.Control
                        placeholder={`${t('Name')} (${lang})`}
                        value={translations.find(t => t.language === lang)?.name || ""}
                        onChange={(e) => {
                            const newTranslations = [...translations];
                            const index = newTranslations.findIndex(t => t.language === lang);
                            if (index >= 0) {
                                newTranslations[index].name = e.target.value;
                            } else {
                                newTranslations.push({ language: lang, name: e.target.value });
                            }
                            setTranslations(newTranslations);
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

const SubGroupForm = ({ subgroups, setSubgroups }) => {
    const updateSubgroup = (index, field, value) => {
        const updated = [...subgroups];
        if (field === "translations") {
            updated[index].translations = value;
        } else {
            updated[index][field] = value;
        }
        console.log("Updated subgroup:", updated[index]);
        setSubgroups(updated);
    };

    const addSubgroup = () => {
        setSubgroups((prev) => [
            ...prev,
            {
                name: "",
                translations: [
                    { language: "en", name: "" },
                    { language: "ar", name: "" }
                ]
            },
        ]);
    };

    const removeSubgroup = (index) => {
        const updated = [...subgroups];
        updated.splice(index, 1);
        setSubgroups(updated);
    };

    return (
        <div>
            {subgroups.map((subgroup, index) => (
                <Card key={index} className="mb-3 p-3">
                    <Form.Group>
                        <Form.Label className="subgroup-label">{t('Base Name')}</Form.Label>
                        <Form.Control
                            value={subgroup.name || ""}
                            onChange={(e) => updateSubgroup(index, "name", e.target.value)}
                            placeholder={t('Enter base name')}
                        />
                    </Form.Group>
                    <Form.Label className="translation-label mt-3">{t('Translations')}</Form.Label>
                    <TranslationFields
                        translations={subgroup.translations}
                        setTranslations={(newTranslations) => {
                            console.log("Setting translations:", newTranslations);
                            updateSubgroup(index, "translations", newTranslations);
                        }}
                    />
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeSubgroup(index)}
                        className="mt-2"
                    >
                        {t('Remove Subgroup')}
                    </Button>
                </Card>
            ))}
            <Button onClick={addSubgroup}>{t('Add Subgroup')}</Button>
        </div>
    );
};

const GroupForm = ({ onSaved, selectedGroup, setSelectedGroup }) => {
    const [name, setName] = useState("");
    const [translations, setTranslations] = useState([
        { language: "en", name: "" },
        { language: "ar", name: "" }
    ]);
    const [subgroups, setSubgroups] = useState([]);
    const [showAlert, setShowAlert] = useState(false);

    const clearForm = () => {
        setName("");
        setTranslations([
            { language: "en", name: "" },
            { language: "ar", name: "" }
        ]);
        setSubgroups([]);
        setSelectedGroup(null);
    };

    useEffect(() => {
        if (selectedGroup) {
            setName(selectedGroup.base_name);
            setTranslations(selectedGroup.translations || [
                { language: "en", name: "" },
                { language: "ar", name: "" }
            ]);

            const sgs = selectedGroup.subgroups.map((sg) => ({
                name: sg.base_name,
                translations: sg.translations || [
                    { language: "en", name: "" },
                    { language: "ar", name: "" }
                ]
            }));
            setSubgroups(sgs);
        } else {
            clearForm();
        }
    }, [selectedGroup]);

    const handleSubmit = async () => {
        const payload = {
            name,
            translations,
            subgroups: subgroups.map((sg) => ({
                name: sg.name,
                translations: sg.translations
            })),
        };

        try {
            if (selectedGroup?.id) {
                await axiosInstance.put(`/api/admin/product-groups/${selectedGroup.id}/`, payload);
            } else {
                await axiosInstance.post("/api/admin/product-groups/", payload);
            }
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            onSaved();
            clearForm();
        } catch (error) {
            console.error("Error submitting form:", error);
            console.log("Payload that caused error:", payload);
        }
    };

    return (
        <Card className="p-4 space-y-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="form-title mb-0">{t('Group Form')}</h2>
                <Button 
                    variant="outline-primary" 
                    onClick={() => {
                        clearForm();
                        onSaved(); // Refresh the list
                    }}
                >
                    {t('New Group')}
                </Button>
            </div>
            {showAlert && (
                <Alert variant="info" onClose={() => setShowAlert(false)} dismissible>
                    {selectedGroup ? t('Group updated successfully') : t('Group created successfully')}
                </Alert>
            )}
            <Form.Label className="group-label">{t('Group Base Name')}</Form.Label>
            <Form.Control placeholder={t('Group name')} value={name} onChange={(e) => setName(e.target.value)} />
            <Form.Label className="group-label mt-4">{t('Group Translations')}</Form.Label>
            <TranslationFields translations={translations} setTranslations={setTranslations} />
            <Form.Label className="group-label mt-4">{t('Subgroups')}</Form.Label>
            <SubGroupForm subgroups={subgroups} setSubgroups={setSubgroups} />
            <Button onClick={handleSubmit} className="mt-4 w-100">
                {selectedGroup ? t('Update') : t('Create')} {t('Group')}
            </Button>
        </Card>
    );
};

const GroupTable = ({ groups, onEdit }) => {
    const [expanded, setExpanded] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedGroups = groups.slice(startIndex, endIndex);
    const totalPages = Math.ceil(groups.length / itemsPerPage);

    return (
        <>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th style={{ width: "50px" }}></th>
                        <th>{t('group')}</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedGroups.map((group) => (
                        <React.Fragment key={group.id}>
                            <tr onClick={() => onEdit(group)}>
                                <td>
                                    <button 
                                        className="expand-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpanded(expanded === group.id ? null : group.id);
                                        }}
                                    >
                                        {expanded === group.id ? "−" : "+"}
                                    </button>
                                </td>
                                <td>{group.name}</td>
                            </tr>
                            {expanded === group.id && (
                                <tr>
                                    <td colSpan="2">
                                        <div className="nested-table-container">
                                            <table className="nested-table">
                                                <thead>
                                                    <tr>
                                                        <th>{t('subgroup')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.subgroups.map((sg) => (
                                                        <tr key={sg.id}>
                                                            <td>{sg.name}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            {totalPages > 1 && (
                <div className="admin-pagination">
                    <Pagination>
                        <Pagination.First
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage === 1}
                        />
                        {[...Array(totalPages)].map((_, idx) => (
                            <Pagination.Item
                                key={idx + 1}
                                active={idx + 1 === currentPage}
                                onClick={() => setCurrentPage(idx + 1)}
                            >
                                {idx + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        />
                    </Pagination>
                </div>
            )}
        </>
    );
};

export default function ProductGroupManager() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const fetchGroups = async () => {
        try {
            const res = await axiosInstance.get("/api/admin/product-groups/");
            setGroups(res.data.results);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <div className="admin-container" dir={isRTL() ? "rtl" : "ltr"}>
            <div className="grid grid-cols-2 gap-6">
                <Card className="admin-card">
                    <div className="admin-form">
                        <h2 className="admin-form-title">{t('Group Form')}</h2>
                        <GroupForm 
                            onSaved={fetchGroups} 
                            selectedGroup={selectedGroup} 
                            setSelectedGroup={setSelectedGroup}
                        />
                    </div>
                </Card>
                <Card className="admin-card">
                    <div className="admin-form">
                        <h2 className="admin-form-title">{t('Groups')}</h2>
                        <GroupTable 
                            groups={groups} 
                            onEdit={(g) => setSelectedGroup(g)}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
