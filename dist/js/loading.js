class LoadingElement extends HTMLElement {
    constructor() {
        super();
        window.addEventListener("load", () => {
            this.classList.add("loaded");
        });
    }
}
customElements.define("js-loading", LoadingElement);
