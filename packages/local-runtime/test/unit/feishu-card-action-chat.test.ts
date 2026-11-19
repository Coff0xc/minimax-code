import { describe, expect, it } from 'vitest';

import { createFeishuCardActionHandler } from '../../src/api/host-feishu-card-action.js';
import type { FeishuPlatformAdapter } from '../../src/channels/adapters/feishu/feishu-adapter.js';
import type { LocalChannelQuestionnaireBridge } from '../../src/channels/questionnaire-bridge.js';
import type { FeishuPendingPermission } from '../../src/api/host-channel-pending.js';

function pending(chatId: string): FeishuPendingPermission {
  return {
    renderable: {
      requestId: 'perm_1',
      toolName: 'bash',
      reason: 'needs approval',
      ruleContents: [],
    },
    clientName: 'feishu:mavis',
    chatId,
    messageId: 'om_1',
    createdAtMs: 0,
  };
}

function handler(record: FeishuPendingPermission, applied: string[]) {
  const adapter = { patchCard: async () => undefined } as unknown as FeishuPlatformAdapter;
  return createFeishuCardActionHandler({
    agentName: 'mavis',
    feishuPlatformAdapter: adapter,
    feishuPendingQuestionnaires: new Map(),
    feishuPendingPermissions: new Map([[record.renderable.requestId, record]]),
    questionnaireBridge: {} as LocalChannelQuestionnaireBridge,
    applyPermissionReply: async (input) => {
      applied.push(input.behavior);
    },
    getAdapter: () => adapter,
  });
}

describe('Feishu card action chat binding', () => {
  it('does not settle a permission when open_chat_id is omitted', async () => {
    const applied: string[] = [];
    const response = await handler(pending('oc_real'), applied)({
      action: { value: { kind: 'permission_action', requestId: 'perm_1', behavior: 'always' } },
    });
    const body = (await response.json()) as { reason?: string };

    expect(body.reason).toBe('permission-chat-mismatch');
    expect(applied).toEqual([]);
  });

  it('settles a permission when open_chat_id matches the pending chat', async () => {
    const applied: string[] = [];
    const response = await handler(pending('oc_real'), applied)({
      open_chat_id: 'oc_real',
      action: { value: { kind: 'permission_action', requestId: 'perm_1', behavior: 'deny' } },
    });
    const body = (await response.json()) as { ok?: boolean; reason?: string };

    expect(body.ok).toBe(true);
    expect(body.reason).toBeUndefined();
    expect(applied).toEqual(['deny']);
  });
});
