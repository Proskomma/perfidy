import React, { useEffect, useRef, useState } from 'react';
import Editor from "@monaco-editor/react";

function EditorWrapper({ results }) {
    const [editorContent, setEditorContent] = useState({});
    const editorRef = useRef(null);

    useEffect(() => {
        editorRef.current?.focus();
    }, [editorContent?.id]);

    const firstResult = results[0]?.id

    useEffect(() => {
        if (!editorContent.id && firstResult) setEditorContent(results[0])
        if (!results.length && editorContent.id) setEditorContent({});
    }, [firstResult, editorContent, results])

    console.log(results);

    return (
        <>
            {
                results.map(
                    (r, n) => {
                        return (
                            <button
                                disabled={editorContent.title === r.title}
                                onClick={() => setEditorContent(r)}
                                key={n}
                            >
                                {r.title}
                            </button>
                        )
                    }
                )
            }
            <Editor
                height="80vh"
                theme="vs-dark"
                path={editorContent.title || ""}
                defaultLanguage={editorContent.inputType || "json"}
                defaultValue={typeof editorContent.value === "object" ? JSON.stringify(editorContent.value, null, 2) : editorContent.value || ""}
                onMount={(editor) => (editorRef.current = editor)}
            />
        </>
    )
}

export default EditorWrapper