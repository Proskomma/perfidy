import { render, screen } from '@testing-library/react';
import App from './App';

test('renders something', () => {
  render(<App />);
  const linkElement = screen.getByText(/Build your Pipeline Here/i);
  expect(linkElement).toBeInTheDocument();
});
