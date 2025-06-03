<script lang="ts">
    import { modal } from '$lib/shared/modals.svelte';
    import { auth } from '$lib/shared/auth.svelte';

    let { challenge, completedWorkouts } = $props();

    console.log(challenge);

    function formatDateForInput(dateString: string) {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }

    let title = $state(challenge.title);
    let description = $state(challenge.description);
    let startTime = $state(formatDateForInput(challenge.start_time));
    let endTime = $state(formatDateForInput(challenge.end_time));
    let workouts = $state(challenge.workouts || []);
    let loading = $state(false);

    async function handleUpdateFitnessChallenge() {
        loading = true;

        try {
            const response = await fetch(`/dashboard/fitness-challenges/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: challenge.id,
                    title: title,
                    description: description,
                    start_time: startTime,
                    end_time: endTime,
                    user: auth.user.id,
                    participants: challenge.participants,
                    completed_by: challenge.completed_by,
                    workouts: workouts
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update fitness challenge');
            }

            window.location.href = '/dashboard/fitness-challenges/';
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
            <h3>Edit Fitness Challenge</h3>
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
        <form class="flex flex-col gap-y-3" onsubmit={handleUpdateFitnessChallenge}>
            <div class="flex flex-col gap-y-1">
                <label for="title" class="text-sm">Title</label>
                <input class="input h-9"
                    type="text" 
                    id="title" 
                    bind:value={title} 
                    required 
                    disabled={loading}
                    placeholder="Challenge title"
                />
            </div>

            <div class="flex flex-col gap-y-1">
                <label for="description" class="text-sm">Description</label>
                <textarea class="input h-24 resize-none"
                    id="description" 
                    bind:value={description} 
                    required 
                    disabled={loading}
                    placeholder="Describe your challenge"
                ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-x-4">
                <div class="flex flex-col gap-y-1">
                    <label for="startTime" class="text-sm">Start Time</label>
                    <input class="input h-9"
                        type="datetime-local" 
                        id="startTime" 
                        bind:value={startTime} 
                        required 
                        disabled={loading}
                    />
                </div>
                
                <div class="flex flex-col gap-y-1">
                    <label for="endTime" class="text-sm">End Time</label>
                    <input class="input h-9"
                        type="datetime-local" 
                        id="endTime" 
                        bind:value={endTime} 
                        required 
                        disabled={loading}
                    />
                </div>
            </div>

            <div class="flex flex-col gap-y-1">
                <label for="workouts" class="text-sm">Workouts</label>
                <select class="input h-34"
                    id="workouts" 
                    bind:value={workouts} 
                    multiple
                    disabled={loading}
                >
                    <option value="" disabled>Select workouts</option>
                    {#if completedWorkouts && completedWorkouts.length > 0}
                        {#each completedWorkouts as workout}
                            <option value={workout.id}>{workout.name}</option>
                        {/each}
                    {:else}
                        <option value="" disabled>No completed workouts available</option>
                    {/if}
                </select>
                <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple workouts</p>
            </div>
            
            <div class="flex justify-end gap-x-3 mt-2">
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
                    disabled={loading || !title || !description || !startTime || !endTime || workouts.length == 0 || startTime >= endTime} 
                >
                    Update Challenge
                </button>
            </div>
        </form>
    </div>   
</div>