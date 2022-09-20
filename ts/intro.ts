class IntroElement extends HTMLElement {
	private start: number = Date.now();
	private canvas: HTMLCanvasElement;
	private scene: THREE.Scene;
	private camera: THREE.OrthographicCamera;
	private renderer: THREE.Renderer;
	private plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
	private shaders: { vertexShader: string, fragmentShader: string };

	setup() {
		this.classList.add("loaded");

		window.addEventListener("resize", () => this.resize());

		this.canvas = this.querySelector("canvas");
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(
			-1,
			1,
			1,
			-1,
			0.1,
			100
		);

		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			alpha: true
		});

		this.plane = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1),
			new THREE.ShaderMaterial({
				...this.shaders,
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

		this.scene.add(this.plane);
		this.scene.add(this.camera);

		this.resize();
		this.render(true);
	}

	resize() {
		let { width, height } = this.canvas.getBoundingClientRect();
		let top: number, right: number, bottom: number, left: number;

		// TODO: Cleaner aspect ratio implementation
		if (width > height) {
			top = 1;
			right = width / height;
			bottom = -1;
			left = -(width / height);
		}
		else {
			top = height / width;
			right = 1;
			bottom = -(height / width);
			left = -1;
		}

		this.camera.top = top;
		this.camera.right = right;
		this.camera.bottom = bottom;
		this.camera.left = left;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);

		this.plane.scale.set(
			(width > height ?  width / height : 1) * 2,
			(width < height ? height / width : 1) * 2,
			0
		);
	}

	render(animate: boolean) {
		this.plane.material.uniforms.time.value = this.start - Date.now();
		
		this.renderer.render(this.scene, this.camera);

		if (animate) requestAnimationFrame(() => this.render(true));
	}

	connectedCallback() {
		new Promise<{ vertexShader: string, fragmentShader: string }>(async resolve => {
			this.dispatchEvent(new TimeoutStartEvent());

			const vertexShader = await (await fetch("/glsl/simple.vert.glsl")).text();
			const fragmentShader = await (await fetch("/glsl/intro.frag.glsl")).text();

			resolve({ vertexShader, fragmentShader });
		})
		.then(shaders => {
			this.shaders = shaders;
			this.dispatchEvent(new TimeoutEndEvent());
		});
	}

    constructor() {
		super();

		document.body.addEventListener("js:loaded", () => this.setup());
	}
}
