import { describe, expect, it } from 'vitest';
import { wordWrapLine } from '../../src/tui/engine/components/editor.js';

describe('wordWrapLine wide graphemes', () => {
  it('wraps ordinary words on a boundary', () => {
    const chunks = wordWrapLine('hello world test', 11);
    expect(chunks.map((chunk) => chunk.text)).toEqual(['hello ', 'world test']);
  });

  it('emits one wide grapheme instead of recursing when the terminal is one column', () => {
    const chunks = wordWrapLine('中', 1);
    expect(chunks.map((chunk) => chunk.text)).toEqual(['中']);
  });

  it('keeps surrounding narrow characters as their own chunks', () => {
    const chunks = wordWrapLine('a中b', 1);
    expect(chunks.map((chunk) => chunk.text)).toEqual(['a', '中', 'b']);
    expect(chunks.map((chunk) => chunk.text).join('')).toBe('a中b');
  });

  it('emits an emoji that is wider than the terminal', () => {
    const chunks = wordWrapLine('😀', 1);
    expect(chunks.map((chunk) => chunk.text)).toEqual(['😀']);
  });

  it('still splits a paste marker that was merged into one segment', () => {
    const marker = '[paste #1 +2 lines]';
    const chunks = wordWrapLine(marker, 1, [{ segment: marker, index: 0, input: marker }]);
    expect(chunks.map((chunk) => chunk.text).join('')).toBe(marker);
    expect(chunks.length).toBe(marker.length);
  });
});
