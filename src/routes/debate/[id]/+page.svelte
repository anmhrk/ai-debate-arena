<script lang="ts">
  import DebateMessages from '$lib/components/debate-messages.svelte';
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
      <h1 class="text-2xl font-semibold text-foreground sm:text-3xl">
        {debate.title}
      </h1>

      <DebateMessages bind:debate bind:messages />
    </div>
  </div>
{/if}
