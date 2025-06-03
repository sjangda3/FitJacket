import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const userId = cookies.get('user_id');
	const token = cookies.get('auth_token');

	if (!userId) {
		redirect(302, '/login');
	}

	const friendsResponse = await fetch(`${BACKEND_URL}/api/friends/${userId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!friendsResponse.ok) {
		error(502, 'Friends data not found');
	}

	const friends = await friendsResponse.json();

	const requestsResponse = await fetch(`${BACKEND_URL}/api/friend-requests/${userId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!requestsResponse.ok) {
		error(502, 'Friend requests data not found');
	}

	const friendRequests = await requestsResponse.json();

	return {
		friends,
		friendRequests
	};
};
