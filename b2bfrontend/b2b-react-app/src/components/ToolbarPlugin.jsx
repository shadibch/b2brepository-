import React, { useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode, $createHeadingNode } from "@lexical/rich-text";

const fonts = [
  { name: "Default", value: "inherit" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Courier New", value: "Courier New, monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Tahoma", value: "Tahoma, sans-serif" }
];

const colors = [
  "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FF00FF", "#00FFFF", "#FFFF00", "#808080"
];

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const applyFormat = (type) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  };

  const applyHeader = (level) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const heading = $createHeadingNode(`h${level}`);
        heading.append($createTextNode(selection.getTextContent()));
        selection.insertNodes([heading]);
      }
    });
  };

  const applyFont = (font) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          node.setStyle(`font-family: ${font}`);
        });
      }
    });
  };

  const applyColor = (color) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          node.setStyle(`color: ${color}`);
        });
      }
    });
    setShowColorPicker(false);
  };

  const applyList = (type) => {
    editor.dispatchCommand(type === "bullet" ? "insertUnorderedList" : "insertOrderedList", undefined);
  };

  return (
    <div className="rich-text-toolbar">
      <div className="toolbar-group">
        <select onChange={(e) => applyFont(e.target.value)} className="toolbar-select font-select">
          {fonts.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-group">
        <select onChange={(e) => applyHeader(e.target.value)} className="toolbar-select">
          <option value="">Normal</option>
          <option value="1">Header 1</option>
          <option value="2">Header 2</option>
          <option value="3">Header 3</option>
          <option value="4">Header 4</option>
        </select>
      </div>

      <div className="toolbar-group">
        <button type="button" onClick={() => applyFormat("bold")} className="toolbar-button"><strong>B</strong></button>
        <button type="button" onClick={() => applyFormat("italic")} className="toolbar-button"><em>I</em></button>
        <button type="button" onClick={() => applyFormat("underline")} className="toolbar-button"><u>U</u></button>
      </div>

      <div className="toolbar-group">
        <button type="button" onClick={() => applyList("bullet")} className="toolbar-button">• List</button>
        <button type="button" onClick={() => applyList("number")} className="toolbar-button">1. List</button>
      </div>

      <div className="toolbar-group color-picker-container">
        <button type="button" className="toolbar-button" onClick={() => setShowColorPicker(!showColorPicker)}>
          Color
        </button>
        {showColorPicker && (
          <div className="color-picker">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className="color-option"
                style={{ backgroundColor: color }}
                onClick={() => applyColor(color)}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};