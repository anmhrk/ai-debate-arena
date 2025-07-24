<script lang="ts">
  let { data } = $props();

  let debate = $derived(data.debate);
</script>

<div class="flex flex-1 p-4 sm:p-6 lg:p-8">
  <div class="mx-auto w-full max-w-4xl space-y-8">
    <div class="space-y-6 text-center">
      <h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Debate: {debate.prompt}
      </h1>
      <p class="mx-auto max-w-2xl text-lg text-muted-foreground">
        Status: {debate.status} • Round: {debate.round}
      </p>
      <p class="text-sm text-muted-foreground">
        Debate ID: {debate.id}
      </p>
    </div>

    <div class="space-y-4">
      <h2 class="text-2xl font-semibold">
        Messages ({debate.messages.length})
      </h2>
      {#if debate.messages.length === 0}
        <p class="text-muted-foreground">
          No messages yet. The debate hasn't started.
        </p>
      {:else}
        <div class="space-y-4">
          {#each debate.messages as message}
            <div class="rounded-lg border p-4">
              <div class="mb-2 text-sm text-muted-foreground">
                Model: {message.modelId} • {new Date(
                  message.createdAt
                ).toLocaleString()}
              </div>
              <p class="text-foreground">{message.content}</p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
