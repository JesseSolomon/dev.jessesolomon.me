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
        document.body.addEventListener("js:loaded", () => this.setup());
    }
    setup() {
        this.classList.add("loaded");
        window.addEventListener("resize", () => this.resize());
        this.canvas = this.querySelector("canvas");
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true
        });
        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
            ...this.shaders,
            transparent: true,
            uniforms: {
                time: { value: this.start - Date.now() }
            }
        }));
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
        let top, right, bottom, left;
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
        this.plane.scale.set((width > height ? width / height : 1) * 2, (width < height ? height / width : 1) * 2, 0);
    }
    render(animate) {
        this.plane.material.uniforms.time.value = this.start - Date.now();
        this.renderer.render(this.scene, this.camera);
        if (animate)
            requestAnimationFrame(() => this.render(true));
    }
    connectedCallback() {
        new Promise(async (resolve) => {
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
}
/**
 * Allowes elements to hold on the loading screen, ended by `TimeoutEndEvent`, must be declared before `load`
 */
class TimeoutStartEvent extends Event {
    constructor() {
        super("js:timeout:start", { bubbles: true });
    }
}
/**
 * Ends a load timeout
 */
class TimeoutEndEvent extends Event {
    constructor() {
        super("js:timeout:end", { bubbles: true });
    }
}
/**
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
}
var ScrollBehavior;
(function (ScrollBehavior) {
    let scrollStylesheet;
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
        const rule = scrollStylesheet.cssRules.item(0);
        rule.style.setProperty("--scroll", window.scrollY.toString());
    }
    ScrollBehavior.updateScrollVars = updateScrollVars;
    /**
     * Adds `scroll`, and `resize` listeners to window.
     * Initializes global scroll stylesheet
     */
    function initialize() {
        window.addEventListener("scroll", () => updateScrollVars());
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
