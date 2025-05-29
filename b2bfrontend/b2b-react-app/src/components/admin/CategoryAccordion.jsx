import React, { useState } from "react";
import { Accordion, Form, Button } from "react-bootstrap";
import axios from "axios";

const CategoryAccordion = ({ selectedCategory, updateTree }) => {
  const [translations, setTranslations] = useState([]);
  const [parameters, setParameters] = useState([]);

  const addTranslation = () => {
    if (translations.length >= 2) return;
    setTranslations([...translations, { name: "", lang: "US_en" }]);
  };

  const removeTranslation = (index) => setTranslations(translations.filter((_, i) => i !== index));

  const addParameter = () => setParameters([...parameters, { name: "", translations: [] }]);

  const removeParameter = (index) => setParameters(parameters.filter((_, i) => i !== index));

  const saveCategory = () => {
    axios.post(
      selectedCategory ? `/api/admin/updatecategory/${selectedCategory.id}` : `/api/admin/savecategory/`,
      { name: selectedCategory.name, translations, parameters }
    ).then(() => updateTree());
  };

  return (
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>{selectedCategory?.name || "New Category"}</Accordion.Header>
        <Accordion.Body>
          <Form.Group>
            <Form.Label>Category Name:</Form.Label>
            <Form.Control type="text" value={selectedCategory?.name || ""} />
          </Form.Group>

          <h4>Translations</h4>
          {translations.map((trans, i) => (
            <div key={i}>
              <Form.Control type="text" placeholder="Translation Name" value={trans.name} />
              <Form.Select value={trans.lang} onChange={(e) => {
                const newTranslations = translations.map((t, index) => index === i ? { ...t, lang: e.target.value } : t);
                setTranslations(newTranslations);
              }}>
                <option value="US_en">English</option>
                <option value="SA_ar">Arabic</option>
              </Form.Select>
              <Button variant="danger" onClick={() => removeTranslation(i)}>Delete</Button>
            </div>
          ))}
          <Button onClick={addTranslation} disabled={translations.length >= 2}>Add Translation</Button>

          <h4>Parameters</h4>
          {parameters.map((param, i) => (
            <div key={i}>
              <Form.Control type="text" placeholder="Parameter Name" value={param.name} />
              <Button variant="danger" onClick={() => removeParameter(i)}>Delete</Button>
            </div>
          ))}
          <Button onClick={addParameter}>Add Parameter</Button>

          <Button onClick={saveCategory}>Save</Button>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default CategoryAccordion;
