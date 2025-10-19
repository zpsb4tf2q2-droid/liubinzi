import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Hello from '../../components/Hello';


describe('Hello component', () => {
  it('renders and increments count', () => {
    render(<Hello name="Tester" />);
    expect(screen.getByText('Hello, Tester!')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /clicked/i });
    fireEvent.click(button);
    expect(button).toHaveTextContent('Clicked 1 times');
  });
});
