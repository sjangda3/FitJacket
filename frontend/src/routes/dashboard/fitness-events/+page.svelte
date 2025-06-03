<script lang="ts">
    import { FitnessEventCard } from "$lib/components/ui/";
    import { modal, ModalType } from "$lib/shared/modals.svelte.js";

    let { data } = $props();
    
    let myEvents = $derived(data.myEvents.results);
    let participatingEvents = $derived(data.participatingEvents.results);

    function handleCreateFitnessEvent() {
        modal.setModal(ModalType.CREATE_EVENT);
    }
</script>

<div class="flex flex-col gap-y-6">
    <div class="flex justify-between w-full items-center">
        <h2>Fitness Events</h2>
        <button onclick={handleCreateFitnessEvent} class="btn-primary h-8">
            Create an Event
        </button>
    </div>
    <div class="flex flex-col gap-y-3">
        <h4>My Events</h4>

        {#if myEvents && myEvents.length > 0}
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each myEvents as event}
                    <FitnessEventCard editable={true} fitnessEvent={event} joinable={false} />
                {/each}
            </div>
        {:else}
            <p>You haven't created any fitness events yet</p>
        {/if}
    </div>
    <div class="flex flex-col gap-y-3">
        <h4>Participating Events</h4>
        {#if participatingEvents && participatingEvents.length > 0}
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each participatingEvents as event}
                    <FitnessEventCard fitnessEvent={event} joinable={false} />
                {/each}
            </div>
        {:else}
            <p>You aren't apart of any events. Browse fun events <a href="/fitness-events" class="link">here</a></p>
        {/if}
        
    </div>
</div>