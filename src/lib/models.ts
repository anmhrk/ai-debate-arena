export const llmOptions = [
  {
    label: 'Kimi K2',
    value: 'moonshotai/kimi-k2-instruct'
  },
  {
    label: 'Llama 4 Maverick',
    value: 'meta-llama/llama-4-maverick-17b-128e-instruct'
  },
  {
    label: 'Llama 4 Scout',
    value: 'meta-llama/llama-4-scout-17b-16e-instruct'
  },
  {
    label: 'Llama 3.3 70B',
    value: 'llama-3.3-70b-versatile'
  },
  {
    label: 'DeepSeek R1 Llama Distilled',
    value: 'deepseek-r1-distill-llama-70b'
  },
  {
    label: 'Qwen 3 32B',
    value: 'qwen/qwen3-32b'
  }
];

export const getModelName = (modelId: string): string => {
  const model = llmOptions.find((option) => option.value === modelId);
  return model?.label || modelId;
};
