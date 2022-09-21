class NWAElement extends HTMLElement {
	private boilerplate: ThreeBoilerplate;
	private camera: THREE.PerspectiveCamera;
	private ground: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
	private cursor: { x: number, y: number } = { x: 0, y: 0 };

	ready(): void {
		const { width, height } = this.boilerplate.canvas.getBoundingClientRect();

		this.camera = new THREE.PerspectiveCamera(50, width / height);

		this.ground = new THREE.Mesh(
			new THREE.PlaneGeometry(30, 30, 60, 60),
			new THREE.ShaderMaterial({
				vertexShader: this.boilerplate.shaders["nwa.vert"],
				fragmentShader: this.boilerplate.shaders["nwa.frag"],
				uniforms: {
					alphaColor: { value: new THREE.Color(0x04724D) },
					betaColor: { value: new THREE.Color(0x8AE9C1) },
					blend: { value: 1.0 }
				}
			})
		);

		this.ground.lookAt(0, 1, 0);

		this.boilerplate.scene.add(this.camera, this.ground);

		this.camera.position.set(0, 1.5, -3);
		this.camera.lookAt(0, 1, 0);

		this.render();
	}

	resize(): void {

	}

	render(): void {
		const { top, height } = this.boilerplate.canvas.getBoundingClientRect();

		let lookX = (this.cursor.x / window.innerWidth - 0.5) * 2;
		let lookY = (this.cursor.y / window.innerWidth - 0.5) * 2;

		this.ground.material.uniforms.blend.value = Math.max((top + height / 2) - (window.innerHeight / 2), 0.0) / (window.innerHeight / 2);

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
		
		window.addEventListener("mousemove", event => {
			const { top, left } = this.getBoundingClientRect();

			this.cursor.x = event.clientX - left;
			this.cursor.y = event.clientY - top;
		});
	}
}
