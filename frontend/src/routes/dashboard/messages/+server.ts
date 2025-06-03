import { json } from '@sveltejs/kit';
import { BACKEND_URL } from '$env/static/private';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('auth_token');
	const userId = cookies.get('user_id');

	if (!userId) {
		error(401, 'Unauthorized');
	}

	try {
		const { receiverId, text } = await request.json();

		if (!receiverId || !text) {
			error(400, 'Requires receiver and text');
		}

		const response = await fetch(`${BACKEND_URL}/api/messages/create/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sender: userId,
				receiver: receiverId,
				text: text,
				viewed: false
			})
		});

		if (!response.ok) {
			error(500, 'Failed to send');
		}

		const data = await response.json();

		return json({
			success: true,
			data
		});
	} catch (err) {
		error(500, 'Failed to send');
	}
};

export const PUT: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('auth_token');

	if (!token) {
		error(401, 'Unauthorized');
	}

	try {
		const { messageId } = await request.json();

		if (!messageId) {
			error(400, 'Requires message id');
		}

		const response = await fetch(`${BACKEND_URL}/api/messages/${messageId}/mark-as-viewed/`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			error(500, 'Failed to update');
		}

		const data = await response.json();

		return json({
			success: true,
			data
		});
	} catch (err) {
		error(500, 'Failed to update');
	}
};
