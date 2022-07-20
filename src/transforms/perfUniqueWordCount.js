import {ProskommaRenderFromJson, wordCountActions} from 'proskomma-json-tools';

const perfUniqueWordCount = function ({perf}) {
    const cl = new ProskommaRenderFromJson({srcJson: perf, actions: wordCountActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
        return {words: output.words};
}
export default perfUniqueWordCount;
