import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ShortlinkRedirect from '../../pages/ShortlinkRedirect';
import * as routeUtils from '../../constants/routes';
import api from '../../services/api';

jest.mock('../../services/api', () => ({
  get: jest.fn(),
  API_URL: 'https://example.com/api',
}));

jest.mock('../../pages/NotFound', () => () => <div>Not Found Page</div>);

jest.mock('../../components/common/LoadingSpinner', () => () => <div>Loading Spinner</div>);

describe('ShortlinkRedirect', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithSlug = (slug) => {
    return render(
      <MemoryRouter initialEntries={[`/${slug}`]}>
        <Routes>
          <Route path="/:slug" element={<ShortlinkRedirect />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('redirects to backend if slug exists', async () => {
    api.get.mockResolvedValueOnce({ data: { exists: true } });

    delete window.location;
    window.location = { replace: jest.fn() };

    renderWithSlug('valid-slug');

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/shortlinks/exists/valid-slug');
      expect(window.location.replace).toHaveBeenCalledWith(
        expect.stringContaining('/shortlinks/redirect/valid-slug')
      );
    });
  });

  it('shows NotFound if slug does not exist', async () => {
    api.get.mockResolvedValueOnce({ data: { exists: false } });

    renderWithSlug('nonexistent');

    await screen.findByText('Not Found Page');
  });

  it('shows NotFound if slug format is invalid', async () => {
    renderWithSlug('bad@slug!');

    await screen.findByText('Not Found Page');
  });

  it('shows NotFound if slug is in conflict list', async () => {
    jest.spyOn(routeUtils, 'hasRouteConflict').mockReturnValueOnce(true);

    renderWithSlug('conflict-slug');

    await screen.findByText('Not Found Page');
  });

  it('shows loading spinner during redirect process', () => {
    api.get.mockImplementation(() => new Promise(() => {}));

    renderWithSlug('loading-test');

    expect(screen.getByText('Loading Spinner')).toBeInTheDocument();
    expect(screen.getByText(/Redirecting to destination/i)).toBeInTheDocument();
  });

  it('shows NotFound if slug param is missing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<ShortlinkRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Not Found Page')).toBeInTheDocument();
  });
});
