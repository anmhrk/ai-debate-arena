<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js';
  import { Textarea } from '$lib/components/ui/textarea/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import ShuffleIcon from '@lucide/svelte/icons/shuffle';
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';

  // https://console.groq.com/docs/models
  const llmOptions = [
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

  let prompt = $state('');
  let forLlmValue = $state(llmOptions[0].value);
  let againstLlmValue = $state(llmOptions[1].value);
  let loading = $state(false);

  let forLlm = $derived(
    llmOptions.find((option) => option.value === forLlmValue) || llmOptions[0]
  );
  let againstLlm = $derived(
    llmOptions.find((option) => option.value === againstLlmValue) ||
      llmOptions[1]
  );

  function randomizeSelection() {
    const shuffled = [...llmOptions].sort(() => Math.random() - 0.5);
    forLlmValue = shuffled[0].value;
    againstLlmValue = shuffled[1].value;
  }
</script>

<div class="flex flex-1 p-4 sm:p-6 lg:p-8">
  <div class="mx-auto w-full max-w-4xl space-y-8">
    <div class="space-y-6 text-center">
      <div class="space-y-4">
        <h1
          class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
        >
          Start a New Debate
        </h1>
        <p class="mx-auto max-w-2xl text-lg text-muted-foreground">
          Choose your topic and select which AI models will argue for and
          against your position
        </p>
      </div>
    </div>

    <div class="mx-auto max-w-3xl">
      <form
        method="POST"
        use:enhance={() => {
          if (!prompt.trim()) {
            toast.error('Prompt is required');
            return;
          }

          loading = true;

          return async ({ result, update }) => {
            loading = false;

            if (result.type === 'failure' && result.data?.error) {
              toast.error(result.data.error as string);
            }

            await update();
          };
        }}
        class="space-y-8"
      >
        <div class="space-y-3">
          <label
            for="prompt"
            class="block text-sm font-semibold text-foreground"
          >
            Debate Topic
          </label>
          <Textarea
            id="prompt"
            name="prompt"
            bind:value={prompt}
            placeholder="What do you want to debate?"
            class="max-h-[120px] min-h-[120px] resize-none !text-sm"
            disabled={loading}
            onkeydown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).form?.requestSubmit();
              }
            }}
          />
        </div>

        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-foreground">
              Choose Your Debaters
            </p>
            <Button
              type="button"
              variant="outline"
              onclick={randomizeSelection}
              class="gap-2"
            >
              <ShuffleIcon class="h-4 w-4" />
              Randomize
            </Button>
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-full bg-green-500"></div>
                <label
                  for="supporting-llm"
                  class="text-sm font-semibold text-green-600 dark:text-green-400"
                >
                  Supporting Side
                </label>
              </div>

              <Select.Root type="single" bind:value={forLlmValue} name="forLlm">
                <Select.Trigger id="supporting-llm" class="w-full">
                  {forLlm.label}
                </Select.Trigger>
                <Select.Content>
                  {#each llmOptions as option}
                    <Select.Item value={option.value}
                      >{option.label}</Select.Item
                    >
                  {/each}
                </Select.Content>
              </Select.Root>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-full bg-red-500"></div>
                <label
                  for="opposing-llm"
                  class="text-sm font-semibold text-red-600 dark:text-red-400"
                >
                  Opposing Side
                </label>
              </div>

              <Select.Root
                type="single"
                bind:value={againstLlmValue}
                name="againstLlm"
              >
                <Select.Trigger id="opposing-llm" class="w-full">
                  {againstLlm.label}
                </Select.Trigger>
                <Select.Content>
                  {#each llmOptions as option}
                    <Select.Item value={option.value}
                      >{option.label}</Select.Item
                    >
                  {/each}
                </Select.Content>
              </Select.Root>
            </div>
          </div>
        </div>

        <div class="flex justify-center pt-6">
          <Button type="submit" size="lg" disabled={!prompt.trim() || loading}>
            {#if loading}
              Creating debate...
            {:else if !prompt.trim()}
              Enter a topic to start
            {:else}
              Start the Debate
            {/if}
          </Button>
        </div>
      </form>
    </div>
  </div>
</div>
