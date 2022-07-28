import React, { useEffect, useRef, useState } from 'react';
import Editor from "@monaco-editor/react";

const cleanEditorContent = {
    title: "index",
    value: "",
    inputType: "json"
}

function EditorWrapper({ results }) {
    const [editorContent, setEditorContent] = useState(cleanEditorContent);
    const editorRef = useRef(null);

    useEffect(() => {
        console.log("updated editor");
        editorRef.current?.focus();
    }, [editorContent?.id]);

    const firstResult = results[0]?.id

    useEffect(() => {
        if (!editorContent.id && firstResult) setEditorContent(results[0])
        if (!results.length && editorContent.id) setEditorContent(cleanEditorContent);
    }, [firstResult, editorContent, results])

    return (
      <>
        <button
          className="result-button"
          onClick={() => {
            const a = document.createElement("a");
            a.download = `myResult.${
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
        {results.map((r, n) => {
          return (
            <button
              disabled={editorContent.title === r.title}
              onClick={() => setEditorContent(r)}
              key={n}
            >
              {r.title}
            </button>
          );
        })}
        <Editor
          height="80vh"
          theme="vs-dark"
          path={editorContent.title}
          defaultLanguage={editorContent.inputType}
          defaultValue={
            typeof editorContent.value === "object"
              ? JSON.stringify(editorContent.value, null, 2)
              : editorContent.value
          }
          options={{ readOnly: true, domReadOnly: true }}
          onMount={(editor) => (editorRef.current = editor)}
        />
      </>
    );
}

export default EditorWrapper