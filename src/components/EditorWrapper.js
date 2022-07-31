import React, { useEffect, useRef, useState } from 'react';
import Editor from "@monaco-editor/react";
import { Box, Button, Tooltip } from '@mui/material';

const cleanEditorContent = {
  title: "index",
  value: "",
  inputType: "json"
}

const defaultOptions = { readOnly: true, domReadOnly: true };

function EditorWrapper({ results }) {
  const [editorContent, setEditorContent] = useState(cleanEditorContent);
  const [editorOptions, setEditorOptions] = useState(defaultOptions);

  const editorRef = useRef(null);

  useEffect(() => {
    console.log("updated editor");
    editorRef.current?.focus();
  }, [editorContent?.id]);

  const firstResult = results[0]?.id

  useEffect(() => {
    if (!editorContent.id && firstResult) setEditorContent(results[results.length - 1])
    if (!results.length && editorContent.id) setEditorContent(cleanEditorContent);
  }, [firstResult, editorContent, results])

  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        bgcolor: "#1e1e1e",
      }}
    >
      <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "row" }}>
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {results.map((r, n) => {
            return (
              <Tooltip title={`${r.type} ${r.id}`} key={n}>
                <Button
                  disabled={editorContent.title === r.title}
                  onClick={() => setEditorContent(r)}
                >
                  {r.title}
                </Button>
              </Tooltip>
            );
          })}
        </Box>
        {firstResult && (
          <Box>
            <Tooltip title={`Save display to File`}>
              <Button
                onClick={() => {
                  const a = document.createElement("a");
                  a.download = `${editorContent.title
                    .toLowerCase()
                    .replace(" ", "_")}.${typeof editorContent.value === "string" ? "txt" : "json"
                    }`;
                  const blob = new Blob(
                    [
                      typeof editorContent.value === "string"
                        ? editorContent.value
                        : JSON.stringify(editorContent.value, null, 2),
                    ],
                    { type: "application/json" }
                  );
                  a.href = URL.createObjectURL(blob);
                  a.addEventListener("click", (e) => {
                    setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
                  });
                  a.click();
                }}
              >
                {"R>"}
              </Button>
            </Tooltip>
            <Tooltip title={`Toggle word wrap`}>
              <Button
                onClick={() =>
                  setEditorOptions((options) => ({
                    ...options,
                    wordWrap: !options?.wordWrap,
                  }))
                }
              >
                {"W"}
              </Button>
            </Tooltip>
          </Box>
        )}
      </Box>
      <Editor
        theme="vs-dark"
        path={editorContent.title}
        defaultLanguage={editorContent.inputType}
        width="auto"
        defaultValue={
          typeof editorContent.value === "object"
            ? JSON.stringify(editorContent.value, null, 2)
            : editorContent.value
        }
        options={editorOptions}
        onMount={(editor) => (editorRef.current = editor)}
      />
    </Box>
  );
}

export default EditorWrapper