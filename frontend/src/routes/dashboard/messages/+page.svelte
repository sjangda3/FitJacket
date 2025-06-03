<script lang="ts">
    import { modal, ModalType } from "$lib/shared/modals.svelte";
    import { auth } from "$lib/shared/auth.svelte";

    let { data } = $props();
    let receivedMessages = $state(data.receivedMessages.results);
    let sentMessages = $state(data.sentMessages.results);

    let friends = $state(data.friends.results);
    let friendsList = $derived(friends.map((friend: any) => {
        const currentUserId = auth.user.id;
        
        // Determine which user in the friendship is not the current user
        if (friend.user_id1 === currentUserId) {
            return {
                id: friend.user_id2,
                username: friend.user_id2_details.username,
                email: friend.user_id2_details.email
            };
        } else {
            return {
                id: friend.user_id1,
                username: friend.user_id1_details.username,
                email: friend.user_id1_details.email
            };
        }
    }));

    function handleOpenMessage(message: any, sent: boolean = false) {
        modal.setModal(ModalType.MESSAGE);
        modal.setPayload(message);

        if (!message.viewed && !sent) {
            message.viewed = true;

            try {
                fetch(`/dashboard/messages/`, {
                    method: 'PUT',
                    body: JSON.stringify({ messageId: message.id }),
                })
            } catch (err) {
                console.error(err);
            }
        }
    }

    function handleCreateMessage() {
        modal.setModal(ModalType.CREATE_MESSAGE);
        modal.setPayload(friendsList);
    }
</script>

<div class="flex flex-col gap-y-6">
    <div class="flex justify-between w-full items-center">
        <h2>Messages</h2>
        <button onclick={handleCreateMessage} class="btn-primary h-8">
            Send a Message
        </button>
    </div>

    <div class="flex flex-col gap-y-3">
        <h4>Received</h4>
        {#if receivedMessages && receivedMessages.length > 0}
            <div class="flex flex-col gap-y-4">
                {#each receivedMessages as message}
                    <button onclick={() => handleOpenMessage(message)} class="p-4 {message.viewed ? "bg-neutral-100" : "bg-white shadow"}  rounded flex flex-col gap-y-2 text-start">
                        <div class="flex justify-between w-full items-start">
                            <div class="flex items-center gap-x-2">
                                <div class="flex flex-col">
                                    <h6>{message.senderData.username}</h6>
                                    <p class="text-xs">{message.senderData.email}</p>
                                </div>
                            </div>
                            <p>{new Date(message.created_at).toLocaleString()}</p>
                        </div>
                        <p class="line-clamp-1">{message.text}</p>
                    </button>
                {/each}
            </div>
        {:else}
            <p >You don't have any messages yet.</p>
        {/if}
    </div>

    <div class="flex flex-col gap-y-3">
        <h4>Sent</h4>
        {#if sentMessages && sentMessages.length > 0}
            <div class="flex flex-col gap-y-4">
                {#each sentMessages as message}
                    <button onclick={() => handleOpenMessage(message, true)} class="p-4 bg-white rounded shadow flex flex-col gap-y-2 text-start">
                        <div class="flex justify-between w-full items-start">
                            <div class="flex items-center gap-x-2">
                                <div class="flex flex-col">
                                    <h6>{message.receiverData.username}</h6>
                                    <p class="text-xs">{message.receiverData.email}</p>
                                </div>
                            </div>
                            <p>{new Date(message.created_at).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        </div>
                        <p class="line-clamp-1">{message.text}</p>
                    </button>
                {/each}
            </div>
        {:else}
            <p >You don't have any messages yet.</p>
        {/if}
    </div>
</div>