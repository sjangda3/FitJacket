<script lang="ts">
    import { modal } from '$lib/shared/modals.svelte';
    import { auth } from '$lib/shared/auth.svelte';

    let receiverId = $state('');
    let text = $state('');
    let loading = $state(false);

    let { friends } = $props();

    async function handleCreateMessage(e: Event) {
        e.preventDefault();
        loading = true;

        try {
            const response = await fetch('/dashboard/messages/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    receiverId: parseInt(receiverId),
                    text: text
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            window.location.href = '/dashboard/messages/';
            modal.close();
        } catch (err) {
            console.error(err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="bg-white rounded shadow w-[800px] p-4">
    <div class="flex flex-col gap-y-3">
        <div class="flex justify-between items-center">
            <h3>New Message</h3>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button 
                class="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                onclick={() => modal.close()}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <hr/>
        <form class="flex flex-col gap-y-3" onsubmit={handleCreateMessage}>
            <div class="flex flex-col gap-y-1">
                <label for="receiverId" class="text-sm">To</label>
                <select 
                    class="input h-9"
                    id="receiverId" 
                    bind:value={receiverId} 
                    required 
                    disabled={loading}
                >
                    <option value="" disabled selected>Select a friend</option>
                    {#if friends && friends.length > 0}
                        {#each friends as friend}
                            <option value={friend.id}>{friend.username}</option>
                        {/each}
                    {:else}
                        <option value="" disabled>No friends available</option>
                    {/if}
                </select>
            </div>

            <div class="flex flex-col gap-y-1">
                <label for="text" class="text-sm">Message</label>
                <textarea class="input h-32 resize-none"
                    id="text" 
                    bind:value={text} 
                    required 
                    disabled={loading}
                    placeholder="Type your message here"
                ></textarea>
            </div>
            
            <div class="flex justify-end gap-x-3 mt-4">
                <button 
                    type="button"
                    class="btn-secondary h-8"
                    onclick={() => modal.close()}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    class="btn-primary h-8"
                    disabled={loading || !receiverId || !text}
                >
                    Send Message
                </button>
            </div>
        </form>
    </div>   
</div>