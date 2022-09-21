class NWAElement extends HTMLElement {
	private boilerplate: ThreeBoilerplate;
	private camera: THREE.PerspectiveCamera;

	ready(): void {
		const { width, height } = this.boilerplate.canvas.getBoundingClientRect();

		this.camera = new THREE.PerspectiveCamera(50, width / height);

		this.boilerplate.scene.add(this.camera);

		this.camera.position.set(0, 0, -2);
		this.camera.lookAt(0, 0, 0);
	}

	resize(): void {

	}

	render(): void {

	}

	connectedCallback() {
		this.boilerplate = new ThreeBoilerplate({
			canvas: this.querySelector("canvas")
		});
	}

	constructor() {
		super();

		this.addEventListener("js:canvas:ready", () => this.ready());
		this.addEventListener("js:canvas:resize", () => this.resize());
	}
}
