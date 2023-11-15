export class RTRError extends Error {
	constructor(response) {
		// Set the message to the status text, such as Unauthorized,
		// with some fallbacks. This message should never be undefined.
		super(
			response.statusText ||
			String(
				(response.status === 0 || response.status) ?
					response.status : 'Unknown Refresh Token Error'
			)
		);
		this.name = 'RTRError';
		this.response = response;
	}
}
