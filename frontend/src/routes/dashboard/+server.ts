import { error, json } from '@sveltejs/kit';
import { BACKEND_URL } from '$env/static/private';
import { GEMINI_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('auth_token');
	if (!token) {
		return error(401, 'Unauthorized');
	}

	try {
		const { workouts } = await request.json();

		const workoutSummary = workouts.map((w: any) => ({
			type: w.workout_details.type,
			name: w.workout_details.name,
			completed_at: w.completed_at
		}));

		const geminiResponse = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{
									text: `Based on these completed workouts, provide a short, 6-10 sentence fitness tip that would be helpful for this person. 
                        Be encouraging and specific but very brief.
                        
                        Workout history: ${JSON.stringify(workoutSummary)}`
								}
							]
						}
					]
				})
			}
		);

		if (!geminiResponse.ok) {
			error(500, 'Failed to generate tip');
		}

		const geminiData = await geminiResponse.json();
		const tip = geminiData.candidates[0].content.parts[0].text;

		return json({ success: true, tip });
	} catch (err: any) {
		error(500, err);
	}
};

export const PUT: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get('auth_token');
	const userId = cookies.get('user_id');

	if (!token || !userId) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	try {
		const { workoutId } = await request.json();

		const response = await fetch(`${BACKEND_URL}/api/user-workouts/create`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				user: userId,
				workout: workoutId,
				completed_at: new Date().toISOString()
			})
		});

		if (!response.ok) {
			error(500, 'Failed to mark workout as complete');
		}

		const data = await response.json();

		return json({ success: true, data });
	} catch (err: any) {
		error(500, err);
	}
};
