// import xre from 'xregexp';

const searchRegexGenCode = function ({searchString}) {
    // regex4terms = xre.replace(searchTerms, /&/, "+");
    return {
        searchData: {
            termsArray: [searchString],
            allTerms: false
        }
    };
}

const searchRegexGen = {
    name: "searchRegexGen",
    type: "Transform",
    description: "TEXT=>TEXT: Generate a regex from a user's search terms",
    inputs: [
        {
            name: "searchString",
            type: "text",
            source: ""
        },
    ],
    outputs: [
        {
            name: "searchData",
            type: "json",
        },
    ],
    code: searchRegexGenCode
}

export default searchRegexGen;
