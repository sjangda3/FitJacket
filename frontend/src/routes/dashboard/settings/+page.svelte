<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/shared/auth.svelte';

    let { data } = $props();
    
    let username = $state(auth.user.username);
    let email = $state(auth.user.email);
    let isProfilePrivate = $state(data.isPrivate);
    let loadingGeneral = $state(false);
    
    let currentPassword = $state('');
    let newPassword = $state('');
    let confirmPassword = $state('');
    let loadingPassword = $state(false);

    let passwordErrorMsg = $state('');
    
    async function updateGeneralSettings() {
        loadingGeneral = true;
        
        try {
            const response = await fetch('/dashboard/settings/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    is_private: isProfilePrivate
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update general settings');
            }

            const { data } = await response.json();

            auth.setUser(data.email, username, data.id);
        } catch (err) {
            console.error(err);
        } finally {
            loadingGeneral = false;
        }
    }
    
    async function updatePassword() {
        loadingPassword = true;
        passwordErrorMsg = '';
        
        try {
            const response = await fetch('/dashboard/settings/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword || null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update password');
            }
        } catch (err) {
            console.error(err);
            passwordErrorMsg = 'An error occurred while updating the password. Please try again.';
        } finally {
            currentPassword = '';
            newPassword = '';
            confirmPassword = '';

            loadingPassword = false;
        }
    }
    
    let stravaData: any = $state(null);
    let connected = $state(false);
    
    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');
        const isConnected = urlParams.get('connected') === 'true';
        
        if (dataParam) {
            try {
                const newData = JSON.parse(decodeURIComponent(dataParam));
                stravaData = newData;
                connected = true;
                
                localStorage.setItem('strava_data', JSON.stringify(newData));
                localStorage.setItem('strava_connected', 'true');
                
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                console.error('Error parsing Strava data', e);
            }
        } else if (isConnected) {
            connected = true;
            localStorage.setItem('strava_connected', 'true');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            const savedData = localStorage.getItem('strava_data');
            const savedConnected = localStorage.getItem('strava_connected');
            
            if (savedData) {
                try {
                    stravaData = JSON.parse(savedData);
                } catch (e) {
                    console.error('Error parsing saved Strava data', e);
                    localStorage.removeItem('strava_data');
                }
            }
            
            if (savedConnected === 'true') {
                connected = true;
            }
        }
    });
    
    function connectStrava() {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/strava/login/`;
    }

    async function refreshStravaData() {
        try {
            localStorage.setItem('strava_connected', 'true');
            
            window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/strava/login/`;
        } catch (error) {
            console.error('Error refreshing Strava data:', error);
        }
    }
    
    function disconnectStrava() {
        localStorage.removeItem('strava_data');
        localStorage.removeItem('strava_connected');
        stravaData = null;
        connected = false;
    }
</script>

