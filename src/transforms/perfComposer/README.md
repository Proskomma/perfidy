# PERF Composer Transforms

## Overview

The PERF Composer Transforms API is used to manipulate and process Proskomma Editor Ready Format (PERF) data. It consists of several transforms that work together to decompose, modify, and recompose PERF data.

## Main Transforms

1. `decomposePerf`: This transform extracts various components from a PERF input.
2. `reconcileAlignment`: This transform reconciles alignment markup with verse contents.
3. `reconcileMarkup`: This transform reconciles markup in the PERF data.

## Decompose PERF Transform

The `decomposePerf` transform is used to extract markers, alignment data, and canonical text from the PERF input. It takes a PERF input and returns several objects:

### Input

- PERF object

### Output

- `perf`: A modified PERF object with alignment markup stripped.
- `strippedAlignment`: An object containing the extracted alignment data.
- `strippedInlineElements`: An object containing extracted inline elements.
- `cvContents`: An object containing the text content of verses organized by chapter and verse number.

## Reconcile Alignment Transform

The `reconcileAlignment` transform is used to merge alignment data back into the PERF structure.

### Input

- `perf`: A PERF object with stripped alignment.
- `verseTextMap`: A map of verse text content.
- `extractedAlignment`: The extracted alignment data.

### Output

- `perf`: A PERF object with reconciled alignment markup.
- `unalignedWords`: A list of words that couldn't be aligned.

## Reconcile Markup Transform

The `reconcileMarkup` transform is used to merge various types of markup back into the PERF structure.

### Input

- PERF object with stripped markup
- Extracted markup data

### Output

- PERF object with reconciled markup

## Helper Functions

The transforms use several helper functions to process words, handle markup data, and manage the PERF structure. These include:

- `handleMarkupData`: Processes and stores markup data.
- `extractWords`: Extracts individual words from text.
- `processWord`: Processes each word, updating occurrences and handling associated markup.
- `createMarkupData`: Creates markup data objects.
- `createAlignmentRecord`: Creates alignment record objects.

## Error Handling

The transforms now include improved error handling mechanisms:

- Detailed error messages for specific failure points in the transformation process.
- Graceful degradation when encountering non-critical errors, allowing the process to continue when possible.
- Logging of warnings and errors for later review and debugging.

## Performance Optimizations

Several optimizations have been implemented to improve the performance of the transforms:

- Caching of frequently accessed data to reduce redundant computations.
- Lazy evaluation of certain operations to avoid unnecessary processing.
- Parallel processing of independent operations where applicable.

## Usage

These transforms are typically used in sequence to decompose a PERF object, modify or analyze its components, and then recompose it with any necessary changes. They can be integrated into larger pipelines for complex PERF processing tasks.

For more detailed information on each transform and its usage, refer to the individual transform documentation.
