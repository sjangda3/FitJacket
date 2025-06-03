import { browser } from '$app/environment';

const defaultAuth = {
	user: {
		id: '',
		username: '',
		email: ''
	},
	token: ''
};

function setCookie(name: string, value: string, days: number = 30) {
	if (!browser) return;

	const date = new Date();
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
	const expires = '; expires=' + date.toUTCString();
	document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

export let auth = $state({
	...(browser
		? JSON.parse(localStorage.getItem('auth') || JSON.stringify(defaultAuth))
		: defaultAuth),

	setToken(token: string) {
		this.token = token;
		setCookie('auth_token', token);
	},

	setUser(email: string, username: string, userId: number) {
		this.user.email = email;
		this.user.username = username;
		this.user.id = userId;

		setCookie('user_id', userId.toString());
	},

	clearAuth() {
		this.token = '';
		this.user.id = '';
		this.user.username = '';
		this.user.email = '';

		if (browser) {
			setCookie('user_id', '', -1);
			setCookie('auth_token', '', -1);
		}
	}
});

$effect.root(() => {
	$effect(() => {
		if (browser) {
			localStorage.setItem('auth', JSON.stringify(auth));
		}
	});
});
