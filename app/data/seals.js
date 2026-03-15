/**
 * MailSpec Seal Types
 * Thickness (inches) and weight (oz) values for tab/seal types
 * Used for self-mailer USPS automation compliance
 */

window.MailSpec = window.MailSpec || {};

window.MailSpec.SEALS = {
    'none': { thick: 0, weight: 0 },
    'wafer': { thick: 0.002, weight: 0.003 },      // Wafer tab
    'glue_dot': { thick: 0.004, weight: 0.001 },   // Fugitive glue dot
    'line_glue': { thick: 0.001, weight: 0.002 },  // Line of glue
    'perf_tab': { thick: 0.003, weight: 0.004 }    // Perforated tab strip
};
