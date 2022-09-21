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
	static tasks: Promise<void>[] = [];

	static registerTask(promise: Promise<void>) {
		this.tasks.push(promise);
		console.log("[Lifecycle] Task registered;", this.tasks.length, "total tasks");
	}

	constructor() {
		super();

		window.addEventListener("load", () => {
			console.log("[Lifecycle] Load");

			Promise.all(LoadingElement.tasks).then(() => {
				console.log("[Lifecycle] Application Loaded;", LoadingElement.tasks.length, "tasks completed");

				this.dispatchEvent(new ApplicationLoaded());
				
				this.classList.add("loaded");
			});
		});
	}
}
