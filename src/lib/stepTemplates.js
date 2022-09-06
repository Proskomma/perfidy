import usfm2perf from "../transforms/usfm2perf";
import usx2perf from "../transforms/usx2perf";
import perf2usfm from "../transforms/perf2usfm";
import wordFrequency from "../transforms/wordFrequency";
import wordSearch from "../transforms/wordSearch";
import justTheBible from "../transforms/justTheBible";
import verseStats from "../transforms/verseStats";
import proskommaQuery from "../transforms/proskommaQuery";
import lightRegex from '../transforms/lightRegex';
import regex from '../transforms/regex';
import validate from "../transforms/validate";
import diffText from "../transforms/diffText";
import diffJson from "../transforms/diffJson";
import mergePerfText from "../transforms/mergePerfText";
import identity from "../transforms/identity";
import searchRegexGen from "../transforms/searchRegexGen";
import longVerses1 from "../transforms/longVerses1";
import mergeReport from "../transforms/mergeReport";
import uniqueWords from "../transforms/uniqueWords";
import remoteTransform from "../transforms/remoteTransform";
import stripMarkup from "../transforms/stripMarkup";
import verseWords from "../transforms/verseWords";
import mergeMarkup from "../transforms/mergeMarkup";
import prepareJsonDiff from "../transforms/prepareJsonDiff";
import uniqueWordsVerses from '../transforms/uniqueWordsVerses';
import perf2PkJson from "../transforms/perf2PkJson";

const stepTemplates = {
    Transform: {
        usfm2perf,
        usx2perf,
        proskommaQuery,
        validate,
        diffText,
        diffJson,
        identity,
        justTheBible,
        mergePerfText,
        wordFrequency,
        wordSearch,
        verseStats,
        perf2usfm,
        searchRegexGen,
        longVerses1,
        mergeReport,
        uniqueWords,
        remoteTransform,
        stripMarkup,
        verseWords,
        mergeMarkup,
        prepareJsonDiff,
        uniqueWordsVerses,
        lightRegex,
        regex,
        perf2PkJson,
    },
    Source: {
        local: {
            type: "Source",
            sourceLocation: "local",
            localValue: "",
            outputType: "text",
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
            inputSource: "",
        },
        json: {
            type: "Display",
            inputType: "json",
            inputSource: "",
        },
    },
};

export default stepTemplates;
