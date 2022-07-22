const usx2perfCode = function ({usx, selectors, proskomma}) {
    proskomma.importDocuments(selectors, 'usx', [usx]);
    const perfResultDocument = proskomma.gqlQuerySync('{documents {id docSetId perf} }').data.documents[0];
    const docId = perfResultDocument.id;
    const docSetId = perfResultDocument.docSetId;
    proskomma.gqlQuerySync(`mutation { deleteDocument(docSetId: "${docSetId}", documentId: "${docId}") }`);
    const perf = JSON.parse(perfResultDocument.perf);
    return {perf};
}

const usx2perf = {
    name: "usx2perf",
    type: "Transform",
    description: "Loads a USX file into Proskomma and exports it as PERF",
    inputs: [
        {
            name: "usx",
            type: "text",
            source: ""
        },
        {
            name: "selectors",
            type: "json",
            source: ""
        }
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        }
    ],
    code: usx2perfCode
}
export default usx2perf;
