class IntroElement extends HTMLElement {
    constructor() {
		super();

		window.addEventListener("load", () => {
			this.classList.add("loaded");
		});
	}
}

customElements.define("js-intro", IntroElement);