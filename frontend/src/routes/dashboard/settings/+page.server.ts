import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const userId = cookies.get('user_id');
	const token = cookies.get('auth_token');

	if (!userId) {
		redirect(302, '/login');
	}

	const userResponse = await fetch(`${BACKEND_URL}/api/users/${userId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!userResponse.ok) {
		error(502, 'Current user data not found');
	}

	const user = await userResponse.json();

	return {
		isPrivate: user.profile.is_private
	};
};
