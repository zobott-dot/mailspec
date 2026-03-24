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

    // Specialty Folds (Custom Panel Mode)
    gateFold8x11: {
        type: 'selfmailer', name: 'Gate Fold',
        w: 17, h: 11, fold: '1', foldAxis: 'h',
        stockName: 'Sappi McCoy 100# Gloss Cover',
        customPanels: true,
        flatWidth: 17, flatHeight: 11,
        finishedWidth: 8.5, finishedHeight: 11,
        layersAtFold: 4
    },
    doubleGateFold: {
        type: 'selfmailer', name: 'Double Gate Fold',
        w: 25.5, h: 11, fold: '1', foldAxis: 'h',
        stockName: 'Sappi McCoy 100# Gloss Cover',
        customPanels: true,
        flatWidth: 25.5, flatHeight: 11,
        finishedWidth: 6.375, finishedHeight: 11,
        layersAtFold: 6
    },
    rollFold8x14: {
        type: 'sheet', name: 'Roll Fold (4-Panel)',
        w: 14, h: 8.5, fold: '1', foldAxis: 'h',
        stockName: 'Sappi McCoy 80# Gloss Text',
        customPanels: true,
        flatWidth: 14, flatHeight: 8.5,
        finishedWidth: 3.5, finishedHeight: 8.5,
        layersAtFold: 4
    },
    zFold8x11: {
        type: 'sheet', name: 'Z-Fold',
        w: 8.5, h: 11, fold: '1', foldAxis: 'h',
        stockName: 'Domtar Cougar 60# Text',
        customPanels: true,
        flatWidth: 8.5, flatHeight: 11,
        finishedWidth: 8.5, finishedHeight: 3.667,
        layersAtFold: 3
    },
    ironCross: {
        type: 'selfmailer', name: 'Iron Cross',
        w: 17, h: 22, fold: '1', foldAxis: 'h',
        stockName: 'Sappi McCoy 100# Gloss Cover',
        customPanels: true,
        flatWidth: 17, flatHeight: 22,
        finishedWidth: 8.5, finishedHeight: 11,
        layersAtFold: 4
    },
    frenchFold: {
        type: 'sheet', name: 'French Fold',
        w: 17, h: 11, fold: '1', foldAxis: 'h',
        stockName: 'Sappi McCoy 80# Gloss Text',
        customPanels: true,
        flatWidth: 17, flatHeight: 11,
        finishedWidth: 8.5, finishedHeight: 5.5,
        layersAtFold: 4
    },

    // Accordion Folds
    accordion4: { type: 'accordion', name: 'Accordion (4-Panel)', w: 28, h: 8.5, panels: 4, foldAxis: 'w', stockName: 'Sappi McCoy 80# Gloss Text' },
    accordion6: { type: 'accordion', name: 'Accordion (6-Panel)', w: 42, h: 8.5, panels: 6, foldAxis: 'w', stockName: 'Sappi McCoy 80# Gloss Text' },

    // Booklets — Self-Cover
    booklet_5x8_8sc: { type: 'booklet', name: '5.5×8.5 8pp SC', w: 5.5, h: 8.5, panels: 8, binding: 'stitch', stockName: 'Sappi McCoy 80# Gloss Text' },
    booklet_8x11_8sc: { type: 'booklet', name: '8.5×11 8pp SC', w: 8.5, h: 11, panels: 8, binding: 'stitch', stockName: 'Sappi McCoy 80# Gloss Text' },
    booklet_6x9_8sc: { type: 'booklet', name: '6×9 8pp SC', w: 6, h: 9, panels: 8, binding: 'stitch', stockName: 'Sappi McCoy 80# Gloss Text' },

    // Booklets — Plus-Cover (Saddle)
    booklet_5x8_8pc: { type: 'booklet', name: '5.5×8.5 8+4pp', w: 5.5, h: 8.5, panels: 12, binding: 'stitch', stockName: 'Sappi McCoy 80# Gloss Text', coverStockName: 'Sappi McCoy 80# Gloss Cover' },
    booklet_8x11_12pc: { type: 'booklet', name: '8.5×11 12+4pp', w: 8.5, h: 11, panels: 16, binding: 'stitch', stockName: 'Sappi McCoy 80# Gloss Text', coverStockName: 'Sappi McCoy 80# Gloss Cover' },
    booklet_8x11_16pc: { type: 'booklet', name: '8.5×11 16+4pp', w: 8.5, h: 11, panels: 20, binding: 'stitch', stockName: 'Sappi McCoy 80# Gloss Text', coverStockName: 'Sappi McCoy 80# Gloss Cover' },

    // Booklets — Perfect Bound
    booklet_8x11_32pb: { type: 'booklet', name: '8.5×11 32+4pp PB', w: 8.5, h: 11, panels: 36, binding: 'paste', stockName: 'Sappi McCoy 80# Gloss Text', coverStockName: 'Sappi McCoy 80# Gloss Cover' },

    // Cards
    cr80: { type: 'card', name: 'CR80 Card', w: 3.375, h: 2.125, stockName: '30mil PVC Card (CR80)' },
    businessCard: { type: 'card', name: 'Business Card', w: 3.5, h: 2, stockName: '14pt C2S Board' },
    magnet: { type: 'card', name: 'Magnet', w: 3.5, h: 4, stockName: '20mil Magnet Sheet' }
};
