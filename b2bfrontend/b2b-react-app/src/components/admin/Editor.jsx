import React, { useEffect, useRef, useState } from "react";
import { t } from "../../utils/translator";

const RichTextEditor = ({ value, onChange, dir = "ltr", placeholder,disabled = false }) => {
  const editorRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fonts = [
    { name: "Default", value: "Somar Sans, Cairo, Noto Sans Arabic, sans-serif" },
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Times New Roman", value: "Times New Roman, serif" },
    { name: "Courier New", value: "Courier New, monospace" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Verdana", value: "Verdana, sans-serif" },
    { name: "Tahoma", value: "Tahoma, sans-serif" },
  ];

  const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF",
    "#FF00FF", "#00FFFF", "#FFFF00", "#808080"
  ];

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleHeader = (level) => {
    handleCommand("formatBlock", `h${level}`);
  };

  return (
    <div className="rich-text-container">
      <div
  className="rich-text-toolbar"
  style={{
    pointerEvents: disabled ? "none" : "auto",
    opacity: disabled ? 0.5 : 1,
  }}
>
        <div className="toolbar-group">
          <select
            onChange={(e) => handleCommand("fontName", e.target.value)}
            className="toolbar-select font-select"
            title={t("Font Family")}
          >
            {fonts.map((font) => (
              <option
                key={font.value}
                value={font.value}
                style={{ fontFamily: font.value || "inherit" }}
              >
                {font.name}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-group">
          <select
            onChange={(e) => handleHeader(e.target.value)}
            className="toolbar-select"
            title={t("Header Style")}
          >
            <option value="">{t("Normal")}</option>
            <option value="1">{t("Header")} 1</option>
            <option value="2">{t("Header")} 2</option>
            <option value="3">{t("Header")} 3</option>
            <option value="4">{t("Header")} 4</option>
          </select>
        </div>

        <div className="toolbar-group">
          <button type="button" onClick={() => handleCommand("bold")}  disabled={disabled} className="toolbar-button" title={t("Bold")}>
            <strong>B</strong>
          </button>
          <button type="button" onClick={() => handleCommand("italic")}  disabled={disabled} className="toolbar-button" title={t("Italic")}>
            <em>I</em>
          </button>
          <button type="button" onClick={() => handleCommand("underline")}  disabled={disabled} className="toolbar-button" title={t("Underline")}>
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button"  disabled={disabled} onClick={() => handleCommand("insertUnorderedList")} className="toolbar-button" title={t("Bullet List")}>
            • List
          </button>
          <button type="button"  disabled={disabled} onClick={() => handleCommand("insertOrderedList")} className="toolbar-button" title={t("Numbered List")}>
            1. List
          </button>
        </div>

        <div className="toolbar-group color-picker-container">
          <button
            type="button"
            disabled={disabled}
            className="toolbar-button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title={t("Text Color")}
          >
            Color
          </button>
          {showColorPicker && !disabled && (
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="color-option"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    handleCommand("foreColor", color);
                    setShowColorPicker(false);
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div
  className="rich-text-editor"
  contentEditable={!disabled}
  ref={editorRef}
  onInput={disabled ? undefined : handleContentChange}
  dir={dir}
  data-placeholder={placeholder}
  style={{ minHeight: "150px", pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.6 : 1 }}
/>
    </div>
  );
};

export default RichTextEditor;