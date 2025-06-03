import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('auth_token');
	const userId = cookies.get('user_id');

	if (!userId) {
		throw redirect(302, '/login');
	}

	const workoutsResponse = await fetch(`${BACKEND_URL}/api/workouts/${userId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!workoutsResponse.ok) {
		error(500, 'Failed to fetch workouts');
	}

	const workouts = await workoutsResponse.json();

	const userWorkoutsResponse = await fetch(`${BACKEND_URL}/api/user-workouts/${userId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!userWorkoutsResponse.ok) {
		error(500, 'Failed to fetch user workouts');
	}

	const userWorkouts = await userWorkoutsResponse.json();

	const userWorkoutIds = new Set(
		userWorkouts.results.map((userWorkout: any) => userWorkout.workout)
	);

	const availableWorkouts = workouts.results.filter(
		(workout: any) => !userWorkoutIds.has(workout.id)
	);

	return {
		availableWorkouts,
		userWorkouts
	};
};
