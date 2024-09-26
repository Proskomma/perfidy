import React, { useState, useCallback, useEffect } from "react";
import stepTemplates from "../lib/stepTemplates";

export default function useSteps({ defaultPipeline, defaultSteps }) {
  const [steps, setSteps] = useState(defaultSteps || []);

  const loadPipeline = useCallback((pipeline) => {
    const updatedPipeline = pipeline.map((step) => {
      if (step.type === "Transform") {
        const template = stepTemplates.Transform[step.name];
        return {
          ...step,
          code: template?.code,
          description: template?.description,
        };
      }
      return step;
    });
    setSteps(updatedPipeline);
  }, []);

  useEffect(() => {
    if (defaultPipeline) {
      loadPipeline(defaultPipeline);
    }
  }, [defaultPipeline, loadPipeline]);

  return { steps, setSteps, loadPipeline };
}
