import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { BACKEND_URL } from '$env/static/private';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, params, fetch }) => {
	const token = cookies.get('auth_token');
	const currentUserId = cookies.get('user_id');
	const profileUserId = params.userId;

	if (!currentUserId) {
		throw redirect(302, '/login');
	}

	const userDetailsResponse = await fetch(`${BACKEND_URL}/api/users/${profileUserId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!userDetailsResponse.ok) {
		error(500, 'Failed to fetch user details');
	}

	const userDetails = await userDetailsResponse.json();

	const workoutsResponse = await fetch(`${BACKEND_URL}/api/workouts/${profileUserId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!workoutsResponse.ok) {
		error(500, 'Failed to fetch workouts');
	}

	const workouts = await workoutsResponse.json();

	const userWorkoutsResponse = await fetch(`${BACKEND_URL}/api/user-workouts/${profileUserId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!userWorkoutsResponse.ok) {
		error(500, 'Failed to fetch user workouts');
	}

	const userWorkouts = await userWorkoutsResponse.json();

	const friendsResponse = await fetch(`${BACKEND_URL}/api/friends/${currentUserId}/`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!friendsResponse.ok) {
		error(500, 'Failed to fetch friends list');
	}

	const friends = await friendsResponse.json();
	const isFriend = friends.results.some(
		(friend: any) =>
			(friend.user_id1 === parseInt(profileUserId) &&
				friend.user_id2 === parseInt(currentUserId)) ||
			(friend.user_id1 === parseInt(currentUserId) && friend.user_id2 === parseInt(profileUserId))
	);

	const friendRequestsReceivedResponse = await fetch(
		`${BACKEND_URL}/api/friend-requests/${currentUserId}/`,
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	if (!friendRequestsReceivedResponse.ok) {
		error(500, 'Failed to fetch friend requests');
	}

	const friendRequestsReceived = await friendRequestsReceivedResponse.json();

	const friendRequestsSentResponse = await fetch(
		`${BACKEND_URL}/api/friend-requests/${profileUserId}/`,
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	if (!friendRequestsSentResponse.ok) {
		error(500, 'Failed to fetch friend requests');
	}

	const friendRequestsSent = await friendRequestsSentResponse.json();

	const hasPendingRequest =
		friendRequestsReceived.results.some(
			(request: any) => request.receiver === parseInt(profileUserId)
		) ||
		friendRequestsSent.results.some((request: any) => request.sender === parseInt(currentUserId));

	const userWorkoutIds = new Set(
		userWorkouts.results.map((userWorkout: any) => userWorkout.workout)
	);

	const availableWorkouts = workouts.results.filter(
		(workout: any) => !userWorkoutIds.has(workout.id)
	);

	return {
		availableWorkouts,
		userWorkouts,
		userDetails,
		isFriend,
		hasPendingRequest,
		isSelf: currentUserId === profileUserId
	};
};
