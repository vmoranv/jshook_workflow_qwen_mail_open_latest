import {
  createWorkflow,
  SequenceNodeBuilder,
} from '@jshookmcp/extension-sdk/workflow';

const workflowId = 'workflow.qwen-mail-open-latest.v1';

export default createWorkflow(workflowId, 'Qwen Mail Open Latest')
  .description(
    'Navigate mailbox, refresh, and open latest Qwen-related mail item if present.',
  )
  .tags(['workflow', 'qwen', 'mail'])
  .timeoutMs(3 * 60_000)
  .defaultMaxConcurrency(1)
  .buildGraph(() => {
    const root = new SequenceNodeBuilder('qwen-mail-open-latest-root');

    root
      .tool('open-mailbox', 'page_navigate', {
        input: {
          url: 'https://www.linshiyouxiang.net',
          waitUntil: 'networkidle',
          timeout: 90000,
        },
      })
      .tool('refresh-mailbox', 'page_evaluate', {
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
      })
      .tool('open-qwen-mail', 'page_evaluate', {
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
      });

    return root;
  })
  .build();
