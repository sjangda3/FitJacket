import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const userId = cookies.get('user_id');
	const token = cookies.get('auth_token');

	const fitnessChallengeResponse = await fetch(
		`${BACKEND_URL}/api/fitness-challenges/user/${userId}`
	);

	if (!fitnessChallengeResponse.ok) {
		error(502, 'Fitness challenges not found');
	}

	const allChallenges = await fitnessChallengeResponse.json();

	const myChallenges = allChallenges.results.filter(
		(challenge: any) => challenge.user.toString() === userId
	);

	const participatingChallenges = allChallenges.results.filter(
		(challenge: any) =>
			challenge.user.toString() !== userId &&
			challenge.participants.some((participant: number) => participant.toString() === userId)
	);

	const userWorkoutsResponse = await fetch(`${BACKEND_URL}/api/user-workouts/${userId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!userWorkoutsResponse.ok) {
		error(500, 'Failed to fetch user workouts');
	}

	const userWorkouts = await userWorkoutsResponse.json();

	return {
		myChallenges: {
			count: myChallenges.length,
			results: myChallenges
		},
		participatingChallenges: {
			count: participatingChallenges.length,
			results: participatingChallenges
		},
		userWorkouts
	};
};
