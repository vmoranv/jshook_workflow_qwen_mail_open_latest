import {
  createWorkflow,
  SequenceNodeBuilder,
} from '@jshookmcp/extension-sdk/workflow';

// =====================================================
// Workflow 1: Qwen Mail Activate Link Extractor
// =====================================================

const activateWorkflowId = 'workflow.qwen-mail-activate.v1';

export const qwenMailActivate = createWorkflow(activateWorkflowId, 'Qwen Mail Activate')
  .description('Open temp mailbox, refresh inbox, and extract Qwen activation/verify links.')
  .tags(['workflow', 'qwen', 'mail', 'activate'])
  .timeoutMs(3 * 60_000)
  .defaultMaxConcurrency(1)
  .buildGraph(() => {
    const root = new SequenceNodeBuilder('qwen-mail-activate-root');

    root
      .tool('open-mailbox', 'page_navigate', {
        input: {
          url: 'https://www.linshiyouxiang.net',
        },
      })
      .tool('refresh-inbox', 'page_press_key', {
        input: { key: 'F5' },
      })
      .tool('wait-load', 'page_wait_for_selector', {
        input: { selector: '.mail-list', timeout: 5000 },
      })
      .tool('extract-link', 'temp_mail_extract_link', {
        config: {
          linkPattern: '/activate',
        },
      });

    return root;
  });

// =====================================================
// Workflow 2: Qwen Mail Open Latest
// =====================================================

const openLatestWorkflowId = 'workflow.qwen-mail-open-latest.v1';

export const qwenMailOpenLatest = createWorkflow(openLatestWorkflowId, 'Qwen Mail Open Latest')
  .description('Navigate mailbox, refresh, and open latest Qwen-related mail item if present.')
  .tags(['workflow', 'qwen', 'mail'])
  .timeoutMs(3 * 60_000)
  .defaultMaxConcurrency(1)
  .buildGraph(() => {
    const root = new SequenceNodeBuilder('qwen-mail-open-latest-root');

    root
      .tool('open-mailbox', 'page_navigate', {
        input: {
          url: 'https://www.linshiyouxiang.net',
        },
      })
      .tool('refresh-inbox', 'page_press_key', {
        input: { key: 'F5' },
      })
      .tool('wait-load', 'page_wait_for_selector', {
        input: { selector: '.mail-list', timeout: 5000 },
      })
      .tool('open-latest', 'temp_mail_open_latest', {
        config: {
          subjectPattern: 'qwen',
        },
      });

    return root;
  });

// Default export: first workflow for backwards compatibility
export default qwenMailActivate;
