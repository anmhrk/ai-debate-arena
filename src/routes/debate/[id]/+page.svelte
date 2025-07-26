<script lang="ts">
  import DebateMessages from '$lib/components/debate-messages.svelte';
  import { Button } from '$lib/components/ui/button';
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/state';
  import { writable, derived } from 'svelte/store';

  const debateId = writable(page.params.id);

  $effect(() => {
    debateId.set(page.params.id);
  });

  const debateQuery = createQuery(
    derived(debateId, ($debateId) => ({
      queryKey: ['debate', $debateId],
      queryFn: async () => {
        const response = await fetch(`/api/debate?id=${$debateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch debate');
        }
        const data = await response.json();
        return data.debate;
      }
    }))
  );

  let debate = $derived($debateQuery.data);
  let messages = $derived($debateQuery.data?.messages || []);
  let isLoading = $state(false);
  let loadingModelId = $state('');
  let localRoundStatus = $state('');

  $effect(() => {
    if (!debate) return;

    const currentStatus = debate.round_status;

    if (currentStatus !== localRoundStatus) {
      localRoundStatus = currentStatus;

      if (currentStatus === 'waiting_for_for') {
        sendDebateRequest(debate.forLlmId);
      } else if (currentStatus === 'waiting_for_against') {
        setTimeout(() => sendDebateRequest(debate.againstLlmId), 100);
      }
    }
  });

  const sendDebateRequest = async (modelId: string) => {
    if (!debate || isLoading) return;

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

      // Refetch to update UI and state
      await $debateQuery.refetch();
    } catch (error) {
      console.error('Error sending debate request:', error);
    } finally {
      isLoading = false;
      loadingModelId = '';
    }
  };
</script>

{#if $debateQuery.isPending}
  <div class="flex flex-1 flex-col items-center justify-center p-4">
    <div class="text-lg">Loading debate...</div>
  </div>
{:else if $debateQuery.isError}
  <div class="flex flex-1 flex-col items-center justify-center p-4">
    <div class="text-lg text-red-500">
      Error loading debate: {$debateQuery.error?.message}
    </div>
  </div>
{:else if debate}
  <div class="flex flex-1 flex-col p-4">
    <div class="mx-auto flex w-full max-w-6xl flex-col space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <h1 class="text-2xl font-semibold text-foreground sm:text-3xl">
            {debate.title}
          </h1>
          <span
            class="mt-1 inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary sm:mt-0"
          >
            Round {debate.current_round}
          </span>
        </div>

        {#if debate.round_status === 'waiting_for_user'}
          <Button onclick={() => sendDebateRequest(debate.forLlmId)}>
            Continue
          </Button>
        {/if}
      </div>

      <DebateMessages bind:debate bind:messages {isLoading} {loadingModelId} />
    </div>
  </div>
{/if}
