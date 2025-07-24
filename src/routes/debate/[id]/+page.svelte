<script lang="ts">
  import { page } from '$app/stores';

  $: debateId = $page.params.id;
</script>

<div class="flex flex-1 p-4 sm:p-6 lg:p-8">
  <div class="mx-auto w-full max-w-4xl space-y-8">
    <div class="space-y-6 text-center">
      <h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Debate: {debateId}
      </h1>
      <p class="mx-auto max-w-2xl text-lg text-muted-foreground">
        Debate page is under construction
      </p>
    </div>
  </div>
</div>
