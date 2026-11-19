import { describe, expect, it } from 'vitest';

import { unwrapCommandWrappers } from '../../../../src/tools/bash-wrapper-unwrap.js';

describe('unwrapCommandWrappers shell flag gaps', () => {
  it('sees the payload when POSIX options precede -c', () => {
    expect(unwrapCommandWrappers("bash --norc -c 'rm -rf /'")).toContain('rm -rf /');
    expect(unwrapCommandWrappers("bash -o errexit -c 'rm -rf /'")).toContain('rm -rf /');
    expect(unwrapCommandWrappers("bash -ec 'rm -rf /'")).toContain('rm -rf /');
  });

  it('sees a POSIX payload glued to the -c flag', () => {
    expect(unwrapCommandWrappers("bash -c'rm -rf /'")).toContain('rm -rf /');
  });

  it('still unwraps the plain bash -c form', () => {
    expect(unwrapCommandWrappers('bash -c "rm -rf /tmp/work"')).toContain('rm -rf /tmp/work');
  });

  it('sees a Windows payload glued to the inline flag', () => {
    expect(unwrapCommandWrappers('cmd /c"rmdir /s /q E:\\work"')).toContain('rmdir /s /q E:\\work');
    expect(unwrapCommandWrappers('powershell -c"Remove-Item E:\\work"')).toContain(
      'Remove-Item E:\\work',
    );
  });
});
