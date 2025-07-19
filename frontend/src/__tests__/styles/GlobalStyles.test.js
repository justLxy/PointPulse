import { render } from '@testing-library/react';
import GlobalStyles from '../../styles/GlobalStyles';


jest.mock('@emotion/react', () => {
  const React = require('react');
  return {
    css: (styles) => typeof styles === 'string' ? styles : styles.join(''),
    Global: ({ styles }) =>
      React.createElement('style', {
        'data-testid': 'global-styles',
        dangerouslySetInnerHTML: {
          __html: typeof styles === 'string' ? styles : styles.join(''),
        },
      }),
  };
});

describe('GlobalStyles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render Global component with styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const styleEl = getByTestId('global-styles');
      expect(styleEl).toBeInTheDocument();
      expect(styleEl.tagName).toBe('STYLE');
    });

    it('should apply CSS reset styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('margin: 0');
      expect(css).toContain('padding: 0');
      expect(css).toContain('box-sizing: border-box');
    });

    it('should apply font family styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('font-family');
      expect(css).toContain('Inter');
      expect(css).toContain('apple-system');
    });

    it('should apply body background and text styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('background-color: #f5f8fa');
      expect(css).toContain('color: #333');
      expect(css).toContain('line-height: 1.5');
    });

    it('should apply link styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('text-decoration: none');
      expect(css).toContain('color: inherit');
    });

    it('should apply form element styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('font-family: inherit');
    });

    it('should apply image styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('max-width: 100%');
    });
  });

  describe('Scrollbar Styles', () => {
    it('should apply webkit scrollbar base styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('::-webkit-scrollbar');
      expect(css).toContain('width: 8px');
      expect(css).toContain('height: 8px');
    });

    it('should apply scrollbar track styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('::-webkit-scrollbar-track');
      expect(css).toContain('background: #f1f1f1');
      expect(css).toContain('border-radius: 10px');
    });

    it('should apply scrollbar thumb styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('::-webkit-scrollbar-thumb');
      expect(css).toContain('background: #888');
      expect(css).toContain('border-radius: 10px');
    });

    it('should apply scrollbar thumb hover styles', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('::-webkit-scrollbar-thumb:hover');
      expect(css).toContain('background: #555');
    });
  });

  describe('Layout Styles', () => {
    it('should apply full height styles to html, body, #root', () => {
      const { getByTestId } = render(<GlobalStyles />);
      const css = getByTestId('global-styles').innerHTML;
      expect(css).toContain('height: 100%');
    });
  });

  describe('Integration', () => {
    it('should render without crashing', () => {
      expect(() => render(<GlobalStyles />)).not.toThrow();
    });

    it('should be a function component', () => {
      expect(typeof GlobalStyles).toBe('function');
    });
  });
});
