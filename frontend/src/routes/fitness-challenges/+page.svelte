<script lang="ts">
    import { FitnessChallengeCard } from "$lib/components/ui/";
    import { auth } from "$lib/shared/auth.svelte";

    let { data } = $props();

    let fitnessChallenges = $derived(data.fitnessChallenges.results);
</script>

<section>
    <div class="page-margins pt-[calc(56px+40px)] pb-10 flex flex-col gap-y-6">
        <h2>Fitness Challenges</h2>
        
        <div class="grid grid-cols-3 gap-4">
            {#if fitnessChallenges && fitnessChallenges.length > 0}
                {#each fitnessChallenges as fitnessChallenge}
                    <FitnessChallengeCard joinable={auth.token && auth.token !== ''} {fitnessChallenge}/>
                {/each}
            {:else}
                <p>There are no active events</p>
            {/if}
        </div>
    </div>
</section>