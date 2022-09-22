const preferences = {
	muted: true
};

document.addEventListener("DOMContentLoaded", () => {
	console.log("[Lifecycle] DOM Loaded");

    ScrollBehavior.initialize();

	customElements.define("js-intro", IntroElement);
	customElements.define("js-loading", LoadingElement);
	customElements.define("js-nwa", NWAElement);
	customElements.define("js-responsive", ResponsiveElement);
});