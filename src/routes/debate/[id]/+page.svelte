<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import { getModelName } from '$lib/models.js';

  let { data } = $props();

  let debate = $derived(data.debate);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800';
      case 'completed':
        return 'text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700';
      case 'pending':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getMessagesForModel = (modelId: string) => {
    return debate.messages.filter((msg) => msg.modelId === modelId);
  };
</script>

<div class="flex flex-1 p-4 sm:p-6 lg:p-8">
  <div class="mx-auto w-full max-w-6xl space-y-8">
    <div class="space-y-4">
      <h1 class="text-2xl font-semibold text-foreground sm:text-3xl">
        {debate.title}
      </h1>

      <div class="flex items-center gap-4">
        <div
          class={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(debate.status)}`}
        >
          {debate.status.charAt(0).toUpperCase() + debate.status.slice(1)}
        </div>
        <div
          class="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
        >
          Round {debate.round}
        </div>
      </div>
    </div>

    <Separator />

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div class="space-y-4">
        <div class="rounded-lg border border-border bg-card shadow-sm">
          <div class="border-b border-border px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🤖</span>
                <div>
                  <h2 class="text-lg font-medium text-card-foreground">
                    {getModelName(debate.forLlmId)}
                  </h2>
                  <p class="text-sm text-muted-foreground">Supporting</p>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div
              class="min-h-[320px] rounded-md border border-border bg-muted/50 p-4"
            >
              {#if getMessagesForModel(debate.forLlmId).length === 0}
                <div
                  class="flex h-full items-center justify-center text-muted-foreground"
                >
                  <div class="text-center">
                    <div class="mb-2 text-2xl opacity-50">💬</div>
                    <p class="text-sm">No messages yet</p>
                  </div>
                </div>
              {:else}
                <div class="space-y-3">
                  {#each getMessagesForModel(debate.forLlmId) as message}
                    <div class="rounded-md border border-border bg-card p-3">
                      <div class="mb-2 text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                      <p class="text-sm text-card-foreground">
                        {message.content}
                      </p>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <div class="border-t border-border p-4">
            <Button variant="outline" class="w-full">
              Vote for this argument
            </Button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-lg border border-border bg-card shadow-sm">
          <div class="border-b border-border px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🤖</span>
                <div>
                  <h2 class="text-lg font-medium text-card-foreground">
                    {getModelName(debate.againstLlmId)}
                  </h2>
                  <p class="text-sm text-muted-foreground">Opposing</p>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div
              class="min-h-[320px] rounded-md border border-border bg-muted/50 p-4"
            >
              {#if getMessagesForModel(debate.againstLlmId).length === 0}
                <div
                  class="flex h-full items-center justify-center text-muted-foreground"
                >
                  <div class="text-center">
                    <div class="mb-2 text-2xl opacity-50">💬</div>
                    <p class="text-sm">No messages yet</p>
                  </div>
                </div>
              {:else}
                <div class="space-y-3">
                  {#each getMessagesForModel(debate.againstLlmId) as message}
                    <div class="rounded-md border border-border bg-card p-3">
                      <div class="mb-2 text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                      <p class="text-sm text-card-foreground">
                        {message.content}
                      </p>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <div class="border-t border-border p-4">
            <Button variant="outline" class="w-full">
              Vote for this argument
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
