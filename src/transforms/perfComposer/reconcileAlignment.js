import { PerfRenderFromJson, render, mergeActions } from "proskomma-json-tools";
import xre from "xregexp";

const { identityActions } = render.perfToPerf.renderActions;

const localReconcileAlignmentActions = {
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
          config.extractedAlignment &&
          config.verseTextMap
        ) {
          const verseMarkerElement = {
            ...context.sequences[0].element,
            subtype: context.sequences[0].element.subType,
          };
          delete verseMarkerElement.subType;

          const mutableVerseElements = workspace.outputContentStack[0];

          mutableVerseElements.push(verseMarkerElement);

          reconcileVerseAlignment({
            verseText: config.verseTextMap[chapter][verses],
            verseAlignmentData: config.extractedAlignment[chapter][verses],
            mutableVerseElements,
            onUnalignedWordFound: (word) => {
              output.unalignedWords[chapter] ??= {};
              output.unalignedWords[chapter][verses] ??= [];
              output.unalignedWords[chapter][verses].push(word);
            },
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
      action: ({ workspace, config, context, ...other }) => {
        return true;
      },
    },
  ],
};

const reconcileAlignmentCode = function ({
  perf,
  verseTextMap,
  extractedAlignment,
}) {
  const cl = new PerfRenderFromJson({
    srcJson: perf,
    actions: mergeActions([localReconcileAlignmentActions, identityActions]),
  });
  const output = {};
  cl.renderDocument({
    docId: "",
    config: {
      verseTextMap,
      extractedAlignment,
    },
    output,
  });
  return { perf: output.perf };
};

const reconcileAlignment = {
  name: "reconcileAlignment",
  type: "Transform",
  description: "PERF=>PERF reconciles alignment markup with verse contents",
  inputs: [
    {
      name: "perf",
      type: "json",
      source: "",
    },
    {
      name: "extactedAlignment",
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
      name: "unalignedWords",
      type: "json",
    },
  ],
  code: reconcileAlignmentCode,
};
export default reconcileAlignment;

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

const endMilestone = {
  type: "end_milestone",
  subtype: "usfm:zaln",
};

/**
 * This function merges USFM alignment markup with the verse contents. And tries to reconciliate the alignment markup with the verse contents even if the alignment markup is lost, or if verse contents and alignment data is out of sync.
 *
 * Rules:
 * - Alignment elements can be nested, meaning a start_milestone element can be placed after another start_milestone element even if the previous one has not been closed by an end_milestone element.
 * - Word wrappers cannot be nested within other word wrappers; they always contain a single word string and the updated occurrences count.
 * - At least one word wrapper should be between every two alignment elements.
 * - If a word wrapper is not between two alignment elements, it is considered unaligned.
 *
 * Types:
 *
 * type StartMilestone<AlignmentData> = {
 *   type: "start_milestone",
 *   subType: "usfm:zaln"
 * } & AlignmentData;
 *
 * type EndMilestone = {
 *   type: "end_milestone",
 *   subType: "usfm:zaln",
 * };
 * type WordWrapper = {
 *   type: "wrapper",
 *   subType: "usfm:w",
 *   content: [string]
 * };
 *
 * Example:
 * [
 *   // Simple alignment case
 *   {
 *     type: "start_milestone",
 *     subType: "usfm:zaln",
 *     ...otherAttributes,
 *   },
 *   {
 *     type: "wrapper",
 *     subType: "usfm:w",
 *     content: ["Hello"],
 *   },
 *   {
 *     type: "end_milestone",
 *     subType: "usfm:zaln",
 *   },
 *   // Complex alignment case
 *   {
 *     type: "start_milestone",
 *     subType: "usfm:zaln",
 *     ...otherAttributes,
 *   },
 *   {
 *     type: "wrapper",
 *     subType: "usfm:w",
 *     content: ["Hello"],
 *   },
 *   {
 *     type: "start_milestone",
 *     subType: "usfm:zaln",
 *   },
 *   {
 *     type: "wrapper",
 *     subType: "usfm:w",
 *     content: ["Beautiful"],
 *   },
 *   {
 *     type: "end_milestone",
 *     subType: "usfm:zaln",
 *   },
 *   {
 *     type: "wrapper",
 *     subType: "usfm:w",
 *     content: ["World"],
 *   },
 *   {
 *     type: "end_milestone",
 *     subType: "usfm:zaln",
 *   },
 * ];
 *
 */
