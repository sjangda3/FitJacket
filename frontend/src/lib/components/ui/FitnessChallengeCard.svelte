<script lang="ts">
    import { modal, ModalType } from '$lib/shared/modals.svelte';
    import { auth } from '$lib/shared/auth.svelte';
    let { fitnessChallenge, completedWorkouts=null, editable=false, joinable=true } = $props();
    
    const isExpired = new Date(fitnessChallenge.end_time) < new Date();
    const joined = $derived(fitnessChallenge.participants.some((participant: number) => participant == auth.user.id));
    const completed = $derived(fitnessChallenge.completed_by.some((participant: number) => participant === auth.user.id));
    
    function handleEditChallenge() {
        if (isExpired) return;

        modal.setModal(ModalType.EDIT_CHALLENGE);
        modal.setPayload({challenge: {...fitnessChallenge}, completedWorkouts});
    }
    
    function handleDeleteChallenge() {
        if (isExpired) return;

        modal.setModal(ModalType.DELETE_CHALLENGE);
        modal.setPayload(fitnessChallenge);
    }

    function duration(start: string, end: string): string {
        const startTime = new Date(start);
        const endTime = new Date(end);
        const durationMs = endTime.getTime() - startTime.getTime();
        const minutes = Math.ceil(durationMs / 60000);
        
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 ? 
                `${hours}h ${remainingMinutes}m` : 
                `${hours}h`;
        }
    }

    async function handleJoinChallenge() {
        if (isExpired || joined) return;
        
        try {
            const updatedChallenge = {
                ...fitnessChallenge,
                participants: [...fitnessChallenge.participants, auth.user.id]
            };
            
            const response = await fetch(`/dashboard/fitness-challenges/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedChallenge)
            });
            
            if (!response.ok) {
                throw new Error('Failed to join challenge');
            }
            
            window.location.href = '/fitness-challenges';
        } catch (err) {
            console.error(err);
        }
    }

    async function handleCompleteChallenge() {
        if (isExpired || !joined || completed) return;
        
        try {
            const updatedChallenge = {
                ...fitnessChallenge,
                completed_by: [...fitnessChallenge.completed_by, auth.user.id]
            };
            
            const response = await fetch(`/dashboard/fitness-challenges/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedChallenge)
            });
            
            if (!response.ok) {
                throw new Error('Failed to complete challenge');
            }
            
            window.location.href = '/fitness-challenges';
        } catch (err) {
            console.error(err);
        }
    }
</script>

<div class="w-full rounded-lg bg-white shadow p-4 duration-300 flex flex-col items-start gap-y-2 text-start {isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'} justify-between">
    <div class="w-full">
        <div class="flex justify-between items-start">
            <div class="flex flex-col">
                <div class="flex gap-x-2">
                    <span class="text-cyan-500 font-bold text-sm">
                        {fitnessChallenge.participants.length} 
                        {#if fitnessChallenge.participants.length > 1}
                            Participants
                        {:else}
                            Participant
                        {/if}
                    </span>
                </div>
                <h4>{fitnessChallenge.title}</h4>
            </div>
            {#if editable}
                <div class="flex items-center gap-x-2">
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button class="p-1.5 text-gray-500 rounded-full {isExpired ? 'cursor-not-allowed' : 'hover:text-blue-600 hover:bg-gray-100'}" 
                            title="{isExpired ? 'Cannot edit expired event' : 'Edit event'}"
                            onclick={handleEditChallenge}
                            disabled={isExpired}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button class="p-1.5 text-gray-500 rounded-full {isExpired ? 'cursor-not-allowed' : 'hover:text-red-600 hover:bg-gray-100'}" 
                            title="{isExpired ? 'Cannot delete expired event' : 'Delete event'}"
                            onclick={handleDeleteChallenge}
                            disabled={isExpired}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            {:else if joinable}
                <p>{joined ? completed ? "Joined and Completed" : "Joined" : ""}</p>
            {/if}
        </div>
        <p>
            {fitnessChallenge.description}
        </p>
        {#if fitnessChallenge.workouts.length > 0}
            <div class="flex flex-col w-full">
                <span class="font-medium text-sm">Workouts</span>
                <p class="text-xs">
                    {#each fitnessChallenge.workout_details as workout, i}
                        {workout.name} ({duration(workout.start_time, workout.end_time)})
                        {#if i < fitnessChallenge.workout_details.length - 1}|{/if}
                        {' '}
                    {/each}
                </p>
            </div>
        {/if}
    </div>
    <div class="flex flex-col gap-y-1 w-full">
        {#if joinable}
            <div class="flex justify-between w-full gap-x-3">
                <button onclick={handleJoinChallenge} class="w-1/2 btn-primary h-8" disabled={isExpired || joined}>Join</button>
                <button onclick={handleCompleteChallenge} class="w-1/2 btn-secondary h-8" disabled={isExpired || !joined || completed}>Complete</button>
            </div>
        {/if}
        <hr class="my-1"/>

        <div class="flex items-center gap-x-1.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-xs">
                {new Date(fitnessChallenge.start_time).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}
                •
                {new Date(fitnessChallenge.start_time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})} - 
                {new Date(fitnessChallenge.end_time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
            </p>
        </div>
        <div class="flex items-center gap-x-1.5 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.5 6.5h3v11h-3z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.5 6.5h3v11h-3z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.5 12h5" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.5 9.5v5" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.5 9.5v5" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.5 12h3" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.5 12h3" />
            </svg>
            <p class="text-xs">

                {fitnessChallenge.workouts ? fitnessChallenge.workouts.length : 0} 
                {fitnessChallenge.workouts && fitnessChallenge.workouts.length === 1 ? 'workout' : 'workouts'}
            </p>
        </div>
    </div>
</div>