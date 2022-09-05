// https://github.com/Proskomma/proskomma-json-tools/blob/main/src/transforms/identityActions.js

import {ProskommaRenderFromJson, transforms, mergeActions} from 'proskomma-json-tools';

const reportRecordsForCV = function (report, chapter, verses) {

  return report.filter( 
    (record) => record.chapter === chapter && record.verses === verses
  )
} 

const localmergeReportActions = {
  startDocument: [
    {
      description: "setup",
      test: () => true,
      action: ({workspace}) => { 
        workspace.chapter = null;
        workspace.verses = null;
        return true;
      }
    }
  ],
  mark: [
    {
      description: "mark-chapters",
      test: ({context}) => context.sequences[0].element.subType === 'chapter',
      action: ({config, context, workspace, output}) => {
          const element = context.sequences[0].element;
          workspace.chapter = element.atts['number'];
          workspace.verses = 0;
          return true;
      }
    },
    {
      description: "mark-verses",
      test:  ({context}) => context.sequences[0].element.subType === 'verses',
      action: ({config, context, workspace, output}) => {
        const element = context.sequences[0].element;
        workspace.verses = element.atts['number'];
          const markRecord = {
              type: element.type,
              subtype: element.subType,
          };
          const verseRecords = reportRecordsForCV(config.report, workspace.chapter, workspace.verses);
          if ( verseRecords.length > 0 ) {
            markRecord.metaContent = [];
            for ( const vr of verseRecords ) {
              for ( const payloadContent of vr.payload ) {
                markRecord.metaContent.push( payloadContent );
              }
            }
          }
          if (element.atts) {
              markRecord.atts = element.atts;
          }
          workspace.outputContentStack[0].push(markRecord);
          return false;
      }
    }
  ],
};

const mergeReportCode = function ({perf, report}) {
    const cl = new ProskommaRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                [
                    localmergeReportActions,
                    transforms.identityActions
                ]
            )
        }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {report}, output});
    return {perf: output.perf}; // identityActions currently put PERF directly in output
}

const mergeReport = {
    name: "mergeReport",
    type: "Transform",
    description: "PERF=>PERF adds report to verses",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "report",
            type: "json",
            source: ""
        }
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        }
    ],
    code: mergeReportCode
}
export default mergeReport;
