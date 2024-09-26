import { PerfRenderFromJson, render, mergeActions } from "proskomma-json-tools";
import xre from "xregexp";

/**
 * @typedef {Object} PerfJson
 * @property {string} main_sequence_id - The ID of the main sequence.
 * @property {Object.<string, Sequence>} sequences - A map of sequence IDs to Sequence objects.
 */

/**
 * @typedef {Object} Sequence
 * @property {string} type - The type of the sequence (e.g., "main").
 * @property {Block[]} blocks - An array of Block objects in the sequence.
 */

/**
 * @typedef {Object} Block
 * @property {string} type - The type of the block (e.g., "paragraph", "graft").
 * @property {string} subtype - The subtype of the block.
 * @property {(string|Object)[]} content - The content of the block, which can be strings or nested objects.
 * @property {number} blockN - The block number.
 */

/**
 * @typedef {Object} Element
 * @property {string} type - The type of the element (e.g., "wrapper", "milestone").
 * @property {string} subType - The subtype of the element.
 * @property {Object.<string, string>} atts - Attributes of the element.
 */

/**
 * @typedef {Object} ActionContext
 * @property {Object} context - The current context of the rendering process.
 * @property {Object} workspace - The workspace object for storing temporary data.
 * @property {Object} output - The output object for storing results.
 * @property {PerfJson} output.perf - The output PERF JSON object.
 */

/**
 * @typedef {Object} ActionObject
 * @property {string} description - Description of the action.
 * @property {function(ActionContext): boolean} test - Function to test if the action should be executed.
 * @property {function(ActionContext): boolean} action - Function to execute the action.
 */

/**
 * @typedef {Object} RenderActions
 * @property {ActionObject[]} startDocument - Actions for the start of the document.
 * @property {ActionObject[]} endDocument - Actions for the end of the document.
 * @property {ActionObject[]} startSequence - Actions for the start of a sequence.
 * @property {ActionObject[]} endSequence - Actions for the end of a sequence.
 * @property {ActionObject[]} startTable - Actions for the start of a table.
 * @property {ActionObject[]} endTable - Actions for the end of a table.
 * @property {ActionObject[]} unresolvedBlockGraft - Actions for unresolved block grafts.
 * @property {ActionObject[]} blockGraft - Actions for block grafts.
 * @property {ActionObject[]} startParagraph - Actions for the start of a paragraph.
 * @property {ActionObject[]} endParagraph - Actions for the end of a paragraph.
 * @property {ActionObject[]} startRow - Actions for the start of a table row.
 * @property {ActionObject[]} endRow - Actions for the end of a table row.
 * @property {ActionObject[]} startCell - Actions for the start of a table cell.
 * @property {ActionObject[]} endCell - Actions for the end of a table cell.
 * @property {ActionObject[]} metaContent - Actions for meta content.
 * @property {ActionObject[]} mark - Actions for marks (e.g., chapter, verse).
 * @property {ActionObject[]} unresolvedInlineGraft - Actions for unresolved inline grafts.
 * @property {ActionObject[]} inlineGraft - Actions for inline grafts.
 * @property {ActionObject[]} startWrapper - Actions for the start of a wrapper.
 * @property {ActionObject[]} endWrapper - Actions for the end of a wrapper.
 * @property {ActionObject[]} startMilestone - Actions for the start of a milestone.
 * @property {ActionObject[]} endMilestone - Actions for the end of a milestone.
 * @property {ActionObject[]} text - Actions for text content.
 */

/**
 * @typedef {Object} PerfRenderFromJsonOptions
 * @property {PerfJson} srcJson - The source JSON object to render from.
 * @property {RenderActions} actions - The render actions to use.
 */

/**
 * @typedef {Object} RenderDocumentOptions
 * @property {string} docId - The document ID.
 * @property {Object} output - The output object to store results.
 */

/**
 * @function
 * @description Merges two sets of render actions.
 * @param {RenderActions} actions1 - The first set of render actions.
 * @param {RenderActions} actions2 - The second set of render actions.
 * @returns {RenderActions} The merged render actions.
 */

const USFM_ZALN = "usfm:zaln";
const USFM_W = "usfm:w";

/**
 * @description: This is a custom action that is used to decompose text, alignment markup and other markup from a perf document.
 * @param {RenderActions} renderActions - The render actions object.
 * @returns {boolean} - Returns true if the action is successful, false otherwise.
 */
