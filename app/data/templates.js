/**
 * MailSpec Component Templates
 * Pre-built component configurations for common mail piece types
 * Includes outer envelopes, reply envelopes, self-mailers, inserts, and cards
 */

window.MailSpec = window.MailSpec || {};

window.MailSpec.TEMPLATES = {
    // Outer Envelopes
    env10: { type: 'envelope', name: '#10 Envelope', w: 9.5, h: 4.125, stockName: '24# White Wove Envelope' },
    env6x9: { type: 'envelope', name: '6×9 Envelope', w: 9, h: 6, stockName: '24# White Wove Envelope' },
    env9x12: { type: 'envelope', name: '9×12 Envelope', w: 12, h: 9, stockName: '28# White Wove Envelope' },
    envA7: { type: 'envelope', name: 'A7 Envelope', w: 7.25, h: 5.25, stockName: '24# White Wove Envelope' },
    envA2: { type: 'envelope', name: 'A2 Envelope', w: 5.75, h: 4.375, stockName: '24# White Wove Envelope' },

    // Reply Envelopes - NEW
    bre9: { type: 'envelope', name: '#9 BRE', w: 8.875, h: 3.875, stockName: '24# White Wove Envelope' },
    env6_75: { type: 'envelope', name: '#6-3/4 Remit', w: 6.5, h: 3.625, stockName: '24# White Wove Envelope' },
    cre: { type: 'envelope', name: 'CRE (#10)', w: 9.5, h: 4.125, stockName: '24# White Wove Envelope' },

    // Self-Mailers
    postcard4x6: { type: 'selfmailer', name: '4×6 Postcard', w: 6, h: 4, fold: '1', stockName: 'Sappi McCoy 100# Gloss Cover' },
    postcard6x9: { type: 'selfmailer', name: '6×9 Postcard', w: 9, h: 6, fold: '1', stockName: 'Sappi McCoy 100# Gloss Cover' },
    selfmailer6x9: { type: 'selfmailer', name: '6×9 Bi-Fold', w: 12, h: 9, fold: '2', foldAxis: 'w', stockName: 'Sappi McCoy 100# Gloss Cover' },

    // Inserts
    letter: { type: 'sheet', name: 'Letter (Tri-Fold)', w: 8.5, h: 11, fold: '3', foldAxis: 'h', stockName: 'Domtar Cougar 60# Text' },
    brochure: { type: 'sheet', name: 'Brochure', w: 8.5, h: 11, fold: '3', foldAxis: 'w', stockName: 'Sappi McCoy 100# Gloss Text' },
    buckslip: { type: 'sheet', name: 'Buck Slip', w: 8.5, h: 3.5, fold: '1', stockName: 'Sappi McCoy 80# Gloss Text' },

    // Cards
    cr80: { type: 'card', name: 'CR80 Card', w: 3.375, h: 2.125, stockName: '30mil PVC Card (CR80)' },
    businessCard: { type: 'card', name: 'Business Card', w: 3.5, h: 2, stockName: '14pt C2S Board' },
    magnet: { type: 'card', name: 'Magnet', w: 3.5, h: 4, stockName: '20mil Magnet Sheet' }
};
