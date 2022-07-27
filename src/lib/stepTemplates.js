import diffJson from "../transforms/diffJson";
import diffText from "../transforms/diffText";
import identity from "../transforms/identity";
import justTheBible from "../transforms/justTheBible";
import longVerses1 from "../transforms/longVerses1";
import mergePerfText from "../transforms/mergePerfText";
import perf2usfm from '../transforms/perf2usfm';
import proskommaQuery from "../transforms/proskommaQuery";
import searchRegexGen from "../transforms/searchRegexGen";
import stripMarkup from '../transforms/stripMarkup';
import usfm2perf from '../transforms/usfm2perf';
import usx2perf from '../transforms/usx2perf';
import validate from "../transforms/validate";
import verseStats from "../transforms/verseStats";
import verseWords from '../transforms/verseWords';
import wordFrequency from '../transforms/wordFrequency';
import wordSearch from "../transforms/wordSearch";
import wordsWrappers from "../transforms/wordsWrappers";

const stepTemplates = {
    Transform: {
        diffJson,
        diffText,
        identity,
        justTheBible,
        longVerses1,
        mergePerfText,
        perf2usfm,
        proskommaQuery,
        searchRegexGen,
        stripMarkup,
        usfm2perf,
        usx2perf,
        validate,
        verseStats,
        verseWords,
        wordFrequency,
        wordSearch,
        wordsWrappers
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
