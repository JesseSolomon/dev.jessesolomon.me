const preferences = {
    muted: true
};
document.addEventListener("DOMContentLoaded", () => {
    console.log("[Lifecycle] DOM Loaded");
    ScrollBehavior.initialize();
    customElements.define("js-intro", IntroElement);
    customElements.define("js-loading", LoadingElement);
    customElements.define("js-nwa", NWAElement);
});
class IntroElement extends HTMLElement {
    constructor() {
        super();
        this.start = Date.now();
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
    ready() {
        this.classList.add("loaded");
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
            vertexShader: this.boilerplate.shaders["simple.vert"],
            fragmentShader: this.boilerplate.shaders["intro.frag"],
            transparent: true,
            uniforms: {
                time: { value: this.start - Date.now() }
            }
        }));
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
        this.plane.scale.set((width > height ? width / height : 1) * 2, (width < height ? height / width : 1) * 2, 0);
    }
    render() {
        this.plane.material.uniforms.time.value = this.start - Date.now();
        this.boilerplate.render(this.camera);
        requestAnimationFrame(() => this.render());
    }
    connectedCallback() {
        this.boilerplate = new ThreeBoilerplate({
            canvas: this.querySelector("canvas"),
            shaders: {
                "simple.vert": "/glsl/simple.vert.glsl",
                "intro.frag": "/glsl/intro.frag.glsl"
            }
        });
    }
}
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
        const timeoutPromise = new Promise(resolve => {
            document.body.addEventListener("js:timeout:start", () => {
                timeouts++;
            });
            document.body.addEventListener("js:timeout:end", () => {
                timeouts--;
                if (timeouts <= 0)
                    resolve();
            });
        });
        window.addEventListener("load", () => {
            console.log("[Lifecycle] Load");
            timeoutPromise.then(() => {
                console.log("[Lifecycle] Application Loaded");
                this.dispatchEvent(new ApplicationLoaded());
                this.classList.add("loaded");
            });
        });
    }
}
class NWAElement extends HTMLElement {
    constructor() {
        super();
        this.addEventListener("js:canvas:ready", () => this.ready());
        this.addEventListener("js:canvas:resize", () => this.resize());
    }
    ready() {
        const { width, height } = this.boilerplate.canvas.getBoundingClientRect();
        this.camera = new THREE.PerspectiveCamera(50, width / height);
        this.boilerplate.scene.add(this.camera);
        this.camera.position.set(0, 0, -2);
        this.camera.lookAt(0, 0, 0);
    }
    resize() {
    }
    render() {
    }
    connectedCallback() {
        this.boilerplate = new ThreeBoilerplate({
            canvas: this.querySelector("canvas")
        });
    }
}
var ScrollBehavior;
(function (ScrollBehavior) {
    let scrollStylesheet;
    let previousScroll;
    /**
     * Iterates over the given `element` parents, accumulating the static document offset
     */
    function resolveOffsetTop(element) {
        return (element.offsetTop +
            (element.offsetParent !== document.body
                ? resolveOffsetTop(element.offsetParent)
                : 0));
    }
    /**
     * Updates --client-height, --top vars on any element with [scroll-item]
     * As well as --viewport-height on `scrollStylesheet`
     * Heavy DOM IO, use sparingly
     */
    function updateLayoutVars() {
        const rule = scrollStylesheet.cssRules.item(0);
        rule.style.setProperty("--viewport-height", window.innerHeight.toString());
        const items = document.querySelectorAll("[scroll-item]");
        for (let item of items) {
            const { height } = item.getBoundingClientRect();
            const top = resolveOffsetTop(item);
            item.style.setProperty("--client-height", height.toString());
            item.style.setProperty("--top", top.toString());
        }
    }
    ScrollBehavior.updateLayoutVars = updateLayoutVars;
    /**
     * Updates --scroll var on `scrollStylesheet`
     */
    function updateScrollVars() {
        if (previousScroll !== window.scrollY) {
            const rule = scrollStylesheet.cssRules.item(0);
            rule.style.setProperty("--scroll", window.scrollY.toString());
            previousScroll = window.scrollY + 0;
        }
        requestAnimationFrame(() => updateScrollVars());
    }
    /**
     * Adds `scroll`, and `resize` listeners to window.
     * Initializes global scroll stylesheet
     */
    function initialize() {
        window.addEventListener("resize", () => updateLayoutVars());
        const scrollStylesheetElement = document.createElement("style");
        document.head.append(scrollStylesheetElement);
        scrollStylesheet = scrollStylesheetElement.sheet;
        scrollStylesheet.insertRule(`body { --scroll: 0; }`, 0);
        updateLayoutVars();
        updateScrollVars();
    }
    ScrollBehavior.initialize = initialize;
})(ScrollBehavior || (ScrollBehavior = {}));
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
    constructor(options) {
        this.shaders = {};
        this.canvas = options.canvas;
        if (options.shaders) {
            new Promise(async (resolve) => {
                this.canvas.dispatchEvent(new TimeoutStartEvent());
                for (let shader in options.shaders) {
                    this.shaders[shader] = await (await fetch(options.shaders[shader])).text();
                }
                resolve();
            })
                .then(() => {
                this.canvas.dispatchEvent(new TimeoutEndEvent());
            });
        }
        document.body.addEventListener("js:loaded", () => this.ready());
        window.addEventListener("resize", () => this.resize());
    }
    /**
     * Generates orthographic camera bounds from the `canvas` aspect-ratio.
     * Ranges from `-1` to `1` for top, right, bottom, and left.
     */
    orthographicBounds() {
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
    resize() {
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
    render(camera) {
        this.renderer.render(this.scene, camera);
    }
    /**
     * Invoked after any shaders are loaded.
     * - Sets up scene and renderer.
     * - Emits a `CanvasReadyEvent`.
     * - Resizes.
     */
    ready() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true
        });
        this.canvas.dispatchEvent(new CanvasReadyEvent());
        this.resize();
    }
}
//# sourceMappingURL=app.js.map