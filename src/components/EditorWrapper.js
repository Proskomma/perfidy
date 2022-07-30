import React, { useEffect, useRef, useState } from 'react';
import Editor from "@monaco-editor/react";

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
      <>
        {firstResult && (
          <>
            <span className="add-step-button tooltip">
              <span className="tooltiptext ltooltiptext">
                Save display to File
              </span>
              <button
                className="result-button"
                onClick={() => {
                  const a = document.createElement("a");
                  a.download = `${editorContent.title
                    .toLowerCase()
                    .replace(" ", "_")}.${
                    typeof editorContent.value === "string" ? "txt" : "json"
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
              </button>
            </span>
            <span className="add-step-button tooltip">
              <span className="tooltiptext ltooltiptext">Toggle word wrap</span>
              <button
                className="result-button"
                onClick={() =>
                  setEditorOptions((options) => ({
                    ...options,
                    wordWrap: !options?.wordWrap,
                  }))
                }
              >
                {"W"}
              </button>
            </span>
          </>
        )}
        {results.map((r, n) => {
          return (
            <button
              className="editor-tab"
              disabled={editorContent.title === r.title}
              onClick={() => setEditorContent(r)}
              key={n}
            >
              {r.title}
            </button>
          );
        })}
        <Editor
          theme="vs-dark"
          path={editorContent.title}
          defaultLanguage={editorContent.inputType}
          defaultValue={
            typeof editorContent.value === "object"
              ? JSON.stringify(editorContent.value, null, 2)
              : editorContent.value
          }
          options={editorOptions}
          onMount={(editor) => (editorRef.current = editor)}
        />
      </>
    );
}

export default EditorWrapper