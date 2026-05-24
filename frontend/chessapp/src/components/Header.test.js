import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../App';
import Header from './Header';

function renderHeader(initialPath = '/') {
  return render(
    <AuthContext.Provider
      value={{
        auth: null,
        logout: jest.fn(),
      }}
    >
      <MemoryRouter initialEntries={[initialPath]}>
        <Header />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

test('shows a delayed home-page notification and opens the dashboard', async () => {
  jest.useFakeTimers();

  renderHeader('/');

  const trigger = screen.getByRole('button', { name: /open notifications/i });

  expect(screen.queryByText(/time alert/i)).not.toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(10000);
  });

  expect(screen.getByLabelText('1 unread notification')).toBeInTheDocument();

  fireEvent.click(trigger);

  expect(screen.getByText('Time alert')).toBeInTheDocument();
  expect(screen.getByText(/You've been on the website for 10 seconds/i)).toBeInTheDocument();
  expect(screen.getByText('0 unread')).toBeInTheDocument();
  expect(screen.queryByLabelText('1 unread notification')).not.toBeInTheDocument();

  jest.useRealTimers();
});
