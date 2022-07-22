# Perfidy
## A playground for Proskomma's PERF

### Installation
```
yarn install
npm start
```

### UI Documentation
This is currently at an advanced conceptual stage. In the meantime there are tooltips for all buttons.

### Workflow
- Create or load a pipeline in the `Spec` pane
- Run it using the `>>` button at the top of the `Result` pane (console shows progress)
- If there are issues, fix them, delete the results and try again
- If there are no issues, eyeball the results and maybe save them
- Maybe save your pipeline

### Demo Pipeline
Load `demo_pipeline.json` from the root of the repo using the `>P` button.

### Adding or Modifying PERF-Based Transforms
Transforms are defined in the `transforms` directory and declared to the UI in `lib/stepTemplates`. These code changes should hot-load in the React dev server, but __you will probably need to refresh the web page__ so that the latest templates are used to build the pipeline. (Saved data should still load as long as you don't change existing template names or signatures.)

We recommend following the internal format of the existing PERF-based transform files such as `perf2usfm.js`. There are three main parts:
- An object containing the PerfRender actions
- A function called `<transformName>Code` that takes an object containing the declared inputs as its sole argument, and which returns an object. containing the declared outputs as its value. This function will typically instantiate and call the render class.
- An object with various metadata, with the transform function as the value of `code`

The transform file should export the metadata object, which should be imported into `stepTemplates.js` and added to the list of transforms.

### The PerfRender Processing Model
#### Overview
PerfRender is a streaming, event-based model that is similar in some ways to SAX in the XML world. PerfRender tree-walks the PERF JSON and generates events for each feature of the PERF. 

Streaming tends to be very fast, because there is very little setup and tear-down compared to building a complete document tree in memory. It also used much less memory, because document trees tend to involve large numbers of 64-bit pointers that typically take at least 10x as much working memory as the serialized document. (PerfRender itself runs against a JSON document that has been loaded into memory. However, the same API can be run against Proskomma, which provides all the PERF events without ever constructing a tree.)

Unlike SAX, which generates events based on basic XML syntax, PerfRender's events are related to the specific structure of PERF:
- startDocument
- endDocument
- startSequence
- endSequence
- blockGraft
- startParagraph
- endParagraph
- metaContent
- mark
- inlineGraft
- startWrapper
- endWrapper
- startMilestone
- endMilestone
- text

By default, all the callbacks are no-ops, so rendering with no actions will traverse the tree, setting up and tearing down context along the way, and output an empty object.

Actions may be added for any or all of the events. This model works particularly well for 'cherry-picking' specific information while ignoring the complexity of the rest of the document. For example, for tasks that just require the canonical text, a single `text` action handler will provide all that text, and just that text, via a series of callbacks, regardless of milestones, nested markup etc.

In addition, PerfRender maintains some 'vertical' state as it traverses the JSON tree. This provides context so that, eg, information about the current document, sequence and block is available when processing a `text` event.

Any output and any state not provided in the PerfRender context must be managed explicitly. PerfRender provides workspace and output objects to do this.

In many cases the amount of additional state that needs to be tracked is quite limited, and that state can be structured for maximum convenience and efficiency for the task in hand. For tasks where the required state begins to look like reconstructing the entire JSON tree, it may make sense to consider a non-streaming approach.


