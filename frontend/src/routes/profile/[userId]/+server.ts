import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('auth_token');
	const currentUserId = cookies.get('user_id');
	const profileUserId = params.userId;

	if (!token || !currentUserId) {
		error(401, 'Unauthorized');
	}

	try {
		const response = await fetch(`${BACKEND_URL}/api/friend-requests/create/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sender: currentUserId,
				receiver: profileUserId
			})
		});

		if (!response.ok) {
			error(500, 'Failed to send friend request');
		}

		const data = await response.json();

		return json({
			success: true,
			data
		});
	} catch (err: any) {
		error(500, err);
	}
};
