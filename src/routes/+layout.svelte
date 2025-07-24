<script lang="ts">
  import '../app.css';

  import { ModeWatcher } from 'mode-watcher';
  import SunIcon from '@lucide/svelte/icons/sun';
  import MoonIcon from '@lucide/svelte/icons/moon';
  import LogOutIcon from '@lucide/svelte/icons/log-out';
  import { toggleMode } from 'mode-watcher';
  import { Button } from '$lib/components/ui/button/index.js';
  import { signOut } from '$lib/auth/auth-client.js';
  import { invalidateAll } from '$app/navigation';
  import { Toaster } from '$lib/components/ui/sonner/index.js';

  let { children, data } = $props();
</script>

<svelte:head>
  <title>AI Debate Arena</title>
  <meta name="description" content="Make LLMs debate on any topic" />
</svelte:head>

<ModeWatcher defaultMode={'system'} />

<Toaster />

<div class="flex min-h-screen flex-col">
  <header class="flex w-full justify-end p-4">
    <div class="flex items-center gap-2">
      {#if data.user}
        <Button
          onclick={() =>
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  invalidateAll();
                }
              }
            })}
          variant="outline"
        >
          <LogOutIcon class="h-[1.2rem] w-[1.2rem]" />
          Sign out
        </Button>
      {/if}

      <Button
        onclick={toggleMode}
        variant="outline"
        size="icon"
        class="rounded-full"
      >
        <SunIcon
          class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
        />
        <MoonIcon
          class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </div>
  </header>

  {@render children()}

  <footer class="w-full p-2 text-center text-sm text-muted-foreground">
    made by <a
      href="https://x.com/anmhrk"
      target="_blank"
      rel="noopener noreferrer"
      class="text-primary transition-colors duration-200">@anmhrk</a
    >
  </footer>
</div>
