<script lang="ts">
    import { heroImage } from "$lib/assets";

    let { data } = $props();
    let announcement = $derived(data.announcements.results[data.announcements.results.length - 1]);
</script>

<section>
    {#if announcement.text !== ""}
        <div class="pt-[calc(56px+8px)] pb-2 w-full flex bg-cyan-800 items-center justify-center">
            <p class="text-white text-base">{announcement.text}</p>
        </div>
    {/if}
    <div class="h-[100vh] page-margins ">
        <div class="h-full w-full items-center justify-between z-10 flex gap-x-8">
            <div class="flex flex-col gap-y-8 w-1/2 items-start">
                <div class="flex flex-col gap-y-4">
                    <h1>Be the Best You With <span class="text-cyan-300">FitJacket</span></h1>
                    <p class="text-[15px] pr-[20%]">Your personal fitness journey starts here and now. FitJacket is an all-in-one fitness solution aimed to keep you motivated with a wide range of features from ways to track and visualize your progress to a built-in social media platform for you to connect with like-minded fitness enthusiasts. </p>
                </div>
                <div class="flex items-center gap-x-4 justify-center z-50">
                    <a href="/signup" class="btn-primary h-10 text-base px-4">
                        Get Started Free
                    </a>
                    <a href="/features" class="btn-secondary h-10 text-base px-4">
                        Learn More
                    </a>
                </div>
            </div>
            <div class="h-2/3 w-1/2 bg-black -z-10 relative rounded-xl overflow-hidden">
                <div class="absolute inset-0 bg-black/50 -z-10"></div>
                <img class="-z-20 object-cover h-full w-full absolute" src={heroImage} alt="hero"/>
            </div>
            
        </div>
    </div>

</section>
