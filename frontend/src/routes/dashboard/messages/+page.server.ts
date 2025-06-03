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

	const receivedMessagesResponse = await fetch(`${BACKEND_URL}/api/messages/received/${userId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!receivedMessagesResponse.ok) {
		error(502, 'Received messages data not found');
	}

	const receivedMessages = await receivedMessagesResponse.json();

	const sentMessagesResponse = await fetch(`${BACKEND_URL}/api/messages/sent/${userId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!sentMessagesResponse.ok) {
		error(502, 'Sent messages data not found');
	}

	const sentMessages = await sentMessagesResponse.json();

	const userIds = new Set<number>();

	receivedMessages.results.forEach((message: any) => {
		userIds.add(message.sender);
	});

	sentMessages.results.forEach((message: any) => {
		userIds.add(message.receiver);
	});

	const userIdsArray = Array.from(userIds);
	let userData: Record<number, any> = {};

	if (userIdsArray.length > 0) {
		const usersResponse = await fetch(
			`${BACKEND_URL}/api/users/batch/?ids=${userIdsArray.join(',')}`,
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		if (usersResponse.ok) {
			const users = await usersResponse.json();
			userData = Object.fromEntries(users.map((user: any) => [user.id, user]));
		}
	}

	receivedMessages.results.forEach((message: any) => {
		message.senderData = userData[message.sender] || null;
		message.receiverData = user;
	});

	sentMessages.results.forEach((message: any) => {
		message.receiverData = userData[message.receiver] || null;
		message.senderData = user;
	});

	const friendsResponse = await fetch(`${BACKEND_URL}/api/friends/${userId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!friendsResponse.ok) {
		error(502, 'Friends data not found');
	}

	const friends = await friendsResponse.json();

	return {
		receivedMessages,
		sentMessages,
		friends
	};
};
