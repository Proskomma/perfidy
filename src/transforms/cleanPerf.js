const cleanPerfCode = ({ perf }) => {
  const { sequences, ...newPerf } = perf;
  const sequencesReducer = (newSequences, sequenceId) => {
    const { sequenceProps, blocks } = sequences[sequenceId];
    newSequences[sequenceId] = {
      ...sequenceProps,
      blocks: blocks.map(block => ({
        ...block,
        ...(block.type === "paragraph" && {
          content: block.content.filter(element => ["chapter", "verses", "xref"].includes(element?.subtype))
        })
      }))
    }
    return newSequences;
  }
  const newSequences = Object.keys(sequences).reduce(sequencesReducer, {});

  return { perf: { ...newPerf, sequences: newSequences } };
}
const cleanPerf = {
    name: "cleanPerf",
    type: "Transform",
    description: "PERF=>PERF: Strips out every none graft",
    inputs: [
        {
            name: "perf",
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
    code: cleanPerfCode
}
export default cleanPerf;