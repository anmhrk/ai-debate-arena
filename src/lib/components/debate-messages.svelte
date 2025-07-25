<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { getModelName } from '$lib/models.js';
  import { onMount, tick } from 'svelte';

  let { debate = $bindable(), messages = $bindable([]) } = $props();

  let isLoading = $state(false);
  let loadingModelId = $state('');
  let inputValue = $state('');
  let messagesContainer: HTMLDivElement | undefined;

  const scrollToBottom = async () => {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const sendDebateRequest = async (modelId: string) => {
    if (isLoading) return;

    isLoading = true;
    loadingModelId = modelId;

    try {
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          debateId: debate.id,
          modelId: modelId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add the new message to local state
      const newMessage = {
        id: `${modelId === debate.forLlmId ? 'for' : 'against'}_${Date.now()}`,
        content: data.content,
        modelId: modelId,
        createdAt: new Date().toISOString(),
        debateId: debate.id
      };

      messages = [...messages, newMessage];
      scrollToBottom();

      // Update local debate status based on which model responded
      if (modelId === debate.forLlmId) {
        debate.round_status = 'waiting_for_against';
        // Auto-send against response
        setTimeout(() => sendDebateRequest(debate.againstLlmId), 100);
      } else if (modelId === debate.againstLlmId) {
        debate.round_status = 'waiting_for_user';
      }
    } catch (error) {
      console.error('Error sending debate request:', error);
    } finally {
      isLoading = false;
      loadingModelId = '';
    }
  };

  const sendUserMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userContent = inputValue.trim();
    inputValue = '';

    try {
      // Save user message to database first
      const response = await fetch('/api/debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          debateId: debate.id,
          modelId: 'user',
          content: userContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save user message');
      }

      // Add user message to local state
      const userMessage = {
        id: `user_${Date.now()}`,
        content: userContent,
        modelId: 'user',
        createdAt: new Date().toISOString(),
        debateId: debate.id
      };

      messages = [...messages, userMessage];
      scrollToBottom();

      // Update local debate status and start next round with FOR model
      debate.round_status = 'waiting_for_for';
      await sendDebateRequest(debate.forLlmId);
    } catch (error) {
      console.error('Error sending user message:', error);
      // Restore input value on error
      inputValue = userContent;
    }
  };

  const skipRound = async () => {
    if (isLoading || debate.round_status !== 'waiting_for_user') return;

    // Skip user input and start next round with FOR model
    await sendDebateRequest(debate.forLlmId);
  };

  const initializeDebate = async () => {
    // Use the database status instead of calculating it
    const currentStatus = debate.round_status;

    // Only auto-start if we're waiting for a model and not currently loading
    if (currentStatus === 'waiting_for_for' && !isLoading) {
      await sendDebateRequest(debate.forLlmId);
    } else if (currentStatus === 'waiting_for_against' && !isLoading) {
      await sendDebateRequest(debate.againstLlmId);
    }
  };

  onMount(() => {
    initializeDebate();
    scrollToBottom();
  });

  const getMessageStyle = (message: any) => {
    const isForMessage = message.modelId === debate.forLlmId;
    const isAgainstMessage = message.modelId === debate.againstLlmId;
    const isUserMessage = message.modelId === 'user';
    const modelName = isUserMessage ? 'You' : getModelName(message.modelId);

    let containerClass = 'flex ';
    let messageClass = 'max-w-[80%] rounded-lg border p-4 ';
    let nameClass = 'text-sm font-medium ';

    if (isUserMessage) {
      containerClass += 'justify-center';
      messageClass +=
        'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/50';
      nameClass += 'text-green-700 dark:text-green-400';
    } else if (isForMessage) {
      containerClass += 'justify-end';
      messageClass +=
        'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/50';
      nameClass += 'text-blue-700 dark:text-blue-400';
    } else {
      containerClass += 'justify-start';
      messageClass +=
        'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/50';
      nameClass += 'text-red-700 dark:text-red-400';
    }

    return {
      containerClass,
      messageClass,
      nameClass,
      modelName,
      isUserMessage,
      isForMessage,
      side: isForMessage ? 'FOR' : isAgainstMessage ? 'AGAINST' : null
    };
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendUserMessage();
    }
  };
</script>

<div
  class="flex h-[calc(100vh-12rem)] flex-col rounded-lg border border-border"
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
            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/50'
            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/50'} opacity-60"
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
  <div
    class="flex flex-shrink-0 justify-between gap-2 border-t border-border p-4"
  >
    <Input
      bind:value={inputValue}
      type="text"
      placeholder="Type your message..."
      class="flex-1 !text-sm"
      onkeydown={handleKeydown}
      disabled={isLoading}
    />
    <Button
      variant="outline"
      onclick={skipRound}
      disabled={isLoading || debate.round_status !== 'waiting_for_user'}
    >
      Skip
    </Button>
  </div>
</div>
