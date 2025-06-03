<script lang="ts">
    import { modal } from '$lib/shared/modals.svelte';

    let { event } = $props();
    let loading = $state(false);

    async function handleDeleteEvent() {
        loading = true;
        
        try {
            const response = await fetch(`/dashboard/fitness-events/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventId: event.id
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete event');
            }
            
            window.location.href = '/dashboard/fitness-events/';
            modal.close();
        } catch (err) {
            console.error('Error deleting event:', err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="bg-white rounded shadow w-96 p-4">
    <div class="flex flex-col gap-y-3">
        <div class="flex justify-between items-center">
            <h3>Delete Event</h3>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button 
                class="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                onclick={() => modal.close()}
                disabled={loading}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <hr/>
        
        <div class="flex flex-col">
            <p class="text-center">Are you sure you want to delete <span class="font-semibold">"{event.title}"</span>? </p>
            <p class="text-center text-gray-500">This action cannot be undone.</p>
        </div>
        
        <div class="flex justify-center gap-x-3 mt-2">
            <button 
                type="button"
                class="btn-secondary h-8"
                onclick={() => modal.close()}
                disabled={loading}
            >
                Cancel
            </button>
            <button 
                type="button"
                class="btn-red h-8"
                onclick={handleDeleteEvent}
                disabled={loading}
            >
                Delete Event
            </button>
        </div>
    </div>   
</div>