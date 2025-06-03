import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`${BACKEND_URL}/api/fitness-challenges/`);

	if (!response.ok) {
		error(502, 'Fitness challenges not found');
	}

	const fitnessChallenges = await response.json();

	return {
		fitnessChallenges
	};
};
