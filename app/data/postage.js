/**
 * USPS Postage Rates
 * Effective: July 2025 (estimated)
 * Source: USPS Rate Schedule / Federal Register
 * NOTE: Always verify rates against current USPS pricing before production use
 */

window.MailSpec = window.MailSpec || {};

window.MailSpec.POSTAGE = {
    marketing: {
        letter: 0.355,    // Marketing Mail Letter Automation 5-Digit
        flat: 0.56        // Marketing Mail Flat Automation
    },
    firstClass: {
        letter1oz: 0.64,  // First-Class Automation AADC
        letter2oz: 0.93,
        letter3oz: 1.22,
        flat: 1.60
    }
};
