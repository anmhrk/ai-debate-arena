<script lang="ts">
  import { getModelName } from '$lib/models.js';
  import { onMount, tick } from 'svelte';

  let {
    debate = $bindable(),
    messages = $bindable([]),
    isLoading = false,
    loadingModelId = ''
  } = $props();

  let messagesContainer: HTMLDivElement | undefined;

  const scrollToBottom = async () => {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  onMount(() => {
    scrollToBottom();
  });

  const getMessageStyle = (message: any) => {
    const isForMessage = message.modelId === debate.forLlmId;
    const isAgainstMessage = message.modelId === debate.againstLlmId;
    const modelName = getModelName(message.modelId);

    let containerClass = 'flex ';
    let messageClass = 'max-w-[80%] rounded-lg border p-4 ';
    let nameClass = 'text-sm font-medium ';

    if (isForMessage) {
      containerClass += 'justify-end';
      messageClass +=
        'border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/20';
      nameClass += 'text-blue-700 dark:text-blue-400';
    } else {
      containerClass += 'justify-start';
      messageClass +=
        'border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/20';
      nameClass += 'text-red-700 dark:text-red-400';
    }

    return {
      containerClass,
      messageClass,
      nameClass,
      modelName,
      isForMessage,
      side: isForMessage ? 'FOR' : isAgainstMessage ? 'AGAINST' : null
    };
  };
</script>

<div
  class="flex h-[calc(100vh-11rem)] flex-col rounded-lg border border-border"
>
  <div
    bind:this={messagesContainer}
    class="flex-1 space-y-4 overflow-y-auto p-4"
  >
    {#each messages as message (message.id)}
      {@const style = getMessageStyle(message)}
      <div class={style.containerClass}>
        <div class={style.messageClass}>
          <div class="pb-2">
            <div class="flex items-center justify-between">
              <div class={style.nameClass}>
                {style.modelName}
              </div>
              {#if style.side}
                <div class="text-xs font-medium opacity-70">
                  {style.side}
                </div>
              {/if}
            </div>
          </div>
          <div class="pt-0">
            <p class="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    {/each}

    {#if isLoading}
      {@const loadingModelName = getModelName(loadingModelId)}
      {@const isForModel = loadingModelId === debate.forLlmId}
      <div class="flex {isForModel ? 'justify-end' : 'justify-start'}">
        <div
          class="max-w-[80%] rounded-lg border p-4 {isForModel
            ? 'border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/20'
            : 'border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/20'} opacity-60"
        >
          <div class="pb-2">
            <div class="flex items-center justify-between">
              <div
                class="text-sm font-medium {isForModel
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-red-700 dark:text-red-400'}"
              >
                {loadingModelName}
              </div>
              <div class="text-xs font-medium opacity-70">
                {isForModel ? 'FOR' : 'AGAINST'}
              </div>
            </div>
          </div>
          <div class="pt-0">
            <div class="flex items-center space-x-2">
              <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              ></div>
              <span class="text-sm opacity-70">Thinking...</span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
