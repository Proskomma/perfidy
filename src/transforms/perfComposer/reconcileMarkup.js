import { PerfRenderFromJson, render, mergeActions } from "proskomma-json-tools";
import xre from "xregexp";

const { identityActions } = render.perfToPerf.renderActions;

const localReconcileVerseElementsActions = {
  startDocument: [
    {
      description: "setup",
      test: () => true,
      action: ({ workspace, output }) => {
        workspace.chapter = null;
        workspace.verses = null;
        workspace.currentOccurrences = {};
        workspace.verseWordsOccurrences = {};
        output.unalignedWords = {};
        return true;
      },
    },
  ],
  mark: [
    {
      description: "mark-chapters-and-verses",
      test: ({ context }) =>
        ["chapter", "verses"].includes(context.sequences[0].element.subType),
      action: ({ context, workspace, config, output }) => {
        const {
          subType,
          atts: { number },
        } = context.sequences[0].element;

        if (subType === "chapter") {
          workspace.chapter = number;
          workspace.verses = 0;
        } else if (subType === "verses") {
          workspace.verses = number;
        }

        const { chapter, verses } = workspace;
        if (
          subType === "verses" &&
          config.extractedInlineElements &&
          config.verseTextMap
        ) {
          const verseMarkerElement = {
            ...context.sequences[0].element,
            subtype: context.sequences[0].element.subType,
          };
          delete verseMarkerElement.subType;

          const mutableVerseElements = workspace.outputContentStack[0];

          mutableVerseElements.push(verseMarkerElement);

          reconcileVerseMarkup({
            verseText: config.verseTextMap[chapter][verses],
            verseInlineElementsData:
              config.extractedInlineElements[chapter][verses],
            mutableVerseElements,
          });

          return false;
        }

        return true;
      },
    },
  ],
  endDocument: [
    {
      description: "setup",
      test: () => true,
      action: ({ workspace, config, context, output }) => {
        output.perf.sequences = {
          ...output.perf.sequences,
          ...config.sequences,
        };
        return true;
      },
    },
  ],
};

const reconcileVerseElementsCode = function ({
  perf,
  verseTextMap,
  extractedInlineElements,
}) {
  const cl = new PerfRenderFromJson({
    srcJson: perf,
    actions: mergeActions([
      localReconcileVerseElementsActions,
      identityActions,
    ]),
  });
  const output = {};
  const sequences = { ...perf.sequences };
  delete sequences[perf.main_sequence_id];
  cl.renderDocument({
    docId: "",
    config: {
      verseTextMap,
      extractedInlineElements,
      sequences,
    },
    output,
  });
  return { perf: output.perf };
};

const reconcileVerseElements = {
  name: "reconcileVerseElements",
  type: "Transform",
  description:
    "PERF=>PERF reconciles verse perf inline elements with verse contents",
  inputs: [
    {
      name: "perf",
      type: "json",
      source: "",
    },
    {
      name: "extactedInlineElements",
      type: "json",
      source: "",
    },
    {
      name: "verseTextMap",
      type: "json",
      source: "",
    },
  ],
  outputs: [
    {
      name: "perf",
      type: "json",
    },
    {
      name: "unreconciledMarkup",
      type: "json",
    },
  ],
  code: reconcileVerseElementsCode,
};
export default reconcileVerseElements;

const lexingRegexes = [
  [
    "printable",
    "wordLike",
    xre("([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})"),
  ],
  ["printable", "lineSpace", xre("([\\p{Separator}\t]{1,127})")],
  [
    "printable",
    "punctuation",
    xre(
      "([\\p{Punctuation}\\p{Math_Symbol}\\p{Currency_Symbol}\\p{Modifier_Symbol}\\p{Other_Symbol}])"
    ),
  ],
  ["bad", "unknown", xre("(.)")],
];
const re = xre.union(lexingRegexes.map((x) => x[2]));

const processWords = (text) => {
  return xre.match(text, re, "all");
};

