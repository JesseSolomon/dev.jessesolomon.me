namespace ScrollBehavior {
	let scrollStylesheet: CSSStyleSheet;
	let previousScroll: number;

	/**
	 * Iterates over the given `element` parents, accumulating the static document offset
	 */
	function resolveOffsetTop(element: HTMLElement): number {
		return (
			element.offsetTop +
			(element.offsetParent !== document.body
				? resolveOffsetTop(element.offsetParent as HTMLElement)
				: 0)
		);
	}

	/**
	 * Updates --client-height, --top vars on any element with [scroll-item]
	 * As well as --viewport-height on `scrollStylesheet`
	 * Heavy DOM IO, use sparingly
	 */
	export function updateLayoutVars() {
		const rule = scrollStylesheet.cssRules.item(0) as CSSStyleRule;

		rule.style.setProperty(
			"--viewport-height",
			window.innerHeight.toString()
		);

		const items = document.querySelectorAll<HTMLElement>("[scroll-item]");

		for (let item of items) {
			const { height } = item.getBoundingClientRect();
			const top = resolveOffsetTop(item);

			item.style.setProperty("--client-height", height.toString());
			item.style.setProperty("--top", top.toString());
		}
	}

	/**
	 * Updates --scroll var on `scrollStylesheet`
	 */
	function updateScrollVars() {
		if (previousScroll !== window.scrollY) {
			const rule = scrollStylesheet.cssRules.item(0) as CSSStyleRule;

			rule.style.setProperty("--scroll", window.scrollY.toString());
			previousScroll = window.scrollY + 0;
		}

		requestAnimationFrame(() => updateScrollVars());
	}

	/**
	 * Adds `scroll`, and `resize` listeners to window.
	 * Initializes global scroll stylesheet
	 */
	export function initialize() {
		window.addEventListener("resize", () => updateLayoutVars());

		const scrollStylesheetElement = document.createElement("style");

		document.head.append(scrollStylesheetElement);

		scrollStylesheet = scrollStylesheetElement.sheet;

		scrollStylesheet.insertRule(`body { --scroll: 0; }`, 0);

		updateLayoutVars();
		updateScrollVars();
	}
}