import usfm2perf from '../transforms/usfm2perf';
import usx2perf from '../transforms/usx2perf';
import perf2usfm from '../transforms/perf2usfm';
import perfUniqueWordCount from '../transforms/perfUniqueWordCount';
import wordSearch from "../transforms/wordSearch";
import justTheBible from "../transforms/justTheBible";
import proskommaQuery from "../../pipelines/proskommaQuery";

const stepTemplates = {
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
    Transform: {
        usfm2perf,
        usx2perf,
        perf2usfm,
        perfUniqueWordCount,
        wordSearch,
        justTheBible,
        proskommaQuery,
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