<div class="flex flex-col gap-y-6 h-full">
    <h2>Settings</h2>
    <div class="flex justify-between gap-6 w-full h-full">
        <div class="w-1/2 flex flex-col gap-6">
            <h4 class="-my-2">Change Settings</h4>
            <div class="p-4 bg-white shadow rounded">
                <form onsubmit={updateGeneralSettings} class="flex flex-col gap-y-4">
                    <div class="flex flex-col gap-y-1">
                        <label for="username" class="text-sm">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            bind:value={username} 
                            required
                            disabled={loadingGeneral}
                            class="input h-9"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-y-1">
                        <label for="email" class="text-sm">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            bind:value={email} 
                            required
                            disabled={loadingGeneral}
                            class="input h-9"
                        />
                    </div>
                    
                    <div class="flex items-center gap-x-2 mt-2">
                        <input 
                            type="checkbox" 
                            id="isPrivate"
                            bind:checked={isProfilePrivate}
                            disabled={loadingGeneral}
                            class="h-4 w-4"
                        />
                        <label for="isPrivate" class="text-sm">Private</label>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loadingGeneral || !username || !email}
                        class="btn-primary h-8"
                    >
                        Update Profile
                    </button>
                </form>
            </div>
            <h4 class="-my-2">Change Password</h4>
            <div class="p-4 bg-white shadow rounded">
                {#if passwordErrorMsg}
                    <div class="text-red-500 mb-2">{passwordErrorMsg}</div>
                {/if}
                <form onsubmit={updatePassword} class="flex flex-col gap-y-4">
                    <div class="flex flex-col gap-y-1">
                        <label for="currentPassword" class="text-sm">Current Password</label>
                        <input 
                            type="password" 
                            id="currentPassword" 
                            bind:value={currentPassword}
                            required
                            disabled={loadingPassword}
                            class="input h-9"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-y-1">
                        <label for="newPassword" class="text-sm">New Password</label>
                        <input 
                            type="password" 
                            id="newPassword" 
                            bind:value={newPassword}
                            required
                            minlength="8"
                            disabled={loadingPassword}
                            class="input h-9"
                        />
                    </div>
                    
                    <div class="flex flex-col gap-y-1">
                        <label for="confirmPassword" class="text-sm">Confirm New Password</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            bind:value={confirmPassword}
                            required
                            minlength="8"
                            disabled={loadingPassword}
                            class="input h-9"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loadingPassword || !newPassword || !confirmPassword || !currentPassword || newPassword !== confirmPassword}
                        class="btn-primary h-8"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
        <div class="w-1/2 flex flex-col gap-6">
            <h4 class="-my-2">Strava Integration</h4>
            <div class="p-4 bg-white shadow rounded">
                {#if connected}
                    <div class="flex justify-between items-center mb-4">
                        <p class="text-green-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Connected to Strava
                        </p>
                        <div class="flex gap-2">
                            <button onclick={refreshStravaData} class="btn-primary h-8">
                                Refresh Data
                            </button>
                            <button onclick={disconnectStrava} class="btn-red h-8">
                                Disconnect
                            </button>
                        </div>
                    </div>
                    
                    {#if stravaData?.athlete}
                        <div class="mb-4 p-3 bg-gray-50 rounded">
                            <h5 class="font-medium mb-2">Athlete Info</h5>
                            <div class="flex items-center gap-3">
                                <div>
                                    <p><strong>{stravaData.athlete.firstname} {stravaData.athlete.lastname}</strong></p>
                                    <p class="text-sm text-gray-600">
                                        {stravaData.athlete.city}, {stravaData.athlete.country}
                                    </p>
                                </div>
                            </div>
                        </div>
                    {/if}
                    
                    {#if stravaData?.activities && stravaData.activities.length > 0}
                        <h5 class="font-medium mb-2">Recent Activities</h5>
                        <div class="max-h-80 overflow-y-auto">
                            {#each stravaData.activities as activity}
                                <div class="mb-2 p-2 bg-gray-50 rounded">
                                    <h6>{activity.name}</h6>
                                    <div class="flex justify-between text-sm text-gray-600">
                                        <span>{activity.type}</span>
                                        <span>{new Date(activity.start_date).toLocaleDateString()}</span>
                                    </div>
                                    <div class="flex gap-4 mt-1 text-sm">
                                        <span>{(activity.distance / 1000).toFixed(2)} km</span>
                                        <span>{Math.floor(activity.moving_time / 60)} min</span>
                                        {#if activity.total_elevation_gain > 0}
                                            <span>{activity.total_elevation_gain}m elevation</span>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else if connected}
                        <p>No activities found</p>
                    {/if}
                {:else}
                    <div class="flex flex-col items-center justify-center p-4">
                        <p class="mb-4 text-center">Connect your Strava account to import your activities and view your stats</p>
                        <button onclick={connectStrava} class="flex items-center gap-2 bg-[#FC4C02] hover:bg-[#e64500] text-white px-4 py-2 rounded">
                            <!-- Strava logo -->
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                            </svg>
                            Connect with Strava
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>