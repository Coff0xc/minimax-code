import { describe, expect, it } from 'vitest';
import { renderLatex } from '../../src/tui/engine/latex.js';

describe('renderLatex recursion cap', () => {
  it('renders a shallow expression', () => {
    expect(renderLatex('x+y')).toBe('x+y');
    expect(renderLatex('\\begin{equation}x\\end{equation}')).toBe('x');
  });

  it('rejects deeply nested braces without throwing', () => {
    const source = '{'.repeat(10_000);
    expect(() => renderLatex(source)).not.toThrow();
    expect(renderLatex(source)).toBeUndefined();
  });

  it('rejects deeply nested environments without throwing', () => {
    const source = `${'\\begin{equation}'.repeat(200)}x${'\\end{equation}'.repeat(200)}`;
    expect(() => renderLatex(source)).not.toThrow();
    expect(renderLatex(source)).toBeUndefined();
  });
});
