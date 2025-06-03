import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('auth_token');

	if (!token) {
		error(401, 'Unauthorized');
	}

	try {
		const workoutData = await request.json();

		console.log(workoutData);

		const response = await fetch(`${BACKEND_URL}/api/workouts/create/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(workoutData)
		});

		if (!response.ok) {
			error(500, 'Failed to create workout');
		}

		const data = await response.json();

		return json({
			success: true,
			data
		});
	} catch (err: any) {
		error(500, err.message);
	}
};
