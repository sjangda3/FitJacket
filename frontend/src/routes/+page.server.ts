import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { BACKEND_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const token = cookies.get('auth_token');

	const announcementsResponse = await fetch(`${BACKEND_URL}/api/announcements/`);

	if (!announcementsResponse.ok) {
		error(502, 'Announcements not found');
	}

	const announcements = await announcementsResponse.json();

	return {
		announcements
	};
};
