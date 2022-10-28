class NWAElement extends HTMLElement {
	private boilerplate: ThreeBoilerplate;
	private camera: THREE.PerspectiveCamera;
	private ground: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
	private cursor: { x: number, y: number } = { x: 0, y: 0 };
	private raycaster: THREE.Raycaster;

	ready(): void {
		const { width, height } = this.boilerplate.canvas.getBoundingClientRect();

		this.camera = new THREE.PerspectiveCamera(50, width / height);
		this.raycaster = new THREE.Raycaster();

		this.ground = new THREE.Mesh(
			new THREE.PlaneGeometry(30, 30, 60, 60),
			new THREE.ShaderMaterial({
				vertexShader: this.boilerplate.shaders["nwa.vert"],
				fragmentShader: this.boilerplate.shaders["nwa.frag"],
				uniforms: {
					alphaColor: { value: new THREE.Color(0x04724D) },
					betaColor: { value: new THREE.Color(0x8AE9C1) },
					cursor: { value: new THREE.Vector3(0, 0) },
				}
			})
		);
		
		this.ground.lookAt(0, 1, 0);
		
		this.camera.position.set(0, 1.5, -3);
		this.camera.lookAt(0, 1, 0);

		this.boilerplate.scene.add(this.camera, this.ground);


		this.render();
	}

	updateCursor(): void {
		if (this.raycaster) {
			const { top, left } = this.getBoundingClientRect();

			let lookX = ((this.cursor.x - left) / window.innerWidth) * 2 - 1;
			let lookY = -((this.cursor.y - top) / window.innerHeight) * 2 + 1;

			this.raycaster.setFromCamera(new THREE.Vector2(lookX, lookY), this.camera);

			const intersects = new THREE.Vector3();
			const didIntersect = this.raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), intersects);

			if (didIntersect) {
				this.ground.material.uniforms.cursor.value.copy(intersects);
			}
		}
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
		this.addEventListener("js:canvas:resize", () => this.updateCursor());

		this.querySelector("button[name=continue]").addEventListener("click", () => {
			this.nextElementSibling
			.scrollIntoView({
				behavior: "smooth"
			});
		});
		
		window.addEventListener("mousemove", event => {
			this.cursor.x = event.clientX;
			this.cursor.y = event.clientY;

			this.updateCursor();
		}, { passive: true });

		window.addEventListener("scroll", () => {
			this.updateCursor();
		}, { passive: true });
	}
}
