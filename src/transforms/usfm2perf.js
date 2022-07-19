const usfm2perf = function ({usfm, proskomma}) {
    proskomma.importDocuments({org: "foo", lang: "fra", abbr: "lsg"}, 'usfm', [usfm]);
    const perfResultDocument = proskomma.gqlQuerySync('{documents {id docSetId perf} }').data.documents[0];
    const docId = perfResultDocument.id;
    const docSetId = perfResultDocument.docSetId;
    proskomma.gqlQuerySync(`mutation { deleteDocument(docSetId: "${docSetId}", documentId: "${docId}") }`);
    const perf = JSON.parse(perfResultDocument.perf);
    return {perf};
}

export default usfm2perf;