const localDecomposePerfActions = {
  startDocument: [
    {
      description: "Set up",
      test: () => true,
      action: ({ workspace, output }) => {
        workspace.chapter = null;
        workspace.verses = null;
        workspace.lastWord = "";
        workspace.pendingAlignmentMarkup = [];
        workspace.verseWordsOccurrences = {};
        workspace.PendingStartMilestones = [];
        workspace.PendingInlineElements = {
          opening: [],
          closing: [],
        };
        output.extractedAlignment = {};
        output.extractedInlineElements = {};
        output.verseTextMap = {};

        output.graftsContainers = new Set();
        return true;
      },
    },
  ],
  startMilestone: [
    {
      description: "Ignore zaln startMilestone events",
      test: ({ context }) =>
        context.sequences[0].type === "main" &&
        context.sequences[0].element.subType === USFM_ZALN,
      action: ({ context, workspace }) => {
        const payload = context.sequences[0].element;
        payload.subtype = payload.subType;
        delete payload.subType;
        workspace.pendingAlignmentMarkup.push(payload);
        workspace.PendingStartMilestones.push(payload);
      },
    },
  ],
  endMilestone: [
    {
      description: "Ignore zaln endMilestone events",
      test: ({ context }) =>
        context.sequences[0].type === "main" &&
        context.sequences[0].element.subType === USFM_ZALN,
      action: ({ context, workspace, output }) => {
        const { lastWord: word } = workspace;
        const markupData = {
          associatedWord: word,
          occurrenceIndex: workspace.verseWordsOccurrences[word],
          position: "after",
        };

        const payload = { ...context.sequences[0].element };
        payload.subtype = payload.subType;
        delete payload.subType;
        const record = {
          payload,
          startMilestone: workspace.PendingStartMilestones.shift(),
        };

        const extractedAlignment =
          output.extractedAlignment[workspace.chapter][workspace.verses];
        const occurrencesCount = workspace.verseWordsOccurrences[word];

        handleMarkupData(
          extractedAlignment,
          markupData,
          record,
          occurrencesCount
        );

        return false;
      },
    },
  ],
  startWrapper: [
    {
      description: "Handle startWrapper events",
      test: ({ context }) => context.sequences[0].type === "main",
      action: ({ context, workspace }) => {
        const { element } = context.sequences[0];
        const payload = element;
        payload.subtype = payload.subType;
        delete payload.subType;

        if (element.subtype === USFM_W) {
          workspace.pendingAlignmentMarkup.push(payload);
        } else {
          workspace.PendingInlineElements.opening.push(payload);
          workspace.PendingInlineElements.closing.push(payload);
        }
        return false;
      },
    },
  ],
  endWrapper: [
    {
      description: "Handle startWrapper events",
      test: ({ context }) => context.sequences[0].type === "main",
      action: ({ context, workspace, output }) => {
        const { element } = context.sequences[0];

        if (element.subtype === USFM_W) {
          return false;
        } else {
          const { lastWord: word } = workspace;
          const markupData = {
            associatedWord: word,
            occurrenceIndex: workspace.verseWordsOccurrences[word],
            position: "after",
          };
          const extractedInlineElements =
            output.extractedInlineElements[workspace.chapter][workspace.verses];
          const record = {
            payload: workspace.PendingInlineElements.closing.pop(),
          };
          const occurrencesCount = workspace.verseWordsOccurrences[word];
          handleMarkupData(
            extractedInlineElements,
            markupData,
            record,
            occurrencesCount
          );
        }
        return false;
      },
    },
  ],
  inlineGraft: [
    {
      description: "Ignore inlineGraft events",
      test: ({ context, workspace }) =>
        workspace.chapter &&
        workspace.verses &&
        context.sequences[0].type === "main",
      action: ({ context, workspace, output }) => {
        try {
          const { element } = context.sequences[0];
          const { lastWord: word } = workspace;
          const payload = { ...element };
          payload.subtype = payload.subType;
          delete payload.subType;
          if (!word) {
            workspace.PendingInlineElements.opening.push(payload);
          } else {
            const extractedInlineElements =
              output.extractedInlineElements[workspace.chapter][
                workspace.verses
              ];

            const markupData = {
              associatedWord: word,
              occurrenceIndex: workspace.verseWordsOccurrences[word],
              position: "after",
            };
            const record = {
              payload,
            };
            const occurrencesCount = workspace.verseWordsOccurrences[word];
            handleMarkupData(
              extractedInlineElements,
              markupData,
              record,
              occurrencesCount
            );
          }
          output.graftsContainers.add(context.sequences[0].block.blockN);
          return true;
        } catch (error) {
          console.trace({ error });
        }
      },
    },
  ],
  text: [
    {
      description: "Process text and handle markup",
      test: ({ context }) => context.sequences[0].type === "main",
      action: ({ context, workspace, output }) => {
        try {
          const { text } = context.sequences[0].element;
          const { chapter, verses } = workspace;

          // Update verseTextMap if chapter and verses are set
          if (chapter && verses) {
            output.verseTextMap[chapter][verses] += text;
          }

          const words = extractWords(text);

          for (const word of words) {
            processWord(word, workspace, output);
          }

          return false;
        } catch (error) {
          console.error("Error in text processing:", error);
          return false;
        }
      },
    },
  ],
  mark: [
    {
      description: "Update CV dependant state",
      test: () => true,
      action: ({ context, workspace, output }) => {
        try {
          const element = context.sequences[0].element;
          const isChapter = element.subType === "chapter";
          const isVerses = element.subType === "verses";

          if (isChapter || isVerses) {
            const number = element.atts["number"];

            if (isChapter) {
              workspace.chapter = number;
              console.log({ workspace });
              workspace.verses = 0;
              output.verseTextMap[number] = {};
              output.extractedAlignment[number] = {};
              output.extractedInlineElements[number] = {};
            } else {
              workspace.verses = number;
            }

            workspace.lastWord = "";
            workspace.verseWordsOccurrences = {};
            workspace.PendingInlineElements = {
              opening: [],
              closing: [],
            };

            const { chapter, verses } = workspace;
            output.verseTextMap[chapter][verses] = "";
            output.extractedAlignment[chapter][verses] = {};
            output.extractedInlineElements[chapter][verses] = {};
          }
        } catch (error) {
          console.error({ error });
        }
        return true;
      },
    },
  ],
  endDocument: [
    {
      description: "Remove inline grafts from the output perf",
      test: () => true,
      action: ({ output }) => {
        const mainSequenceId = output.perf.main_sequence_id;
        [...output.graftsContainers].forEach((blockN) => {
          const mainSequence = output.perf.sequences[mainSequenceId];
          const block = mainSequence.blocks[blockN];
          block.content = block.content.filter(
            (block) => block.type !== "graft"
          );
        });
        return true;
      },
    },
  ],
};

