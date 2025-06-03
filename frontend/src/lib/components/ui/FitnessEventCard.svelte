<script lang="ts">
    import { modal, ModalType } from "$lib/shared/modals.svelte";
    import { auth } from "$lib/shared/auth.svelte";
    let { fitnessEvent, editable=false, joinable=true } = $props();

    const isExpired = new Date(fitnessEvent.end_time) < new Date();
    const joined = $derived(fitnessEvent.participants.some((participant: number) => participant == auth.user.id));
    
    function handleEditEvent() {
        if (isExpired) return;

        modal.setModal(ModalType.EDIT_EVENT);
        modal.setPayload(fitnessEvent);
    }
    
    function handleDeleteEvent() {
        if (isExpired) return;

        modal.setModal(ModalType.DELETE_EVENT);
        modal.setPayload(fitnessEvent);
    }

    async function handleJoinEvent() {
        if (isExpired || joined) return;
        
        try {
            const updatedEvent = {
                ...fitnessEvent,
                participants: [...fitnessEvent.participants, auth.user.id]
            };

            const response = await fetch(`/dashboard/fitness-events/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedEvent)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update fitness challenge');
            }

            window.location.href = '/fitness-events';
        } catch (err) {
            console.error(err);
        }
    }
</script>

<div class="w-full rounded-lg bg-white shadow p-4 duration-300 flex flex-col items-start gap-y-2 text-start {isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}">
    <div class="flex justify-between items-start w-full">
        <div class="flex flex-col">
            <div class="flex gap-x-2">
                <span class="text-cyan-500 font-bold text-sm">
                    {fitnessEvent.participants.length} 
                    {#if fitnessEvent.participants.length > 1}
                        Participants
                    {:else}
                        Participant
                    {/if}
                </span>
            </div>
            <h4>{fitnessEvent.title}</h4>
        </div>
        {#if editable}
            <div class="flex items-center gap-x-2">
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button class="p-1.5 text-gray-500 rounded-full {isExpired ? 'cursor-not-allowed' : 'hover:text-blue-600 hover:bg-gray-100'}" 
                        title="{isExpired ? 'Cannot edit expired event' : 'Edit event'}"
                        onclick={handleEditEvent}
                        disabled={isExpired}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button class="p-1.5 text-gray-500 rounded-full {isExpired ? 'cursor-not-allowed' : 'hover:text-red-600 hover:bg-gray-100'}" 
                        title="{isExpired ? 'Cannot delete expired event' : 'Delete event'}"
                        onclick={handleDeleteEvent}
                        disabled={isExpired}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        {:else if joinable}
            <p>{joined ? "Joined" : ""}</p>
        {/if}
    </div>
    <p>
        {fitnessEvent.description}
    </p>
    
    <div class="flex flex-col gap-y-1 w-full">
        {#if joinable}
            <button onclick={handleJoinEvent} class="w-full btn-primary h-8" disabled={isExpired || joined}>Join</button>
        {/if}
        <hr class="my-1"/>
        <div class="flex items-center gap-x-1.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-xs">
                {new Date(fitnessEvent.start_time).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}
                •
                {new Date(fitnessEvent.start_time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})} - 
                {new Date(fitnessEvent.end_time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
            </p>
        </div>
        <div class="flex items-center gap-x-1.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-xs">
                {fitnessEvent.location || 'Virtual'}
            </p>
        </div>
    </div>
</div>