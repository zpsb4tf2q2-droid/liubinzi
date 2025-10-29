import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';

describe('Button component', () => {
  it('renders the provided label', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls the onClick handler when pressed', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Press</Button>);

    await user.click(screen.getByRole('button', { name: 'Press' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
