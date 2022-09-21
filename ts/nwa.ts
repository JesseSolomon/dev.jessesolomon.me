class NWAElement extends HTMLElement {
	private boilerplate: ThreeBoilerplate;
	private camera: THREE.PerspectiveCamera;

	ready(): void {
		const { width, height } = this.boilerplate.canvas.getBoundingClientRect();

		const makeSphere = () => new THREE.Mesh(
			new THREE.SphereGeometry(1),
			new THREE.ShaderMaterial({
				vertexShader: this.boilerplate.shaders["nwa.vert"],
				fragmentShader: this.boilerplate.shaders["nwa.frag"],
				uniforms: {
					alphaColor: { value: new THREE.Color(0x04724D) },
					betaColor: { value: new THREE.Color(0x8AE9C1) }
				}
			})
		);

		this.camera = new THREE.PerspectiveCamera(50, width / height);

		this.boilerplate.scene.add(this.camera);

		for (let z = 0; z < 10; z++) {
			for (let x = -(z + 5); x < z + 5; x++) {
				const sphere = makeSphere();

				sphere.position.set(x, 0, z);

				this.boilerplate.scene.add(sphere);
			}
		}

		this.camera.position.set(0, 1.5, -3);
		this.camera.lookAt(0, 1, 0);

		this.render();
	}

	resize(): void {

	}

	render(): void {
		this.boilerplate.render(this.camera);

		requestAnimationFrame(() => this.render());
	}

	constructor() {
		super();

		this.boilerplate = new ThreeBoilerplate({
			canvas: this.querySelector("canvas"),
			shaders: {
				"nwa.frag": "/glsl/nwa.frag.glsl",
				"nwa.vert": "/glsl/nwa.vert.glsl"
			}
		});

		this.addEventListener("js:canvas:ready", () => this.ready());
		this.addEventListener("js:canvas:resize", () => this.resize());
	}
}
