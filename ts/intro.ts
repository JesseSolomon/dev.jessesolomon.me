class IntroElement extends HTMLElement {
	private boilerplate: ThreeBoilerplate;
	private start: number = Date.now();
	private camera: THREE.OrthographicCamera;
	private plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

	ready() {
		this.classList.add("loaded");

		this.camera = new THREE.OrthographicCamera(
			-1,
			1,
			1,
			-1,
			0.1,
			100
		);

		this.plane = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1),
			new THREE.ShaderMaterial({
				vertexShader: this.boilerplate.shaders["simple.vert"],
				fragmentShader: this.boilerplate.shaders["intro.frag"],
				transparent: true,
				uniforms: {
					time: { value: this.start - Date.now() }
				}
			})
		);

		this.plane.position.set(0, 0, 2);
		this.camera.position.set(0, 0, 0);
		this.plane.lookAt(0, 0, 0);

		this.camera.lookAt(0, 0, 1);

		this.boilerplate.scene.add(this.plane);
		this.boilerplate.scene.add(this.camera);

		this.render();
	}

	resize() {
		const { width, height } = this.boilerplate.canvas.getBoundingClientRect();
		const { top, right, bottom, left } = this.boilerplate.orthographicBounds();

		this.camera.top = top;
		this.camera.right = right;
		this.camera.bottom = bottom;
		this.camera.left = left;
		this.camera.updateProjectionMatrix();

		this.plane.scale.set(
			(width > height ?  width / height : 1) * 2,
			(width < height ? height / width : 1) * 2,
			0
		);
	}

	render() {
		this.plane.material.uniforms.time.value = this.start - Date.now();

		this.boilerplate.render(this.camera);

		requestAnimationFrame(() => this.render());
	}

    constructor() {
		super();

		this.boilerplate = new ThreeBoilerplate({
			canvas: this.querySelector("canvas"),
			shaders: {
				"simple.vert": "/glsl/simple.vert.glsl",
				"intro.frag": "/glsl/intro.frag.glsl"
			}
		});

		this.addEventListener("js:canvas:resize", () => this.resize());
		this.addEventListener("js:canvas:ready", () => this.ready());

		this.querySelector("button[name=with-audio]").addEventListener("click", () => {
			preferences.muted = false;
			document.querySelector("js-nwa")
			.scrollIntoView({
				behavior: "smooth"
			});
		});

		this.querySelector("button[name=without-audio]").addEventListener("click", () => {
			preferences.muted = true;
			document.querySelector("js-nwa")
			.scrollIntoView({
				behavior: "smooth"
			});
		});
	}
}
