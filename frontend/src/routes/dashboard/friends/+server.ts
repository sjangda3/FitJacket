import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const PATCH: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('auth_token');

	if (!token) {
		error(401, 'Unauthorized');
	}

	try {
		const { friendRequestId, action } = await request.json();

		if (!friendRequestId) {
			error(400, 'Friend request ID is required');
		}

		if (!action || (action !== 'accept' && action !== 'decline')) {
			error(400, 'Invalid action. Must be "accept" or "decline"');
		}

		const response = await fetch(
			`${BACKEND_URL}/api/friend-requests/${friendRequestId}/${action}/`,
			{
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		if (!response.ok) {
			error(500, `Failed to ${action} friend request`);
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

export const DELETE: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('auth_token');

	if (!token) {
		error(401, 'Unauthorized');
	}

	try {
		const { friendId } = await request.json();

		if (!friendId) {
			error(400, 'Friend ID is required');
		}

		const response = await fetch(`${BACKEND_URL}/api/friends/${friendId}/delete`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			error(500, 'Failed to unfriend');
		}

		return json({
			success: true
		});
	} catch (err: any) {
		error(500, err);
	}
};
