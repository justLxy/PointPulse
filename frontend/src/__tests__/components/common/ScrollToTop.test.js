/**
 * 场景：路由变化时应该自动滚动到页面顶部
 * 预期：当路由pathname改变时，window.scrollTo被调用且参数正确
 */
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ScrollToTop from '../../../components/common/ScrollToTop';

// Mock window.scrollTo
const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

describe('ScrollToTop', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
  });

  it('scrolls to top on component mount', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
      </MemoryRouter>
    );

    // Should call scrollTo when component mounts
    expect(mockScrollTo).toHaveBeenCalledTimes(1);
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  });

  it('scrolls to top when pathname changes', () => {
    // Test with different initial entries to simulate route change effect
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(mockScrollTo).toHaveBeenCalledTimes(1);
    
    unmount();
    
    // Render with different route
    render(
      <MemoryRouter initialEntries={['/events']}>
        <ScrollToTop />
      </MemoryRouter>
    );

    // Should have been called again for the new route
    expect(mockScrollTo).toHaveBeenCalledTimes(2);
    expect(mockScrollTo).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  });

  it('does not render any visible content', () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });
}); 