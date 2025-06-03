import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`${BACKEND_URL}/api/fitness-events/`);

	if (!response.ok) {
		error(502, 'Fitness events not found');
	}

	const fitnessEvents = await response.json();

	return {
		fitnessEvents
	};
};
