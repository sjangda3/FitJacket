import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const PUT: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('auth_token');
	const userId = cookies.get('user_id');

	if (!token || !userId) {
		error(401, 'Unauthorized');
	}

	try {
		const userData = await request.json();

		if (!userData.username || !userData.email) {
			error(400, 'Username and email are required');
		}

		const response = await fetch(`${BACKEND_URL}/api/users/${userId}/update/`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: userData.username,
				email: userData.email,
				profile: {
					is_private: userData.is_private
				}
			})
		});

		if (!response.ok) {
			console.error(await response.text());
			error(500, 'Failed to update user');
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

export const PATCH: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('auth_token');
	const userId = cookies.get('user_id');

	if (!token || !userId) {
		error(401, 'Unauthorized');
	}

	try {
		const { current_password, new_password } = await request.json();

		if (!current_password || !new_password) {
			error(400, 'Current password and new password are required');
		}

		const response = await fetch(`${BACKEND_URL}/api/users/${userId}/change-password/`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				current_password,
				new_password
			})
		});

		if (!response.ok) {
			error(500, 'Failed to update password');
		}

		return json({
			success: true,
			message: 'Password updated successfully'
		});
	} catch (err: any) {
		error(500, 'Server error');
	}
};
