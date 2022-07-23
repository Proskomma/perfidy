import {diffChars, diffWords, diffWordsWithSpace, diffLines, diffTrimmedLines, diffSentences} from 'diff';

const diffTypes = {
    chars: diffChars,
    words: diffWords,
    wordsWithSpace: diffWordsWithSpace,
    lines: diffLines,
    trimmedLines: diffTrimmedLines,
    sentences: diffSentences
}

const diffTextCode = function ({text1, text2, diffType}) {
    if (!Object.keys(diffTypes).includes(diffType)) {
        const errMsg = `ERROR: diffText type must be one of ${Object.keys(diffTypes).join(', ')}, not '${diffType}'}`;
        console.log(errMsg);
        return {diff: {error: errMsg}};
    }
    return {diff: diffTypes[diffType](text1, text2)};
}

const diffText = {
    name: "diffText",
    type: "Transform",
    description: "TEXT,TEXT=>JSON: Text Diff using NPM 'diff'",
    inputs: [
        {
            name: "text1",
            type: "text",
            source: ""
        },
        {
            name: "text2",
            type: "text",
            source: ""
        },
        {
            name: "diffType",
            type: "text",
            source: ""
        },
     ],
    outputs: [
        {
            name: "diff",
            type: "json",
        }
    ],
    code: diffTextCode
}

export default diffText;
