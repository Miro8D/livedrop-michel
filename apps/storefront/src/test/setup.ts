import '@testing-library/jest-dom';

class MockIntersectionObserver implements IntersectionObserver {
	callback: IntersectionObserverCallback;
	root: Element | Document | null = null;
	rootMargin: string = '';
	thresholds: ReadonlyArray<number> = [0];
	constructor(cb: IntersectionObserverCallback) {
		this.callback = cb;
	}
	observe() {
		this.callback([
			{
				isIntersecting: true,
				intersectionRatio: 1,
				target: {} as Element,
				time: Date.now(),
				boundingClientRect: {} as DOMRectReadOnly,
				intersectionRect: {} as DOMRectReadOnly,
				rootBounds: null,
			} as IntersectionObserverEntry,
		], this);
	}
	unobserve() {
		return;
	}
	disconnect() {
		return;
	}
	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
}

(globalThis as any).IntersectionObserver = MockIntersectionObserver;