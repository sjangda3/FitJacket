<script lang="ts">
    import { auth } from "$lib/shared/auth.svelte";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    onMount(() => {
        if (auth.token !== null && auth.token !== '') {
            goto('/dashboard');
        }
    });

    let username = $state('');
    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');
    let errorMsg = $state('');
    let loading = $state(false);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        if (auth.token !== '') {
            errorMsg = 'You are already logged in';
        }

        errorMsg = '';
        
        if (password !== confirmPassword) {
            errorMsg = 'Passwords do not match';
            return;
        }
        
        if (password.length < 8) {
            errorMsg = 'Password must be at least 8 characters';
            return;
        }
        
        loading = true;
        
        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                }),
            });

            if (!response.ok) {
                throw new Error();
            }

            const data = await response.json();

            auth.setToken(data.token);
            auth.setUser(data.email, username, data.id);

            goto('/dashboard');
        } catch (err: any) {
            errorMsg = 'An error occurred during sign up';
        } finally {
            loading = false;
        }
    }
</script>

<section>
    <div class="w-full h-[100vh] flex items-center justify-center">
        <div class="w-[360px] py-6 px-8 bg-white shadow rounded">
            <div class="flex flex-col items-center gap-y-6">
                <h3>Sign Up</h3>
                {#if errorMsg}
                    <div class="text-red-500 -my-3">{errorMsg}</div>
                {/if}
                
                <form class="flex flex-col gap-y-3 w-full" onsubmit={handleSubmit}>
                    <div class="flex flex-col gap-y-1">
                        <label for="username" class="text-sm">Username</label>
                        <input class="input h-9"
                            type="text" 
                            id="username" 
                            bind:value={username} 
                            required 
                            disabled={loading}
                        />
                    </div>
                    
                    <div class="flex flex-col gap-y-1">
                        <label for="email" class="text-sm">Email</label>
                        <input class="input h-9"
                            type="text" 
                            id="email" 
                            bind:value={email} 
                            required 
                            disabled={loading}
                        />
                    </div>
                    
                    <div class="flex flex-col gap-y-1">
                        <label for="password" class="text-sm">Password</label>
                        <input class="input h-9"
                            type="password" 
                            id="password" 
                            bind:value={password} 
                            required 
                            disabled={loading}
                        />
                    </div>
                    
                    <div class="flex flex-col gap-y-1">
                        <label for="confirmPassword" class="text-sm">Confirm Password</label>
                        <input class="input h-9"
                            type="password" 
                            id="confirmPassword" 
                            bind:value={confirmPassword} 
                            required 
                            disabled={loading}
                        />
                    </div>
                    
                    <button class="btn-primary w-full h-8 mt-2" type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                
                <div>
                    Already have an account? <a class="link" href="/login">Log in</a>
                </div>
            </div>
        </div>
    </div>
</section>