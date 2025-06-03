import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const userId = cookies.get('user_id');

	const response = await fetch(`${BACKEND_URL}/api/fitness-events/user/${userId}`);

	if (!response.ok) {
		error(502, 'Fitness events not found');
	}

	const allEvents = await response.json();

	const myEvents = allEvents.results.filter((event: any) => event.user.toString() === userId);

	const participatingEvents = allEvents.results.filter(
		(event: any) =>
			event.user.toString() !== userId &&
			event.participants.some((participant: number) => participant.toString() === userId)
	);

	return {
		myEvents: {
			count: myEvents.length,
			results: myEvents
		},
		participatingEvents: {
			count: participatingEvents.length,
			results: participatingEvents
		}
	};
};
