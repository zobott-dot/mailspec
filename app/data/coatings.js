/**
 * MailSpec Coating Presets
 * Weight addition percentages for common coatings applied to printed pieces
 * Values represent the fractional weight increase (e.g., 0.015 = 1.5%)
 */

window.MailSpec = window.MailSpec || {};

window.MailSpec.COATINGS = {
    'none': { label: 'None', weightAdd: 0 },
    'aqueous': { label: 'Aqueous', weightAdd: 0.015 },
    'uv': { label: 'UV Coating', weightAdd: 0.035 },
    'softtouch': { label: 'Soft-Touch Lam', weightAdd: 0.06 },
    'glosslam': { label: 'Gloss Lam', weightAdd: 0.06 }
};
