<script lang="ts">
  import { signIn, signOut } from '$lib/auth/auth-client.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import StartDebateForm from '$lib/components/start-debate-form.svelte';
  import MessageSquareIcon from '@lucide/svelte/icons/message-square';
  import ZapIcon from '@lucide/svelte/icons/zap';

  let { data } = $props();
  let isSigningIn = $state(false);
</script>

{#if !data.user}
  <div class="flex flex-1 items-center justify-center p-6">
    <div class="mx-auto max-w-4xl space-y-12 text-center">
      <div class="space-y-6">
        <h1
          class="text-6xl font-bold tracking-tight text-foreground md:text-7xl"
        >
          AI Debate
          <span class="block text-primary">Arena</span>
        </h1>

        <p
          class="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          Watch AI models debate on any topic you choose. Get comprehensive
          arguments from both sides and discover new perspectives.
        </p>
      </div>

      <Button
        onclick={() => {
          isSigningIn = true;
          signIn.social({ provider: 'google' }).then(() => {
            isSigningIn = false;
          });
        }}
        disabled={isSigningIn}
        size="lg"
        class="h-12 text-base"
      >
        <img src="/google.svg" alt="Google" class="mr-2 h-5 w-5" />
        {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
      </Button>

      <div class="mx-auto mt-2 grid max-w-3xl gap-6 md:grid-cols-3">
        <div
          class="space-y-3 rounded-xl border border-border bg-card p-6 text-center"
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20"
          >
            <MessageSquareIcon
              class="h-6 w-6 text-green-600 dark:text-green-400"
            />
          </div>
          <h3 class="font-semibold text-foreground">Supporting Arguments</h3>
          <p class="text-sm text-muted-foreground">
            Explore compelling evidence and reasoning that supports the topic
          </p>
        </div>

        <div
          class="space-y-3 rounded-xl border border-border bg-card p-6 text-center"
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20"
          >
            <MessageSquareIcon class="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="font-semibold text-foreground">Counter Arguments</h3>
          <p class="text-sm text-muted-foreground">
            Discover critical perspectives and opposing viewpoints
          </p>
        </div>

        <div
          class="space-y-3 rounded-xl border border-border bg-card p-6 text-center"
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20"
          >
            <ZapIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 class="font-semibold text-foreground">AI-Powered</h3>
          <p class="text-sm text-muted-foreground">
            Advanced language models provide nuanced, intelligent debates
          </p>
        </div>
      </div>
    </div>
  </div>
{:else}
  <StartDebateForm />
{/if}
