<script lang="ts">
    import { auth } from "$lib/shared/auth.svelte";

    function handleLogout() {
        auth.clearAuth();
    }
</script>

<nav class="w-full fixed h-[56px] bg-white z-40">
    <div class="h-full w-full flex items-center justify-between nav-margins border-b border-neutral-200">
        <a href="/" class="font-bold text-xl text-neutral-700 duration-300 hover:text-cyan-300 rounded">
            FitJacket
        </a>
        <div class="flex items-center gap-x-4 h-full">
            <div class="flex items-center gap-x-3">
                <a href="/fitness-challenges" class="nav-link">Fitness Challenges</a>
                <a href="/fitness-events" class="nav-link">Fitness Events</a>
            </div>
            <div class="h-8 w-[1px] bg-neutral-200"></div>
            {#if auth.token === ''}
                <div class="flex items-center gap-x-3">
                    <a href="/login" class="btn-primary h-8">Login</a>
                    <a href="/sign-up" class="btn-secondary h-8">Sign Up</a>
                </div>
            {:else}
                <div class="flex items-center gap-x-3">
                    <a href="/dashboard" class="nav-link">{auth.user.username}</a>
                    <button class="btn-red h-8" onclick={handleLogout}>Logout</button>
                </div>
            {/if}
            
        </div>
    </div>
</nav>