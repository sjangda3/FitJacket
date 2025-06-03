<script lang="ts">
    import { auth } from "$lib/shared/auth.svelte";
    import { onMount } from 'svelte';
    import * as echarts from 'echarts';
	import { modal, ModalType } from "$lib/shared/modals.svelte.js";

    let { data } = $props();

    let incompleteWorkouts = $derived(data.availableWorkouts);
    let completedWorkouts = $derived(data.userWorkouts.results);

    let tip = $state('');
    let loadingTip = $state(false);
    
    // Chart DOM elements
    let lineChartEl: HTMLElement;
    let pieChartEl: HTMLElement;
    let calendarChartEl: HTMLElement;
    
    // Chart instances
    let lineChart: echarts.ECharts;
    let pieChart: echarts.ECharts;
    let calendarChart: echarts.ECharts;

    function handleCreateWorkout() {
        modal.setModal(ModalType.CREATE_WORKOUT);
    }

    async function handleCompleteWorkout(workoutId: number) {
        try {
            const response = await fetch('/dashboard', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workoutId: workoutId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark workout as complete');
            }
            
            window.location.href = '/dashboard';
        } catch (err) {
            console.error(err);
        }
    }

    async function handleGenerateTip() {
        loadingTip = true;

        tip = "";
        
        try {
            const response = await fetch('/dashboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workouts: completedWorkouts
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate tip');
            }
            
            const result = await response.json();
            tip = result.tip;
        } catch (err) {
            console.error('Error generating tip:', err);
            tip = "Sorry, couldn't generate a tip right now. Please try again later.";
        } finally {
            loadingTip = false;
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

<div class="flex flex-col gap-y-6 h-full">
    <h2>Hello, {auth.user.username} 👋</h2>

    <div class="flex justify-between w-full gap-6 h-full">
        <div class="w-2/3 h-full gap-6 flex flex-col ">
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
            <div class="relative h-full">
                <div class="bg-neutral-100 rounded p-2 h-full w-full">
                    <p>{loadingTip ? 'Generating tip...' : tip}</p>
                </div>
                <button class="btn-secondary h-8 bottom-2 right-2 absolute" onclick={handleGenerateTip}>
                    Generate Tip
                </button>
            </div>
        </div>

        <div class="h-full w-1/3 gap-6 flex flex-col">
            <button class="btn-primary h-9 w-full" onclick={handleCreateWorkout}>
                Create a Workout
            </button>
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
                                    <button class="btn-primary h-7 mt-2" onclick={() => handleCompleteWorkout(workout.id)}>Set Complete</button>
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
</div>