import '@testing-library/jest-dom/vitest';

// Global mocks for jsdom browser environment
if (typeof window !== 'undefined') {
  if (!window.IntersectionObserver) {
    class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {
        // Automatically trigger as intersecting in test environment
        this.callback([{ isIntersecting: true }]);
      }
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver;
    global.IntersectionObserver = MockIntersectionObserver;
  }

  if (!window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }

  if (!window.scrollTo) {
    window.scrollTo = () => {};
  }
}