const reconcileVerseAlignment = function ({
  verseText,
  verseAlignmentData,
  mutableVerseElements,
  onUnalignedWordFound,
}) {
  try {
    const words = processWords(verseText);
    const verseWordsOccurrences = countWordOccurrences(words);
    const currentOccurrences = {};
    const alignmentStack = [];
    let mergeableWords = [];

    for (const word of words) {
      if (!isWordLike(word) || !verseAlignmentData[word]) {
        mergeableWords.push(word);
        continue;
      }

      flushMergeableWords(mergeableWords, mutableVerseElements);
      mergeableWords = [];

      currentOccurrences[word] = (currentOccurrences[word] || 0) + 1;
      const wordOccurrence = currentOccurrences[word];

      const alignmentInfo = getAlignmentInfo(
        word,
        wordOccurrence,
        verseAlignmentData,
        verseWordsOccurrences
      );

      handleOpeningAlignments(
        alignmentInfo,
        alignmentStack,
        mutableVerseElements
      );

      if (alignmentInfo.isAligned) {
        addAlignedWord(
          word,
          wordOccurrence,
          alignmentInfo,
          mutableVerseElements
        );
      } else {
        handleUnalignedWord(
          word,
          wordOccurrence,
          alignmentInfo,
          onUnalignedWordFound,
          mutableVerseElements,
          alignmentStack
        );
      }

      handleClosingAlignments(
        alignmentInfo,
        alignmentStack,
        mutableVerseElements
      );
    }

    flushMergeableWords(mergeableWords, mutableVerseElements);

    return false;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Helper functions

function isWordLike(word) {
  return xre.match(word, lexingRegexes[0][2], "all").length > 0;
}

function countWordOccurrences(words) {
  return words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
}

function flushMergeableWords(mergeableWords, mutableVerseElements) {
  if (mergeableWords.length) {
    mutableVerseElements.push(mergeableWords.join("").replace(/\s{2,}/g, " "));
  }
}

function getAlignmentInfo(
  word,
  occurrence,
  verseAlignmentData,
  verseWordsOccurrences
) {
  const wordAlignmentData = verseAlignmentData[word];
  const wordOccurrencesMatchAlignment =
    verseWordsOccurrences[word] === wordAlignmentData?.occurrencesCount;

  return {
    isAligned:
      wordOccurrencesMatchAlignment &&
      wordAlignmentData.occurrences[occurrence],
    before: wordOccurrencesMatchAlignment
      ? wordAlignmentData.occurrences[occurrence]?.before || []
      : [],
    after: wordOccurrencesMatchAlignment
      ? wordAlignmentData.occurrences[occurrence]?.after || []
      : [],
    occurrencesCount: wordAlignmentData?.occurrencesCount,
  };
}

function handleOpeningAlignments(
  alignmentInfo,
  alignmentStack,
  mutableVerseElements
) {
  alignmentInfo.before.forEach(({ payload }) => {
    if (payload.type === "start_milestone") {
      mutableVerseElements.push(payload);
      alignmentStack.push(payload);
    }
  });
}

function addAlignedWord(word, occurrence, alignmentInfo, mutableVerseElements) {
  const wrapper = {
    type: "wrapper",
    subtype: "usfm:w",
    atts: {
      "x-occurrences": [String(alignmentInfo.occurrencesCount)],
      "x-occurrence": [String(occurrence)],
    },
    content: [word],
  };
  mutableVerseElements.push(wrapper);
}

function handleUnalignedWord(
  word,
  occurrence,
  alignmentInfo,
  onUnalignedWordFound,
  mutableVerseElements,
  alignmentStack
) {
  // Close all open alignments
  while (alignmentStack.length > 0) {
    mutableVerseElements.push({ ...endMilestone });
    alignmentStack.pop();
  }

  onUnalignedWordFound({
    word,
    occurrence,
    totalOccurrencesInVerse: alignmentInfo.occurrencesCount,
  });

  addAlignedWord(word, occurrence, alignmentInfo, mutableVerseElements);
}

function handleClosingAlignments(
  alignmentInfo,
  alignmentStack,
  mutableVerseElements
) {
  alignmentInfo.after.forEach(({ payload }) => {
    if (payload.type === "end_milestone") {
      if (alignmentStack.length > 0) {
        mutableVerseElements.push(payload);
        alignmentStack.pop();
      }
    }
  });
}
