<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Chat } from '@ai-sdk/svelte';
  import { onMount } from 'svelte';

  let { data } = $props();
  let debate = $derived(data.debate);

  let inputValue = $state('');
  const chat = new Chat({
    // messages: debate.messages
  });

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    chat.sendMessage({ text: inputValue });
    inputValue = '';
  }
</script>

<div class="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
  <div class="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-foreground sm:text-3xl">
        {debate.title}
      </h1>
      <div
        class="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
      >
        Round {debate.round}
      </div>
    </div>

    <Card.Root class="flex flex-1 flex-col">
      <Card.Header>
        <Card.Title class="sr-only">
          {debate.title}
        </Card.Title>
      </Card.Header>
      <Card.Content class="flex-1 p-6">
        <ScrollArea class="h-full"></ScrollArea>
      </Card.Content>
      <Card.Footer class="border-t border-border">
        <Input
          bind:value={inputValue}
          type="text"
          placeholder="Type your message..."
          class="w-full !text-sm"
        />
      </Card.Footer>
    </Card.Root>
  </div>
</div>
