class ResponsiveElement extends HTMLElement {
	sizingMode: "auto" | "desktop" | "tablet" | "phone" = "auto";
	currentSize: number = 1366;
	page: HTMLElement;

	updateSizing() {
		const { width } = this.page.getBoundingClientRect();

		let targetSize = 0;

		switch (this.sizingMode) {
			case "auto":
				const { height, top } = this.getBoundingClientRect();
				const progress = Math.max(-top, 0) / height;
				
				targetSize = 1200 * (1 - progress) + 380 * progress;
				break;
			case "desktop":
				targetSize = 1200;
				break;
			case "tablet":
				targetSize = 800;
				break;
			case "phone":
				targetSize = 380;
				break;
		}

		this.currentSize += Math.min(Math.abs(this.currentSize - targetSize), 30) * Math.sign(targetSize - this.currentSize);
		this.style.setProperty("--simulated-viewport-width", this.currentSize.toString() + "px");

		requestAnimationFrame(() => this.updateSizing());
	}

	connectedCallback() {
		this.page = this.querySelector(".responsive--page");

		this.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
			this.sizingMode = button.name as "auto" | "desktop" | "tablet" | "phone";
			button.parentElement.querySelector(".current").classList.remove("current");
			button.classList.add("current");
		}));

		this.updateSizing();
	}
}