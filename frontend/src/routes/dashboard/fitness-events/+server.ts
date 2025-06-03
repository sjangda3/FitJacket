import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('auth_token');

	if (!token) {
		error(401, 'Unauthorized');
	}

	try {
		const eventData = await request.json();

		console.log(eventData);

		const response = await fetch(`${BACKEND_URL}/api/fitness-events/create/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(eventData)
		});

		if (!response.ok) {
			error(500, 'Failed to create fitness event');
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

export const PUT: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('auth_token');

	if (!token) {
		error(401, 'Unauthorized');
	}

	try {
		const eventData = await request.json();

		const response = await fetch(`${BACKEND_URL}/api/fitness-events/${eventData.id}/update/`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(eventData)
		});

		if (!response.ok) {
			error(500, 'Failed to update fitness event');
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
		const { eventId } = await request.json();

		const response = await fetch(`${BACKEND_URL}/api/fitness-events/${eventId}/delete`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			error(500, 'Failed to delete fitness event');
		}

		return json({
			success: true
		});
	} catch (err: any) {
		error(500, err);
	}
};
