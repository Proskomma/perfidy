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

Streaming tends to be very fast, because there is very little setup and tear-down compared to building a complete document tree in memory. It also used much less working memory, because document trees tend to involve large numbers of 64-bit pointers that typically take at least 10x as much working memory as the serialized document. (PerfRender itself runs against a JSON document that has been loaded into memory. However, the same API can be run against Proskomma, which provides all the PERF events without ever constructing a tree.)

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

#### Defining Actions

Actions are defined within an object which has one key per PerfRender event:
```
{
    startDocument: [...],
    startSequence: [...],
    ...
]
```
Any events not included in this object will be ignored. The value in each case is an array of action objects, each of which has a description, a test and an action:
```
{
    startDocument: [
        {
            description: "My first startDocument Action",
            test: () => true
            action: () => {console.log("Hello, Streaming World!")}
        },
        {...},
        ...
    ]
}
```
`description` is required and is used by some debugging utilities.

`test` is a boolean function that controls whether the action will be executed.

`action` is a function that does the actual work.

The `test` and `action` functions both accept an 'environment' object:
```{config, context, workspace, output}```

`config` is an object that allows runtime-specific values to be passed into the render process.

`context` is a read-only object that caches information about the current content and the containers that enclose it.

`workspace` is an object that may be used to preserve state between callbacks. It is not returned at the end of the rendering.

`output` is an object that is populated by reference and which will be available after the rendering process.

A typical way to structure a program would be
- Set up state storage and output structures in a `startDocument` action
- Track state (such as 'current chapter') in `workspace` using the appropriate action (`mark` for chapters)
- Build most output incrementally using an action for the appropriate event
- Finalize output (eg perform any necessary aggregation) in an `endDocument` action

#### Conditional Execution

For each event, the renderer takes each action in turn.
- If the `test` function returns a falsy value, it continues to the next action.
- If the `test` function returns a truthy value, the corresponding `action` is executed. Then,
  - if the `action` function returns a truthy value, the renderer continues to the next action for this event.
  - Otherwise, it ignores any following actions for this event.

This mechanism supports multiple ways to structure the code, eg
- One action per event, with an always-true test, and all the business logic in the action. This provides maximum flexibility at the price of potentially large and deeply-nested action functions.
- Multiple actions per event, each with a specific test (except for maybe the last, 'default' action), all of which return a falsy value. This provides a way to structure an `if/then/else` workflow.
- Multiple actions per event, some or all of which return truthy values. This provides a way to execute zero or more sets of code in order depending on the context.

Note - in the case of multiple actions returning falsy values - that conditions in the `test` function do not have the same semantics as tests inside the `action` function. A failing `test` in this case will mean that subsequent actions will be tested, whereas a failing test inside an action will mean that no subsequent actions will be tested.
