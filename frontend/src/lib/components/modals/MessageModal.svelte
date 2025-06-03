<script lang="ts">
    import { modal } from '$lib/shared/modals.svelte';
    let { message } = $props();
</script>

<div class="bg-white rounded shadow w-[740px] p-4 h-2/3">
    <div class="flex flex-col gap-y-3">
        <div class="flex justify-between items-center">
            <h3>Message</h3>
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
        <div class="flex items-center gap-x-3">
            <div class="flex justify-between items-start w-full">
                <div class="flex items-center gap-x-2">
                    <div class="flex flex-col">
                        <div class="flex items-end gap-x-1">
                            <h6>{message.senderData.username}</h6>
                            <p class="text-xs">({message.senderData.email})</p>
                        </div>
                        <div class="flex items-end gap-x-2">
                            To: 
                            <div class="flex items-end gap-x-1">
                                <h6>{message.receiverData.username}</h6>
                                <p class="text-xs">({message.receiverData.email})</p>
                            </div>
                        </div>
                    </div>
                </div>
                <p>{new Date(message.created_at).toLocaleString()}</p>
            </div>
        </div>
        <hr/>
        <p class="text-base">{message.text}</p>
    </div>   
</div>