<script lang="ts">
    import { page } from "$app/state";
    let { username, email } = $props();
    const navItems = [
        {
            href: "/dashboard",
            label: "Home",
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`
        },
        {
            href: "/dashboard/messages",
            label: "Messages",
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />`
        },
        {
            href: "/dashboard/friends",
            label: "Friends",
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />`
        },
        // {
        //     href: "/dashboard/chat",
        //     label: "Chat",
        //     icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />`
        // },
        {
            href: "/dashboard/fitness-events",
            label: "Fitness Events",
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />`
        },
        {
            href: "/dashboard/fitness-challenges",
            label: "Fitness Challenges",
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />`
        },
        {
            href: "/dashboard/settings",
            label: "Settings",
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`
        }
    ];
</script>

<div class="h-full pt-[56px] w-64 bg-white border-r border-neutral-200">
    <div class="flex flex-col px-4 py-4 gap-y-4">
        <div class="flex flex-col rounded px-2">
            <h6>{username}</h6>
            <p class="text-xs">{email}</p>
        </div>
        <hr/>
        <div class="flex flex-col gap-y-2">
            {#each navItems as item}
                <a 
                href={item.href} 
                class="dashboard-link {
                item.href === '/dashboard' 
                    ? page.url.pathname === '/dashboard' 
                    ? 'bg-neutral-100/80 text-cyan-500' 
                    : ''
                    : page.url.pathname.includes(item.href) 
                    ? 'bg-neutral-100/80 text-cyan-500' 
                    : ''
                }">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {@html item.icon}
                    </svg>
                    <span>{item.label}</span>
                </a>
            {/each}
        </div>
    </div>
</div>