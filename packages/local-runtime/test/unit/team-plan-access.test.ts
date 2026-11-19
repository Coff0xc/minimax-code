import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { routeLocalTeamApi } from '../../src/team/api.js';

const planId = 'plan_abcd1234';
let dataDir = '';

afterEach(async () => {
  if (dataDir) await rm(dataDir, { recursive: true, force: true });
  dataDir = '';
});

async function seedPlan(): Promise<void> {
  dataDir = await mkdtemp(join(tmpdir(), 'team-plan-access-'));
  const planDir = join(dataDir, 'plans', planId);
  await mkdir(join(planDir, 'tasks', 'task_1'), { recursive: true });
  await writeFile(
    join(planDir, 'plan.json'),
    JSON.stringify({
      plan: { title: 'secret plan' },
      state: {
        plan_id: planId,
        status: 'running',
        owner_session_id: 'sess_owner',
        cycle: 0,
        phase: 'producing',
        results: [{ task_id: 'task_1', status: 'done' }],
        engine_sessions: {},
        created_at: 1,
        updated_at: 1,
      },
    }),
  );
  await writeFile(join(planDir, 'tasks', 'task_1', 'deliverable.md'), 'secret deliverable\n');
}

function call(path: string, session?: string) {
  const url = new URL(`http://127.0.0.1${path}`);
  if (session) url.searchParams.set('from_session', session);
  return routeLocalTeamApi({
    dataDir,
    request: new Request(url),
    method: 'GET',
    parts: ['team', ...url.pathname.split('/').filter(Boolean).slice(1)],
    url,
    nowMs: () => 0,
    getSessionById: async () => undefined,
    isTeamDelegationEnabled: async () => true,
  });
}

describe('team plan reads', () => {
  it('rejects a plan detail read that does not name the owner session', async () => {
    await seedPlan();
    const response = await call(`/team/plan/${planId}`);

    expect(response.status).toBe(400);
  });

  it('rejects a plan detail read from another session', async () => {
    await seedPlan();
    const response = await call(`/team/plan/${planId}`, 'sess_other');

    expect(response.status).toBe(403);
  });

  it('returns the plan and deliverable to the owner session', async () => {
    await seedPlan();
    const detail = await call(`/team/plan/${planId}`, 'sess_owner');
    const deliverable = await call(
      `/team/plan/${planId}/tasks/task_1/deliverable`,
      'sess_owner',
    );

    expect(detail.status).toBe(200);
    expect(((await detail.json()) as { plan: { title: string } }).plan.title).toBe('secret plan');
    expect(deliverable.status).toBe(200);
    expect(((await deliverable.json()) as { content: string }).content).toContain(
      'secret deliverable',
    );
  });
});
