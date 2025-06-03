export enum ModalType {
	NONE = 'NONE',
	MESSAGE = 'MESSAGE',
	CREATE_EVENT = 'CREATE_EVENT',
	CREATE_CHALLENGE = 'CREATE_CHALLENGE',
	EDIT_CHALLENGE = 'EDIT_CHALLENGE',
	EDIT_EVENT = 'EDIT_EVENT',
	CREATE_MESSAGE = 'CREATE_MESSAGE',
	DELETE_EVENT = 'DELETE_EVENT',
	DELETE_CHALLENGE = 'DELETE_CHALLENGE',
	CREATE_WORKOUT = 'CREATE_WORKOUT'
}

export let modal = $state({
	type: ModalType.NONE,
	payload: null as any,

	setModal(modal: ModalType) {
		this.type = modal;
	},

	setPayload(payload: any) {
		this.payload = payload;
	},

	close() {
		this.type = ModalType.NONE;
		this.payload = null;
	}
});