const reconcileVerseMarkup = function ({
  verseText,
  verseInlineElementsData,
  mutableVerseElements,
}) {
  try {
    reconcileInlineElements({
      verseText,
      verseInlineElementsData,
      mutableVerseElements,
    });

    return false;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const reconcileInlineElements = function ({
  verseText,
  verseInlineElementsData,
  mutableVerseElements,
}) {
  try {
    const words = processWords(verseText);
    const verseWordsOccurrences = countWordOccurrences(words);
    const currentOccurrences = {};
    const wrapperStack = [];
    let mergeableWords = [];
    const unreconciledElements = [];

    for (const word of words) {
      if (!isWordLike(word) || !verseInlineElementsData[word]) {
        mergeableWords.push(word);
        continue;
      }

      flushMergeableWords(mergeableWords, mutableVerseElements, wrapperStack);
      mergeableWords = [];

      currentOccurrences[word] = (currentOccurrences[word] || 0) + 1;
      const wordOccurrence = currentOccurrences[word];

      const inlineElementInfo = getInlineElementInfo(
        word,
        wordOccurrence,
        verseInlineElementsData,
        verseWordsOccurrences
      );

      handleOpeningElements(
        inlineElementInfo,
        wrapperStack,
        mutableVerseElements,
        unreconciledElements
      );

      addWord(word, mutableVerseElements, wrapperStack);

      handleClosingElements(
        inlineElementInfo,
        wrapperStack,
        mutableVerseElements,
        unreconciledElements
      );
    }

    flushMergeableWords(mergeableWords, mutableVerseElements, wrapperStack);

    // Close any remaining wrappers
    while (wrapperStack.length > 0) {
      mutableVerseElements.push(wrapperStack.pop());
    }

    // Add unreconciled elements to the end of the verse
    mutableVerseElements.push(...unreconciledElements);

    return false;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

function isWordLike(word) {
  return xre.match(word, lexingRegexes[0][2], "all").length > 0;
}

function countWordOccurrences(words) {
  return words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
}

function flushMergeableWords(
  mergeableWords,
  mutableVerseElements,
  wrapperStack
) {
  if (mergeableWords.length) {
    const text = mergeableWords.join("").replace(/\s{2,}/g, " ");
    const target =
      wrapperStack.length > 0
        ? wrapperStack[wrapperStack.length - 1].content
        : mutableVerseElements;

    mergeContiguousText(target, text);
  }
}

function getInlineElementInfo(
  word,
  occurrence,
  verseInlineElementsData,
  verseWordsOccurrences
) {
  const wordInlineElementsData = verseInlineElementsData[word];
  const wordOccurrencesMatchInlineElements =
    verseWordsOccurrences[word] === wordInlineElementsData?.occurrencesCount;

  return {
    before: wordOccurrencesMatchInlineElements
      ? wordInlineElementsData.occurrences[occurrence]?.before || []
      : [],
    after: wordOccurrencesMatchInlineElements
      ? wordInlineElementsData.occurrences[occurrence]?.after || []
      : [],
    occurrencesCount: wordInlineElementsData?.occurrencesCount,
  };
}

function removeFalseyAndEmpty(obj) {
  if (typeof obj !== "object" || obj === null) return obj;

  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (
        value &&
        (typeof value !== "object" ||
          (Array.isArray(value)
            ? value.length > 0
            : Object.keys(value).length > 0))
      ) {
        acc[key] = value;
      }
      return acc;
    },
    Array.isArray(obj) ? [] : {}
  );
}

function handleOpeningElements(
  inlineElementInfo,
  wrapperStack,
  mutableVerseElements,
  unreconciledElements
) {
  console.log("Processing opening elements:", inlineElementInfo.before);

  inlineElementInfo.before.forEach((element, index) => {
    const cleanPayload = removeFalseyAndEmpty(element.payload);
    console.log(`Processing element ${index}:`, cleanPayload);

    if (cleanPayload.type === "wrapper") {
      const wrapper = {
        ...cleanPayload,
        content: [],
      };
      if (wrapperStack.length > 0) {
        wrapperStack[wrapperStack.length - 1].content.push(wrapper);
      } else {
        mutableVerseElements.push(wrapper);
      }
      wrapperStack.push(wrapper);
    } else if (cleanPayload.type === "graft") {
      debugger;
      addGraftElement(cleanPayload, wrapperStack, mutableVerseElements);
    } else if (cleanPayload.type) {
      // Handle other element types if necessary
      unreconciledElements.push(cleanPayload);
    }
  });
}

function handleClosingElements(
  inlineElementInfo,
  wrapperStack,
  mutableVerseElements,
  unreconciledElements
) {
  inlineElementInfo.after.forEach(({ payload }) => {
    const cleanPayload = removeFalseyAndEmpty(payload);
    if (cleanPayload.type === "wrapper") {
      if (wrapperStack.length > 0) {
        wrapperStack.pop();
      } else {
        unreconciledElements.push(cleanPayload);
      }
    } else if (cleanPayload.type === "graft") {
      addGraftElement(cleanPayload, wrapperStack, mutableVerseElements);
    } else {
      unreconciledElements.push(cleanPayload);
    }
  });
}

function addGraftElement(graft, wrapperStack, mutableVerseElements) {
  console.log("Adding graft element:", graft);

  const target =
    wrapperStack.length > 0
      ? wrapperStack[wrapperStack.length - 1].content
      : mutableVerseElements;

  target.push(graft);
}

function addWord(word, mutableVerseElements, wrapperStack) {
  const target =
    wrapperStack.length > 0
      ? wrapperStack[wrapperStack.length - 1].content
      : mutableVerseElements;

  mergeContiguousText(target, word);
}

function mergeContiguousText(array, newText) {
  if (
    array.length > 0 &&
    typeof array[array.length - 1] === "string" &&
    typeof newText === "string"
  ) {
    array[array.length - 1] += newText;
  } else {
    array.push(newText);
  }
}
