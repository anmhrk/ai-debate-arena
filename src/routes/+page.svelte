<script>
  import { signIn } from '$lib/auth-client';
</script>

<button on:click={() => signIn.social({ provider: 'google' })}
  >Sign in with Google</button
>
