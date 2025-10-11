import { describe, it, expect } from 'vitest';
import { askSupport } from './engine';

describe('askSupport', () => {
  it('returns known policy answer with citation for shipping question', async () => {
    const res = await askSupport('How long does standard shipping take?');
    const text = typeof res === 'string' ? res : (res as any).text;
    expect(text).toContain('Standard shipping takes');
    expect(text).toMatch(/\[Q\d+\]/);
  });

  it('refuses out-of-scope question', async () => {
    const res = await askSupport('What is the meaning of life?');
    const text = typeof res === 'string' ? res : (res as any).text;
    expect(text.toLowerCase()).toContain("don't have enough information");
  });

  it('returns order status when valid order id is present', async () => {
    const orderId = 'ABCDEF1234';
    const res = await askSupport(`Can you check order ${orderId} for me?`);
    const text = typeof res === 'string' ? res : (res as any).text;
    expect(text).toMatch(/Order \*{4}\d{4}/);
    expect(text.toLowerCase()).toContain('status');
  });
});
