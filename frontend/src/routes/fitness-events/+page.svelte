<script lang="ts">
    import { auth } from "$lib/shared/auth.svelte";
    import { FitnessEventCard } from "$lib/components/ui/";
    let { data } = $props();

    let fitnessEvents = $derived(data.fitnessEvents.results);
</script>

<section>
    <div class="page-margins pt-[calc(56px+40px)] pb-10 flex flex-col gap-y-6">
        <h2>Fitness Events</h2>
        
        <div class="grid grid-cols-3 gap-4">
            {#if fitnessEvents && fitnessEvents.length > 0}
                {#each fitnessEvents as fitnessEvent}
                    <FitnessEventCard joinable={auth.token && auth.token !== ''} {fitnessEvent}/>
                {/each}
            {:else}
                <p>There are no active events</p>
            {/if}
        </div>
    </div>
</section>