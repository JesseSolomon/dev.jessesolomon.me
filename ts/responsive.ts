class ResponsiveElement extends HTMLElement {
	page: HTMLElement;

	breakpoints() {
		const { width } = this.page.getBoundingClientRect();

		this.classList.toggle("break--header", width <= 630);

		requestAnimationFrame(() => this.breakpoints());
	}

	connectedCallback() {
		this.page = this.querySelector(".responsive--page");

		this.breakpoints();
	}
}