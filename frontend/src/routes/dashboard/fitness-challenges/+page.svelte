<script lang="ts">
    import { FitnessChallengeCard } from "$lib/components/ui/";
    import { modal } from "$lib/shared/modals.svelte";
    import { ModalType } from "$lib/shared/modals.svelte";

    let { data } = $props();
    
    let myChallenges = $state(data.myChallenges.results);
    let participatingChallenges = $state(data.participatingChallenges.results);
    let userWorkouts = $state(data.userWorkouts.results);

    let completedWorkouts = $derived(userWorkouts.map((workout: any) => {
        return workout.workout_details;
    }))

    function handleCreateFitnessChallenge() {
        modal.setModal(ModalType.CREATE_CHALLENGE);
        modal.setPayload(completedWorkouts);
    }
</script>

<div class="flex flex-col gap-y-6">
    <div class="flex justify-between w-full items-center">
        <h2>Fitness Challenges</h2>
        <button onclick={handleCreateFitnessChallenge} class="btn-primary h-8">
            Create a Challenge
        </button>
    </div>
    <div class="flex flex-col gap-y-3">
        <h4>My Challenges</h4>
        {#if myChallenges && myChallenges.length > 0}
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each myChallenges as challenge}
                    <FitnessChallengeCard editable={true} {completedWorkouts} fitnessChallenge={challenge} joinable={false} />
                {/each}
            </div>
        {:else}
            <p>You haven't created any fitness challenges yet</p>
        {/if}
    </div>
    <div class="flex flex-col gap-y-3">
        <h4>Participating Challenges</h4>
        {#if participatingChallenges && participatingChallenges.length > 0}
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each participatingChallenges as challenge}
                    <FitnessChallengeCard fitnessChallenge={challenge} joinable={false} />
                {/each}
            </div>
        {:else}
            <p>You aren't apart of any challenges. Browse fun challenges <a href="/fitness-challenges" class="link">here</a></p>
        {/if}
        
    </div>
</div>