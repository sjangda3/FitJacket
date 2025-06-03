<script lang="ts">
	import { invalidate, invalidateAll } from "$app/navigation";
    import { auth } from "$lib/shared/auth.svelte";
    import { goto } from "$app/navigation";

    let { data } = $props();
    let friends = $state(data.friends.results);
    let friendRequests = $state(data.friendRequests.results);

    async function handleFriendRequest(action: string, requestId: string) {
        try {
            await fetch('/dashboard/friends', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    friendRequestId: requestId,
                    action: action
                })
            })
        } catch (err) {
            console.error(err);
        } finally {
            window.location.href = `/dashboard/friends/`;
        }
    }

    async function handleUnfriend(friendId: string) {
        try {
            await fetch('/dashboard/friends', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    friendId: friendId
                })
            })
        } catch (err) {
            console.error(err);
        } finally {
            window.location.href = `/dashboard/friends/`;
        }
    }
</script>

<div class="flex flex-col gap-y-6 h-full">
    <h2>Friends</h2>

    <div class="flex w-full justify-between gap-6 h-full">
        <div class="p-4 bg-white shadow rounded w-2/3 overflow-y-auto">
            <div class="w-full flex flex-col h-full">
                {#if friends.length > 0}
                    {#each friends as friend}
                        <div class="flex w-full items-center">
                            <div class="flex justify-between w-full items-center">
                                <div class="flex flex-col">
                                    <h6>{friend.user_id1 != auth.user.id ? friend.user_id1_details.username : friend.user_id2_details.username}</h6>
                                    <p class="text-xs">{friend.user_id1 != auth.user.id ? friend.user_id1_details.email : friend.user_id2_details.email}</p>
                                </div>
                                <div class="flex gap-x-3">
                                    <a href="/profile/{friend.user_id1 != auth.user.id ? friend.user_id1_details.id : friend.user_id2_details.id}" class="btn-primary h-8">
                                        View Profile
                                    </a>
                                    <button onclick={() => handleUnfriend(friend.id)} class="btn-red h-8">
                                        Unfriend
                                    </button>
                                </div>
                            </div>
                        </div>
                        <hr class="my-4"/>                            
                    {/each}
                {:else}
                    <p>You don't have any friends</p>
                {/if}
            </div>
        </div>
        <div class="h-full flex flex-col gap-6 w-1/3">
            <div class="p-4 bg-white shadow rounded w-full overflow-y-auto h-full">
                <div class="flex flex-col gap-y-3">
                    <h4>Friend Requests</h4>
                    
                    {#if friendRequests && friendRequests.length > 0}
                        <hr />
                        {#each friendRequests as request}
                            <div class="flex justify-between items-center py-2">
                                <div class="flex items-center gap-x-2">
                                    <div class="flex flex-col">
                                        <h6>{request.sender_details.username}</h6>
                                        <p class="text-xs">{request.sender_details.email}</p>
                                    </div>
                                </div>
                                <div class="flex gap-x-2">
                                    <button onclick={() => handleFriendRequest("accept", request.id)} class="btn-primary h-8">Accept</button>
                                    <button onclick={() => handleFriendRequest("decline", request.id)}  class="btn-secondary h-8">Decline</button>
                                </div>
                            </div>
                            <hr />
                        {/each}
                    {:else}
                        <p>No pending friend requests</p>
                    {/if}
                </div>
            </div>
            <!-- <div class="py-4 px-6 bg-white shadow rounded w-full overflow-y-scroll h-1/2">
                <div class="flex flex-col gap-y-3">
                    <h4></h4>
                </div>
            </div> -->
        </div>
    </div>
</div>