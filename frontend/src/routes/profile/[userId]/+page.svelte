<script lang="ts">
    import { auth } from "$lib/shared/auth.svelte";
    import { onMount } from 'svelte';
    import * as echarts from 'echarts';
    
    let { data } = $props();

    let userDetails = $derived(data.userDetails);
    let incompleteWorkouts = $derived(data.availableWorkouts);
    let completedWorkouts = $derived(data.userWorkouts.results);
    let isFriend = $derived(data.isFriend);
    let hasPendingRequest = $derived(data.hasPendingRequest);
    let isSelf = $derived(data.isSelf);

    console.log(isFriend);

    let isPrivate = $derived(userDetails?.profile?.is_private || false);
    
    // Chart DOM elements
    let lineChartEl: HTMLElement;
    let pieChartEl: HTMLElement;
    let calendarChartEl: HTMLElement;
    
    // Chart instances
    let lineChart: echarts.ECharts;
    let pieChart: echarts.ECharts;
    let calendarChart: echarts.ECharts;

    async function handleUnfriend() {
        try {
            await fetch('/dashboard/friends', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    friendId: userDetails.id
                })
            })
        } catch (err) {
            console.error(err);
        } finally {
            window.location.reload();
        }
    }

    async function handleSendRequest() {
        try {
            await fetch(`/profile/${userDetails.id}`, {
                method: 'POST',
            });

        } catch (err) {
            console.error(err);
        } finally {
            window.location.reload();
        }
    }
    
    function prepareChartData() {
        const dailyCounts: any = {};
        const now = new Date();
        const last30Days = new Date(now.setDate(now.getDate() - 30));
        
        for (let d = new Date(last30Days); d <= new Date(); d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            dailyCounts[dateStr] = 0;
        }
        
        completedWorkouts?.forEach((workout: any) => {
            const date = new Date(workout.completed_at || workout.workout_details.created_at);
            const dateStr = date.toISOString().split('T')[0];
            if (dateStr in dailyCounts) {
                dailyCounts[dateStr]++;
            }
        });
        
        const typeCounts: any = {};
        completedWorkouts?.forEach((workout: any) => {
            const type = workout.workout_details.type;
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        const calendarData: any[] = [];
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        completedWorkouts?.forEach((workout: any) => {
            const date = new Date(workout.completed_at || workout.workout_details.created_at);
            if (date >= oneYearAgo) {
                const dateStr = date.toISOString().split('T')[0];
                calendarData.push([dateStr, 1]);
            }
        });
        
        return { dailyCounts, typeCounts, calendarData };
    }
    
    function initCharts() {
        const { dailyCounts, typeCounts, calendarData } = prepareChartData();
        
        lineChart = echarts.init(lineChartEl);
        lineChart.setOption({
            title: { text: 'Workout Frequency (Last 30 Days)', left: 'center' },
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: Object.keys(dailyCounts).sort()
            },
            yAxis: { type: 'value' },
            series: [{
                data: Object.keys(dailyCounts).sort().map(date => dailyCounts[date]),
                type: 'line',
                smooth: true,
                areaStyle: {}
            }]
        });
        
        pieChart = echarts.init(pieChartEl);
        pieChart.setOption({
            title: { 
                text: 'Workout Types',
                left: 'center'
            },
            tooltip: { trigger: 'item' },
            legend: {
                orient: 'horizontal',
                bottom: 0,
                left: 'center'
            },
            series: [{
                name: 'Workout Types',
                type: 'pie',
                radius: '60%',
                center: ['50%', '45%'],
                data: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        });

        calendarChart = echarts.init(calendarChartEl);
        const currentYear = new Date().getFullYear();
        calendarChart.setOption({
            title: { 
                text: 'Workout Activity (Last Year)',
                left: 'center',
                top: 0
            },
            tooltip: {},
            visualMap: {
                min: 0,
                max: 10,
                type: 'piecewise',
                orient: 'horizontal',
                left: 'center',
                bottom: 0
            },
            calendar: {
                top: 50,
                bottom: 50,
                range: [`${currentYear-1}-01-01`, `${currentYear}-12-31`],
                cellSize: ['auto', 20]
            },
            series: {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: calendarData
            }
        });
    }
    
    function handleResize() {
        lineChart?.resize();
        pieChart?.resize();
        calendarChart?.resize();
    }
    
    onMount(() => {
        initCharts();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            lineChart?.dispose();
            pieChart?.dispose();
            calendarChart?.dispose();
        };
    });
</script>

<section class="h-[calc(100vh+56px)] mb-20">
    <div class="page-margins pt-[calc(56px+40px)] pb-10 flex flex-col gap-y-6 h-full">
        <div class="flex justify-between items-center">
            <div class="flex flex-col">
                <h2>{userDetails.username}</h2>
                <p>{userDetails.email}</p>
            </div>
            {#if !isPrivate || isSelf || isFriend}
                {#if isSelf}
                    <a href="/dashboard" class="btn-primary h-8">Dashboard</a>
                {:else if isFriend}
                    <button class="btn-red h-8" onclick={handleUnfriend}>Unfriend</button>
                {:else if hasPendingRequest}
                    <button class="btn-primary h-8" disabled={true}>Pending Request</button>
                {:else}
                    <button class="btn-primary h-8" onclick={handleSendRequest}>Add Friend</button>
                {/if}
            {/if}
        </div>
        
        {#if isPrivate && !isSelf && !isFriend}
            <!-- Show private profile message -->
            <div class="flex flex-col items-center justify-center">
                <h3 class="text-xl font-medium mb-4">This profile is private</h3>
                <p class="text-center max-w-md">
                    {userDetails.username}'s profile is set to private. 
                    You need to be friends to view their workout data and statistics.
                </p>
                {#if !hasPendingRequest}
                    <button class="btn-primary h-9 mt-6" onclick={handleSendRequest}>
                        Send Friend Request
                    </button>
                {:else}
                    <p class="mt-6 text-neutral-500">Friend request pending</p>
                {/if}
            </div>
        {:else}
            <div class="flex justify-between w-full gap-6">
                <div class="w-2/3 gap-6 flex flex-col">
                    <div class="flex flex-col gap-6">
                        <!-- CHARTS -->
                        <div class="flex gap-6 items-center justify-center">
                            <div class="bg-white p-4 rounded shadow h-80 w-[400px]">
                                <div bind:this={pieChartEl} class="w-full h-full"></div>
                            </div>
                            <div class="bg-white p-4 rounded shadow h-80 w-full">
                                <div bind:this={lineChartEl} class="w-full h-full"></div>
                            </div>
                        </div>
                        <div class="bg-white p-4 rounded shadow h-60 w-full">
                            <div bind:this={calendarChartEl} class="w-full h-full"></div>
                        </div>
                    </div>
                </div>

                <div class="w-1/3 gap-6 flex flex-col">
                    <!-- <button class="btn-primary h-9 w-full" onclick={handleCreateWorkout}>
                        Create a Workout
                    </button> -->
                    <h4 class="-my-2">Incomplete Workouts</h4>
                    <div class="rounded shadow bg-white p-4 overflow-y-auto h-1/2">
                        <div class="flex flex-col gap-y-3">
                            {#if incompleteWorkouts && incompleteWorkouts.length > 0}
                                <div class="flex flex-col gap-y-3">
                                    {#each incompleteWorkouts as workout}
                                        <div class="w-full">
                                            <div class="flex justify-between items-center w-full">
                                                <div class="flex items-center gap-x-2">
                                                    <h6>{workout.name}</h6>
                                                    <p class="bg-cyan-200 rounded-full px-2 text-cyan-600">{workout.type}</p>
                                                </div>
                                                <p>{new Date(workout.created_at).toLocaleString()}</p>
                                            </div>
                                            <p>{workout.description}</p>
                                        </div>
                                        <hr/>
                                    {/each}
                                </div>
                            {:else}
                                <p>You haven't created any workouts yet</p>
                            {/if}
                        </div>
                    </div>
                    <h4 class="-my-2">Completed Workouts</h4>
                    <div class="rounded shadow bg-white p-4 overflow-y-auto h-1/2">
                        <div class="flex flex-col gap-y-3">
                            {#if completedWorkouts && completedWorkouts.length > 0}
                                <div class="flex flex-col gap-y-3">
                                    {#each completedWorkouts as workout}
                                    <div class="w-full">
                                        <div class="flex justify-between items-center w-full">
                                            <div class="flex items-center gap-x-2">
                                                <h6>{workout.workout_details.name}</h6>
                                                <p class="bg-cyan-200 rounded-full px-2 text-cyan-600">{workout.workout_details.type}</p>
                                            </div>
                                            <p>{new Date(workout.workout_details.created_at).toLocaleString()}</p>
                                        </div>
                                        <p>{workout.workout_details.description}</p>
                                    </div>
                                    <hr/>
                                    {/each}
                                </div>
                            {:else}
                                <p>You haven't completed any workouts yet</p>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</section>