import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  it('renders product info and calls onAdd when button clicked', async () => {
    const user = userEvent.setup();
    const product = { id: 'P1', title: 'Test Product', price: 12.5, image: '/img.png', stockQty: 3 };
    const onAdd = vi.fn();

    render(<ProductCard product={product} onAdd={onAdd} />);

    // basic presence checks (avoid relying on jest-dom for now)
    expect(screen.getByText('Test Product')).toBeTruthy();
    expect(screen.getByText(/\$?12\.50/)).toBeTruthy();

    const btn = screen.getByRole('button', { name: /Quick Add to Cart/i });
    await user.click(btn);
    expect(onAdd).toHaveBeenCalled();
  });

  it('disables button when out of stock', () => {
    const product = { id: 'P2', title: 'No Stock', price: 5, stockQty: 0 };
    const onAdd = vi.fn();

    render(<ProductCard product={product} onAdd={onAdd} />);
    const outBtn = screen.getByRole('button', { name: /Out of Stock/i }) as HTMLButtonElement;
    expect(outBtn).toBeTruthy();
    expect(outBtn.disabled).toBe(true);
  });
});

