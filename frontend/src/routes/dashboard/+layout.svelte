<script lang="ts">
    import { auth } from "$lib/shared/auth.svelte";
	import { Sidebar } from "$lib/components/ui/";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

    onMount(() => {
        if (auth.token == null || auth.token === '') {
            goto("/login");
        }
    });
    
    let { children } = $props();
</script>

<section>
    <div class="h-[100vh] flex w-full">
        <Sidebar username={auth.user.username} email={auth.user.email}/>
        <div class="h-[calc(100vh-56px)] pt-[calc(56px+24px)] pb-6 px-6 w-[calc(100%-256px)]">
            {@render children()}
        </div>
    </div>
</section>