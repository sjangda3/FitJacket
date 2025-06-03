<script lang="ts">
    import { modal } from '$lib/shared/modals.svelte';
    import { auth } from '$lib/shared/auth.svelte';

    let name = $state('');
    let description = $state('');
    let type = $state('');
    let startTime = $state('');
    let endTime = $state('');
    let loading = $state(false);

    async function handleCreateWorkout(e: Event) {
        e.preventDefault();
        loading = true;

        try {
            const response = await fetch('/dashboard/workouts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    type: type,
                    start_time: startTime,
                    end_time: endTime,
                    user: auth.user.id
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create workout');
            }

            window.location.href = '/dashboard/';
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
            <h3>Create Workout</h3>
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
        <form class="flex flex-col gap-y-3" onsubmit={handleCreateWorkout}>
            <div class="flex flex-col gap-y-1">
                <label for="name" class="text-sm">Name</label>
                <input class="input h-9"
                    type="text" 
                    id="name" 
                    bind:value={name} 
                    required 
                    disabled={loading}
                    placeholder="Workout name"
                />
            </div>

            <div class="flex flex-col gap-y-1">
                <label for="type" class="text-sm">Type</label>
                <select class="input h-9"
                    id="type" 
                    bind:value={type}
                    required
                    disabled={loading}
                >
                    <option value="" disabled selected>Select workout type</option>
                    <option value="cardio">Cardio</option>
                    <option value="muscle">Muscle</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="strength">Strength</option>
                    <option value="functional">Functional</option>
                    <option value="circuit">Circuit</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div class="flex flex-col gap-y-1">
                <label for="description" class="text-sm">Description</label>
                <textarea class="input h-24 resize-none"
                    id="description" 
                    bind:value={description} 
                    required 
                    disabled={loading}
                    placeholder="Describe your workout"
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
                    disabled={loading || !name || !type || !description || !startTime || !endTime || startTime >= endTime}
                >
                    Create Workout
                </button>
            </div>
        </form>
    </div>   
</div>