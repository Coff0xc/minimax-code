import { describe, expect, it } from 'vitest';

import {
  createMcodePrefixUpdateStagingPrefix,
  isContainedMcodeStagingPrefix,
} from '../../src/update/prefix-update.js';

describe('isContainedMcodeStagingPrefix', () => {
  const active = process.platform === 'win32' ? 'C:\\MCode' : '/usr/local/mcode';

  it('accepts the staging directory the updater creates', () => {
    const staging = createMcodePrefixUpdateStagingPrefix(active, '1.2.3');
    expect(isContainedMcodeStagingPrefix(active, staging)).toBe(true);
  });

  it('rejects a staging prefix outside the install parent', () => {
    const outside = process.platform === 'win32' ? 'C:\\Users\\victim' : '/home/victim';
    expect(isContainedMcodeStagingPrefix(active, outside)).toBe(false);
    expect(isContainedMcodeStagingPrefix(active, active)).toBe(false);
  });
});
