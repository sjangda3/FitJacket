<script lang="ts">
	import '../app.css';
	import { Navbar, Footer } from '$lib/components/core/';
	import { modal } from '$lib/shared/modals.svelte';
	import { ModalType } from '$lib/shared/modals.svelte';
	import MessageModal from '$lib/components/modals/MessageModal.svelte';
	import CreateChallengeModal from '$lib/components/modals/CreateChallengeModal.svelte';
	import CreateEventModal from '$lib/components/modals/CreateEventModal.svelte';
	import CreateMessageModal from '$lib/components/modals/CreateMessageModal.svelte';
	import EditChallengeModal from '$lib/components/modals/EditChallengeModal.svelte';
	import EditEventModal from '$lib/components/modals/EditEventModal.svelte';
	import DeleteEventModal from '$lib/components/modals/DeleteEventModal.svelte';
	import DeleteChallengeModal from '$lib/components/modals/DeleteChallengeModal.svelte';
	import CreateWorkoutModal from '$lib/components/modals/CreateWorkoutModal.svelte';

	let { children } = $props(); 
</script>

{#if modal.type !== ModalType.NONE}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
		{#if modal.type === ModalType.MESSAGE}
			<MessageModal message={modal.payload}/>
		{:else if modal.type === ModalType.CREATE_CHALLENGE}
			<CreateChallengeModal completedWorkouts={modal.payload}/>
		{:else if modal.type === ModalType.CREATE_EVENT}
			<CreateEventModal/>
		{:else if modal.type === ModalType.EDIT_CHALLENGE}
			<EditChallengeModal challenge={modal.payload?.challenge} completedWorkouts={modal.payload?.completedWorkouts}/>
		{:else if modal.type === ModalType.EDIT_EVENT}
			<EditEventModal event={modal.payload}/>
		{:else if modal.type === ModalType.CREATE_MESSAGE}
			<CreateMessageModal friends={modal.payload}/>
		{:else if modal.type === ModalType.DELETE_EVENT}
			<DeleteEventModal event={modal.payload}/>
		{:else if modal.type === ModalType.DELETE_CHALLENGE}
			<DeleteChallengeModal challenge={modal.payload}/>
		{:else if modal.type === ModalType.CREATE_WORKOUT}
			<CreateWorkoutModal/>
		{/if}
	</div>
{/if}

<Navbar/>
<main>
	{@render children()}
</main>
<Footer/>
