import { describe, expect, it } from 'vitest';

import { PluginSystemError } from '../../src/service/plugin-system/errors.js';
import { localPluginDirectoryName } from '../../src/service/plugin-system/plugin/runtime/package-storage.js';

describe('localPluginDirectoryName', () => {
  it('accepts a single directory segment', () => {
    expect(localPluginDirectoryName('demo-plugin')).toBe('demo-plugin');
  });

  it('rejects names that leave the plugins root', () => {
    for (const name of ['../etc', '..', '.', 'nested/name', 'nested\\name', 'bad\0name']) {
      expect(() => localPluginDirectoryName(name)).toThrow(PluginSystemError);
    }
  });
});
