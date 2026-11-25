/**
 * devtools-connection.ts
 * A small client for the Chrome DevTools Protocol (CDP), the remote-control channel of the
 * app's web view (WebView2 on Windows is built on Chromium). The student driver uses it to
 * click, type and read the screen of the real desktop app, like a student would.
 * It uses Node's built-in fetch and WebSocket, so no extra package is needed.
 */

/** One page the web view offers for remote control, as listed by its /json endpoint. */
type DevToolsTarget = {
	type: string;
	url: string;
	webSocketDebuggerUrl: string;
};

/** A CDP reply: either a result or an error, matched to its request by id. */
type DevToolsReply = {
	id?: number;
	result?: unknown;
	error?: { message: string };
};

/** A request waiting for its reply. */
type PendingRequest = {
	resolve: (result: unknown) => void;
	reject: (error: Error) => void;
};

/** The part of a Runtime.evaluate reply we read. */
type EvaluateResult = {
	result: { value?: unknown };
	exceptionDetails?: { text: string; exception?: { description?: string } };
};

/** An open remote-control connection to the app's main page. */
export class DevToolsConnection {
	private readonly socket: WebSocket;
	private readonly pendingRequests = new Map<number, PendingRequest>();
	private nextRequestId = 1;

	/**
	 * Wraps an already open socket and starts matching replies to requests.
	 * @param socket - an open WebSocket to one page
	 */
	private constructor(socket: WebSocket) {
		this.socket = socket;
		this.socket.addEventListener('message', (messageEvent) => {
			this.handleReply(String(messageEvent.data));
		});
	}

	/**
	 * Connects to the app's page on the given debugging port.
	 * @param port - the web view's remote debugging port
	 * @returns an open connection
	 */
	static async connect(port: number): Promise<DevToolsConnection> {
		const pageAddress = await findAppPage(port);
		const socket = new WebSocket(pageAddress);
		await new Promise<void>((resolve, reject) => {
			socket.addEventListener('open', () => resolve());
			socket.addEventListener('error', () => reject(new Error('Could not open the CDP socket')));
		});
		return new DevToolsConnection(socket);
	}

	/**
	 * Sends one CDP command and waits for its answer.
	 * @param method - the CDP method, e.g. "Input.insertText"
	 * @param parameters - the method's parameters
	 * @returns the command's result
	 */
	send(method: string, parameters: Record<string, unknown> = {}): Promise<unknown> {
		const requestId = this.nextRequestId;
		this.nextRequestId += 1;
		const reply = new Promise<unknown>((resolve, reject) => {
			this.pendingRequests.set(requestId, { resolve, reject });
		});
		this.socket.send(JSON.stringify({ id: requestId, method, params: parameters }));
		return reply;
	}

	/**
	 * Runs JavaScript in the page and returns its value (promises are awaited).
	 * @param expression - the JavaScript to run
	 * @returns the expression's value, copied out of the page as JSON
	 */
	async evaluate<ValueType>(expression: string): Promise<ValueType> {
		const reply = (await this.send('Runtime.evaluate', {
			expression,
			awaitPromise: true,
			returnByValue: true
		})) as EvaluateResult;
		if (reply.exceptionDetails !== undefined) {
			const description = reply.exceptionDetails.exception?.description;
			throw new Error(description ?? reply.exceptionDetails.text);
		}
		return reply.result.value as ValueType;
	}

	/** Closes the connection. Input: none. Output: none. */
	close(): void {
		this.socket.close();
	}

	/**
	 * Hands a reply to the request that waits for it; events without an id are ignored.
	 * @param messageText - the raw JSON message from the web view
	 */
	private handleReply(messageText: string): void {
		const reply = JSON.parse(messageText) as DevToolsReply;
		if (reply.id === undefined) {
			return;
		}
		const pendingRequest = this.pendingRequests.get(reply.id);
		if (pendingRequest === undefined) {
			return;
		}
		this.pendingRequests.delete(reply.id);
		if (reply.error !== undefined) {
			pendingRequest.reject(new Error(reply.error.message));
		} else {
			pendingRequest.resolve(reply.result);
		}
	}
}

/**
 * Asks the web view for its pages and picks the app's own page.
 * @param port - the remote debugging port
 * @returns the page's WebSocket address
 */
async function findAppPage(port: number): Promise<string> {
	const response = await fetch(`http://127.0.0.1:${port}/json`);
	const targets = (await response.json()) as DevToolsTarget[];
	const appPage = targets.find((target) => target.type === 'page');
	if (appPage === undefined) {
		throw new Error('The web view offers no page to control');
	}
	return appPage.webSocketDebuggerUrl;
}
