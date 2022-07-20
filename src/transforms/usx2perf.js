const usx2perf = function ({usx, selectors, proskomma}) {
    proskomma.importDocuments(selectors, 'usx', [usx]);
    const perfResultDocument = proskomma.gqlQuerySync('{documents {id docSetId perf} }').data.documents[0];
    const docId = perfResultDocument.id;
    const docSetId = perfResultDocument.docSetId;
    proskomma.gqlQuerySync(`mutation { deleteDocument(docSetId: "${docSetId}", documentId: "${docId}") }`);
    const perf = JSON.parse(perfResultDocument.perf);
    return {perf};
}
export default usx2perf;
