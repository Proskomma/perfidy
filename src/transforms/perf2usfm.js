import {ProskommaRenderFromJson, toUsfmActions} from 'proskomma-json-tools';

const perf2usfm = function ({perf}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: toUsfmActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
        return {usfm: output.usfm};
}
export default perf2usfm;
