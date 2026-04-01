/**
 * Local extension workflow: open latest Qwen mail in temp mailbox.
 */
function toolNode(id, toolName, options) {
  return {
    kind: 'tool',
    id,
    toolName,
    input: options?.input,
    retry: options?.retry,
    timeoutMs: options?.timeoutMs,
  };
}

function sequenceNode(id, steps) {
  return { kind: 'sequence', id, steps };
}

/** @type {import('../../dist/src/server/workflows/WorkflowContract.js').WorkflowContract} */
const qwenMailOpenLatestWorkflow = {
  kind: 'workflow-contract',
  version: 1,
  id: 'workflow.qwen-mail-open-latest.v1',
  displayName: 'Qwen Mail Open Latest',
  description: 'Navigate mailbox, refresh, and open latest Qwen-related mail item if present.',
  tags: ['workflow', 'qwen', 'mail'],
  timeoutMs: 3 * 60_000,
  defaultMaxConcurrency: 1,

  build() {
    return sequenceNode('qwen-mail-open-latest-root', [
      toolNode('open-mailbox', 'page_navigate', {
        input: {
          url: 'https://www.linshiyouxiang.net',
          waitUntil: 'networkidle',
          timeout: 90000,
        },
      }),
      toolNode('refresh-mailbox', 'page_evaluate', {
        input: {
          code: `(() => {
            const btn = document.querySelector('#refresh-btn');
            if (btn && typeof btn.click === 'function') {
              btn.click();
              return { refreshed: true };
            }
            return { refreshed: false, reason: 'refresh_button_not_found' };
          })()`,
        },
      }),
      toolNode('open-qwen-mail', 'page_evaluate', {
        input: {
          code: `(() => {
            const anchors = [...document.querySelectorAll('a[href]')];
            const hit = anchors.find((a) => /qwen|active mail|activate|verify/i.test((a.textContent || '') + ' ' + (a.href || '')));
            if (!hit) {
              return { opened: false, reason: 'qwen_mail_not_found' };
            }
            const href = hit.href;
            window.location.href = href;
            return { opened: true, href, text: (hit.textContent || '').trim() };
          })()`,
        },
      }),
    ]);
  },
};

export default qwenMailOpenLatestWorkflow;