const decomposePerfCode = function ({ perf, verseWords }) {
  const { identityActions } = render.perfToPerf.renderActions;
  const cl = new PerfRenderFromJson({
    srcJson: perf,
    actions: mergeActions([localDecomposePerfActions, identityActions]),
  });
  const output = {};
  cl.renderDocument({ docId: "", output });
  return {
    perf: output.perf,
    extractedAlignment: output.extractedAlignment,
    extractedInlineElements: output.extractedInlineElements,
    verseTextMap: output.verseTextMap,
  };
};

const decomposePerf = {
  name: "decomposePerf",
  type: "Transform",
  description: "PERF=>PERF: Decompose text and markup",
  inputs: [
    {
      name: "perf",
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
      name: "extractedAlignment",
      type: "json",
    },
    {
      name: "extractedInlineElements",
      type: "json",
    },
    {
      name: "verseTextMap",
      type: "json",
    },
  ],
  code: decomposePerfCode,
};

function handleMarkupData(
  extractedAlignment,
  markupData,
  record,
  occurrencesCount
) {
  const { associatedWord, occurrenceIndex, position } = markupData;

  if (!extractedAlignment[associatedWord]) {
    extractedAlignment[associatedWord] = {
      occurrencesCount,
      occurrences: {
        [occurrenceIndex]: {
          [position]: [record],
        },
      },
    };
  } else {
    extractedAlignment[associatedWord].occurrencesCount = occurrencesCount;
    extractedAlignment[associatedWord].occurrences[occurrenceIndex] =
      extractedAlignment[associatedWord].occurrences[occurrenceIndex] || {};
    extractedAlignment[associatedWord].occurrences[occurrenceIndex][position] =
      extractedAlignment[associatedWord].occurrences[occurrenceIndex][
        position
      ] || [];
    extractedAlignment[associatedWord].occurrences[occurrenceIndex][
      position
    ].push(record);
  }
}

function extractWords(text) {
  const re = xre("([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})");
  return xre.match(text, re, "all");
}

function processWord(word, workspace, output) {
  updateWordOccurrences(word, workspace);
  processAlignmentMarkup(word, workspace, output);
  processInlineElements(word, workspace, output);
  workspace.lastWord = word;
}

function updateWordOccurrences(word, workspace) {
  workspace.verseWordsOccurrences[word] =
    (workspace.verseWordsOccurrences[word] || 0) + 1;
}

function processAlignmentMarkup(word, workspace, output) {
  while (workspace.pendingAlignmentMarkup.length) {
    const payload = workspace.pendingAlignmentMarkup.shift();
    const markupData = createMarkupData(word, workspace, "before");
    const record = createAlignmentRecord(payload, word);
    const extractedAlignment =
      output.extractedAlignment[workspace.chapter][workspace.verses];
    const occurrencesCount = workspace.verseWordsOccurrences[word];

    handleMarkupData(extractedAlignment, markupData, record, occurrencesCount);
  }
}

function processInlineElements(word, workspace, output) {
  while (workspace.PendingInlineElements.opening.length) {
    const payload = workspace.PendingInlineElements.opening.shift();
    const markupData = createMarkupData(word, workspace, "before");
    const extractedInlineElements =
      output.extractedInlineElements[workspace.chapter][workspace.verses];
    const record = { payload };
    const occurrencesCount = workspace.verseWordsOccurrences[word];

    handleMarkupData(
      extractedInlineElements,
      markupData,
      record,
      occurrencesCount
    );
  }
}

function createMarkupData(word, workspace, position) {
  return {
    associatedWord: word,
    occurrenceIndex: workspace.verseWordsOccurrences[word],
    position,
  };
}

function createAlignmentRecord(payload, word) {
  return {
    payload: {
      ...payload,
      ...(payload.subtype === USFM_W && { content: [word] }),
    },
  };
}

export default decomposePerf;
