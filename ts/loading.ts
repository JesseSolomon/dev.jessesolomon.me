/**
 * Event: `js:timeout:start`
 * 
 * Allows elements to hold on the loading screen, ended by `TimeoutEndEvent`, must be declared before `load`
 */
class TimeoutStartEvent extends Event {
	constructor() {
		super("js:timeout:start", { bubbles: true });
	}
}

/**
 * Event: `js:timeout:end`
 * 
 * Ends a load timeout
 */
class TimeoutEndEvent extends Event {
	constructor() {
		super("js:timeout:end", { bubbles: true });
	}
}

/**
 * Event: `js:loaded`
 * 
 * Emitted when `load` and all timeouts have resolved
 */
class ApplicationLoaded extends Event {
	constructor() {
		super("js:loaded", { bubbles: true });
	}
}

class LoadingElement extends HTMLElement {
	constructor() {
		super();

		let timeouts = 0;

		const timeoutPromise = new Promise<void>(resolve => {
			document.body.addEventListener("js:timeout:start", () => {
				timeouts++;
			});

			document.body.addEventListener("js:timeout:end", () => {
				timeouts--

				if (timeouts <= 0) resolve();
			});
		});

		window.addEventListener("load", () => {
			console.log("[Lifecycle] Load");

			timeoutPromise.then(() => {
				console.log("[Lifecycle] Application Loaded");

				this.dispatchEvent(new ApplicationLoaded());
				
				this.classList.add("loaded")
			});
		});
	}
}
