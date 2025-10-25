import React, { useState } from "react";

// --- Lexical React Plugins ---
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';

import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';

// --- Core Lexical Commands and Utilities ---
import { INSERT_ORDERED_LIST_COMMAND ,INSERT_UNORDERED_LIST_COMMAND} from '@lexical/list';
import {
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,     // ✅ Correct path (was moved here)
  $getSelection,
  $isRangeSelection,
} from "lexical";

// --- Rich Text (headings, block types) ---
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode
} from "@lexical/rich-text";
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';

// --- List Support ---
import { ListNode, ListItemNode } from "@lexical/list";

// --- Links ---
import { LinkNode } from "@lexical/link";

// --- Block manipulation ---
import { $setBlocksType } from "@lexical/selection";

// --- Material UI (MUI v5/v6) ---
import {
  Box,
  Select,
  MenuItem,
  IconButton,
  Popover,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";


// ---------------------- Toolbar Plugin ---------------------- //
const ToolbarPlugin = ({ onColorSelect }) => {
  const [editor] = useLexicalComposerContext();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleFormat = (format) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  const handleHeader = (level) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (level) {
          $setBlocksType(selection, () => $createHeadingNode(`h${level}`));
        } else {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      }
    });
  };

  const handleList = (ordered) => {
    editor.dispatchCommand(
      ordered ? INSERT_ORDERED_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
      undefined
    );
  };

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FF00FF",
    "#00FFFF",
    "#FFFF00",
    "#808080",
  ];

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
      {/* Font Header Select */}
      <Select
        defaultValue=""
        size="small"
        onChange={(e) => handleHeader(e.target.value)}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">Normal</MenuItem>
        <MenuItem value="1">Header 1</MenuItem>
        <MenuItem value="2">Header 2</MenuItem>
        <MenuItem value="3">Header 3</MenuItem>
        <MenuItem value="4">Header 4</MenuItem>
      </Select>

      {/* Font Family Select */}
      <Select
        defaultValue=""
        size="small"
        onChange={(e) => {
          const font = e.target.value;
          editor.update(() => {
            document.execCommand("fontName", false, font);
          });
        }}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Default</MenuItem>
        <MenuItem value="Arial, sans-serif">Arial</MenuItem>
        <MenuItem value="Times New Roman, serif">Times New Roman</MenuItem>
        <MenuItem value="Courier New, monospace">Courier New</MenuItem>
        <MenuItem value="Georgia, serif">Georgia</MenuItem>
        <MenuItem value="Verdana, sans-serif">Verdana</MenuItem>
        <MenuItem value="Tahoma, sans-serif">Tahoma</MenuItem>
      </Select>

      {/* Basic Formatting */}
      <IconButton onClick={() => handleFormat("bold")} size="small">
        <FormatBoldIcon />
      </IconButton>
      <IconButton onClick={() => handleFormat("italic")} size="small">
        <FormatItalicIcon />
      </IconButton>
      <IconButton onClick={() => handleFormat("underline")} size="small">
        <FormatUnderlinedIcon />
      </IconButton>

      {/* Lists */}
      <IconButton onClick={() => handleList(false)} size="small">
        <FormatListBulletedIcon />
      </IconButton>
      <IconButton onClick={() => handleList(true)} size="small">
        <FormatListNumberedIcon />
      </IconButton>

      {/* Color Picker */}
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
        <FormatColorTextIcon />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ display: "flex", p: 1, gap: 1 }}>
          {colors.map((color) => (
            <Button
              key={color}
              onClick={() => {
                onColorSelect(color);
                setAnchorEl(null);
              }}
              sx={{
                backgroundColor: color,
                minWidth: 24,
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "1px solid #ccc",
                "&:hover": { opacity: 0.7 },
              }}
            />
          ))}
        </Box>
      </Popover>
    </Stack>
  );
};

// ---------------------- Color Plugin ---------------------- //
const ColorPlugin = ({ color }) => {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    if (color) {
      editor.update(() => {
        document.execCommand("foreColor", false, color);
      });
    }
  }, [color, editor]);
  return null;
};

// ---------------------- Main Editor ---------------------- //
const RichTextEditor = ({ value, onChange, dir = "ltr", placeholder = "Start typing..." }) => {
  const [selectedColor, setSelectedColor] = useState(null);

  const editorConfig = {
    namespace: "MUIRichTextEditor",
    theme: {
      paragraph: "editor-paragraph",
    },
    onError: (error) => console.error(error),
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
  };

  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
      <LexicalComposer initialConfig={editorConfig}>
        <ToolbarPlugin onColorSelect={setSelectedColor} />
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 1,
            minHeight: 150,
            cursor: "text",
          }}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="lexical-content"
                style={{
                  outline: "none",
                  minHeight: "150px",
                  fontFamily: "inherit",
                }}
                dir={dir}
              />
            }
            placeholder={<Typography color="text.secondary">{placeholder}</Typography>}
          />
        </Box>
        <HistoryPlugin />
        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              const json = editorState.toJSON();
              onChange(json);
            });
          }}
        />
        <ColorPlugin color={selectedColor} />
      </LexicalComposer>
    </Box>
  );
};

export default RichTextEditor;
