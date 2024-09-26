import usx2perf from "../transforms/usx2perf";
import wordFrequency from "../transforms/wordFrequency";
import wordSearch from "../transforms/wordSearch";
import verseStats from "../transforms/verseStats";
import proskommaQuery from "../transforms/proskommaQuery";
import lightRegex from "../transforms/lightRegex";
import regex from "../transforms/regex";
import validate from "../transforms/validate";
import diffText from "../transforms/diffText";
import diffJson from "../transforms/diffJson";
import identity from "../transforms/identity";
import searchRegexGen from "../transforms/searchRegexGen";
import longVerses1 from "../transforms/longVerses1";
import mergeReport from "../transforms/mergeReport";
import uniqueWords from "../transforms/uniqueWords";
import remoteTransform from "../transforms/remoteTransform";
import stripMarkup from "../transforms/stripMarkup";
import mergeMarkup from "../transforms/mergeMarkup";
import prepareJsonDiff from "../transforms/prepareJsonDiff";
import uniqueWordsVerses from "../transforms/uniqueWordsVerses";
import searchReplace from "../transforms/searchReplace";
import perf2PkJson from "../transforms/perf2PkJson";
import reconcileVerseElements from "../transforms/perfComposer/reconcileMarkup";
import reconcileAlignment from "../transforms/perfComposer/reconcileAlignment";
import decomposePerf from "../transforms/perfComposer/decomposePerf";

import { render } from "proskomma-json-tools";

const { stripAlignment, mergeAlignment, verseWords } =
  render.alignment.transforms;
const { mergePerfText, justTheBible, stripUwAlignment, mergeUwAlignment } =
  render.perfToPerf.transforms;
const { calculateUsfmChapterPositions, perfToUsfm, perfToUsfmJs, wordCount } =
  render.perfToX.transforms;
const { usfmToPerf } = render.xToPerf.transforms;

const stepTemplates = {
  Transform: {
    usfmToPerf,
    usx2perf,
    proskommaQuery,
    validate,
    diffText,
    diffJson,
    identity,
    justTheBible,
    reconcileVerseElements,
    reconcileAlignment,
    decomposePerf,
    mergePerfText,
    stripUwAlignment,
    mergeUwAlignment,
    wordFrequency,
    wordSearch,
    verseStats,
    calculateUsfmChapterPositions,
    perfToUsfm,
    perfToUsfmJs,
    wordCount,
    searchRegexGen,
    longVerses1,
    mergeReport,
    uniqueWords,
    remoteTransform,
    stripMarkup,
    verseWords,
    mergeMarkup,
    stripAlignment,
    mergeAlignment,
    prepareJsonDiff,
    uniqueWordsVerses,
    lightRegex,
    regex,
    perf2PkJson,
    searchReplace,
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
      outputType: "text",
    },
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
