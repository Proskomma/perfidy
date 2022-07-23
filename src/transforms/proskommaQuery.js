const proskommaQueryCode = function ({usfm, selectors, query, proskomma}) {
    proskomma.importDocuments(selectors, 'usfm', [usfm]);
    const perfResultDocument = proskomma.gqlQuerySync('{documents {id docSetId} }');
    const docId = perfResultDocument.data.documents[0].id;
    const docSetId = perfResultDocument.data.documents[0].docSetId;
    let ret;
    try {
        const result = proskomma.gqlQuerySync(query);
        ret = {
            data: result.data || {},
            errors: result.errors || {}
        };
    } catch (err) {
        ret = {data: {}, errors: {sys: `Exception: ${err}`}};
    }
    proskomma.gqlQuerySync(`mutation { deleteDocument(docSetId: "${docSetId}", documentId: "${docId}") }`);
    return ret;
}

const proskommaQuery = {
    name: "proskommaQuery",
    type: "Transform",
    description: "USFM=>JSON: Loads a USFM file into Proskomma, runs a query, and exports the GraphQL data and error objects",
    inputs: [
        {
            name: "usfm",
            type: "text",
            source: ""
        },
        {
            name: "selectors",
            type: "json",
            source: ""
        },
        {
            name: "query",
            type: "text",
            source: ""
        }
    ],
    outputs: [
        {
            name: "data",
            type: "json",
        },
        {
            name: "errors",
            type: "json",
        }
    ],
    code: proskommaQueryCode
}

export default proskommaQuery;
