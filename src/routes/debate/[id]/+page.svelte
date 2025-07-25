<script lang="ts">
  import DebateMessages from '$lib/components/debate-messages.svelte';

  let { data } = $props();
  let debate = $state(data.debate);
  let messages = $state(data.debate.messages || []);
</script>

<div class="flex flex-1 flex-col p-4">
  <div class="mx-auto flex w-full max-w-6xl flex-col space-y-6">
    <h1 class="text-2xl font-semibold text-foreground sm:text-3xl">
      {debate.title}
    </h1>

    <DebateMessages bind:debate bind:messages />
  </div>
</div>
