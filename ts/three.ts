/**
 * Event: `js:canvas:resize`
 * 
 * Is emitted by a resize on `ThreeBoilerplate`. `preventDefault` stops renderer resizing.
 */
class CanvasResizeEvent extends Event {
	constructor() {
		super("js:canvas:resize", { bubbles: true });
	}
}

/**
 * Event: `js:canvas:ready`
 * 
 * Emitted when a `ThreeBoilerplate` is fully setup. It's recommended to use this event instead of `ApplicationLoaded`.
 */
class CanvasReadyEvent extends Event {
	constructor() {
		super("js:canvas:ready", { bubbles: true });
	}
}

/**
 * Boilerplate kit for handling a basic THREE scene/renderer configuration.
 * Also handles shader loading with appropriate load blocking.
 */
class ThreeBoilerplate {
	canvas: HTMLCanvasElement;
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	shaders: { [name: string]: string } = {};

	/**
	 * Generates orthographic camera bounds from the `canvas` aspect-ratio.
	 * Ranges from `-1` to `1` for top, right, bottom, and left.
	 */
	orthographicBounds(): { top: number, right: number, bottom: number, left: number } {
		const { width, height } = this.canvas.getBoundingClientRect();

		if (width > height) {
			return {
				top: 1,
				right: width / height,
				bottom: -1,
				left: -(width / height)
			};
		}
		else {
			return {
				top: height / width,
				right: 1,
				bottom: -(height / width),
				left: -1
			};
		}
	}

	/**
	 * - Handlers renderer resizing.
	 * - Emits a `CanvasResizeEvent`, for custom resize controls. `preventDefault` stops renderer resizing.
	 * - Is invoked on window resize. 
	 */
	resize(): void {
		const event = new CanvasResizeEvent();

		this.canvas.dispatchEvent(event);

		if (!event.defaultPrevented) {
			const { width, height } = this.canvas.getBoundingClientRect();

			this.renderer.setSize(width, height);
			this.canvas.style.width = "";
			this.canvas.style.height = "";
		}
	}

	/**
	 * Literally just renders the scene. Does not invoke `requestAnimationFrame`.
	 */
	render(camera: THREE.Camera): void {
		this.renderer.render(this.scene, camera);
	}

	/**
	 * Invoked after any shaders are loaded.
	 * - Sets up scene and renderer.
	 * - Emits a `CanvasReadyEvent`.
	 * - Resizes.
	 */
	ready(): void {
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			alpha: true,
			antialias: true
		});

		this.canvas.dispatchEvent(new CanvasReadyEvent());

		this.resize();
	}

	constructor(options: { shaders?: { [name: string]: string }, canvas: HTMLCanvasElement }) {
		this.canvas = options.canvas;

		if (options.shaders) {
			this.canvas.dispatchEvent(new TimeoutStartEvent());
			
			new Promise<void>(async resolve => {
	
				for (let shader in options.shaders) {
					this.shaders[shader] = await (await fetch(options.shaders[shader])).text();
				}
				
				resolve();
			})
			.then(() => {
				this.canvas.dispatchEvent(new TimeoutEndEvent());
			});
		}

		document.body.addEventListener("js:loaded", () => this.ready())
		window.addEventListener("resize", () => this.resize());
	}
}