import { describe, expect, it } from 'vitest';

import { wechatWebhookAuthorized } from '../../src/channels/wechat.js';

describe('wechat webhook token', () => {
  it('rejects a binding that never stored a webhook token', () => {
    expect(wechatWebhookAuthorized(undefined, undefined)).toBe(false);
    expect(wechatWebhookAuthorized('', 'anything')).toBe(false);
    expect(wechatWebhookAuthorized('   ', '   ')).toBe(false);
  });

  it('rejects a presented token that does not match', () => {
    expect(wechatWebhookAuthorized('expected', 'other')).toBe(false);
  });

  it('accepts the configured token', () => {
    expect(wechatWebhookAuthorized('expected', 'expected')).toBe(true);
  });
});
