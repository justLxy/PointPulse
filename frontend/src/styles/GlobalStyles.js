/**
 * Global Styles
 * Defines reset and base styles for the entire application
 * Reset styles adapted from:
 * - Modern Normalize: https://github.com/sindresorhus/modern-normalize
 * - Josh Comeau's CSS Reset: https://www.joshwcomeau.com/css/custom-css-reset/
 */

import { css, Global } from '@emotion/react';

const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  body {
    background-color: #f5f8fa;
    color: #333;
    line-height: 1.5;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button, 
  input, 
  textarea, 
  select {
    font-family: inherit;
  }

  img {
    max-width: 100%;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const GlobalStyles = () => <Global styles={globalStyles} />;

export default GlobalStyles; 