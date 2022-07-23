import usfm2perf from '../transforms/usfm2perf';
import usx2perf from '../transforms/usx2perf';
import perf2usfm from '../transforms/perf2usfm';
import wordFrequency from '../transforms/wordFrequency';
import wordSearch from "../transforms/wordSearch";
import justTheBible from "../transforms/justTheBible";
import verseStats from "../transforms/verseStats";
import proskommaQuery from "../transforms/proskommaQuery";
import validate from "../transforms/validate";
import diffText from "../transforms/diffText";
import diffJson from "../transforms/diffJson";

const stepTemplates = {
    Transform: {
        usfm2perf,
        usx2perf,
        perf2usfm,
        wordFrequency,
        wordSearch,
        justTheBible,
        verseStats,
        proskommaQuery,
        validate,
        diffText,
        diffJson
    },
    Source: {
        local: {
            type: "Source",
            sourceLocation: "local",
            localValue: "",
            outputType: "text"
        },
        http: {
            type: "Source",
            sourceLocation: "http",
            httpUrl: "",
            outputType: "text"
        }
    },
    Display: {
        text: {
            type: "Display",
            inputType: "text",
            inputSource: ""
        },
        json: {
            type: "Display",
            inputType: "json",
            inputSource: ""
        }
    }
}

export default stepTemplates;
