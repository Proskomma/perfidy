import pipelineJson from '../../pipelines/wordSearchPipeline.json';
import runCallback from '../lib/runCallback';
import stepTemplates from "../lib/stepTemplates";
import {Proskomma}  from 'proskomma';

describe('wordSearch pipeline integration test', () => {
    test('run', async () => {
        // Use proskomma directly instead of with react hook.
        const proskomma = new Proskomma();
        // We need to tweak this when not using hook. Not sure why.
        pipelineJson[1].localValue = "{\"lang\": \"eng\", \"abbr\": \"ust\"}";

        pipelineJson
            .filter(st => st.type === "Transform")
            .forEach(
                st => {
                    st.code = stepTemplates.Transform[st.name].code;
                    st.description = stepTemplates.Transform[st.name].description;
                }
            );
        const specSteps = pipelineJson;

        let results;
        const setResults = (value) => {
            results = value;
        };
        const setRunIssues = () => {};

        await runCallback({
            specSteps,
            setResults,
            setRunIssues,
            proskomma
        })

        expect(results[2].value.matches).toContainEqual({"chapter": "3", "content": ["God", " ", "generously", " ", "gave", " ", "us", " ", "his", " ", "Holy", " ", "Spirit", " ", "when", " ", {"content": ["Jesus"], "subtype": "x-search-match", "type": "wrapper"}, " ", "the", " ", "Messiah", " ", "saved", " ", "us", ". "], "verses": "6"});
    });
});

