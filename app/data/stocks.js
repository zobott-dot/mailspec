/**
 * MailSpec Paper Stock Database
 * Sources: Sappi, Domtar, Mohawk, Neenah, Finch, International Paper manufacturer spec sheets
 * Industry standards for envelopes, boards, and specialty items
 * Last verified: June 2025
 */

window.MailSpec = window.MailSpec || {};

window.MailSpec.STORAGE_KEY_CUSTOM_STOCKS = 'mailspec_custom_stocks';

window.MailSpec.STOCKS = [
    // SAPPI
    { name: "Sappi McCoy 80# Gloss Text", cal: 0.0035, gsm: 118, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi McCoy 100# Gloss Text", cal: 0.0046, gsm: 148, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi McCoy 80# Silk Text", cal: 0.0038, gsm: 118, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi McCoy 100# Silk Text", cal: 0.0049, gsm: 148, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi McCoy 80# Matte Text", cal: 0.0038, gsm: 118, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi McCoy 100# Matte Text", cal: 0.0049, gsm: 148, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi McCoy 80# Gloss Cover", cal: 0.0070, gsm: 216, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi McCoy 100# Gloss Cover", cal: 0.0087, gsm: 270, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi McCoy 80# Silk Cover", cal: 0.0075, gsm: 216, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi McCoy 100# Silk Cover", cal: 0.0095, gsm: 270, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Flo 80# Gloss Text", cal: 0.0032, gsm: 118, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Flo 100# Gloss Text", cal: 0.0042, gsm: 148, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Flo 80# Matte/Dull Text", cal: 0.0035, gsm: 118, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Flo 100# Matte/Dull Text", cal: 0.0045, gsm: 148, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Flo 80# Gloss Cover", cal: 0.0068, gsm: 216, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Flo 100# Gloss Cover", cal: 0.0085, gsm: 270, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Flo 80# Matte/Dull Cover", cal: 0.0072, gsm: 216, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Flo 100# Matte/Dull Cover", cal: 0.0090, gsm: 270, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Opus 70# Gloss Text", cal: 0.0030, gsm: 104, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Opus 80# Gloss Text", cal: 0.0034, gsm: 118, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Somerset Velvet 80# Text", cal: 0.0055, gsm: 118, type: 'Text', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Somerset Velvet 80# Cover", cal: 0.0100, gsm: 216, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Somerset Gloss 82# Cover (9pt)", cal: 0.0090, gsm: 222, type: 'Cover', source: 'sappi', tolerance: 0.05 },
    { name: "Sappi Somerset Gloss 87# Cover (9pt)", cal: 0.0090, gsm: 235, type: 'Cover', source: 'sappi', tolerance: 0.05 },

    // DOMTAR
    { name: "Domtar Cougar 60# Text", cal: 0.0046, gsm: 89, type: 'Text', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Cougar 70# Text", cal: 0.0052, gsm: 104, type: 'Text', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Cougar 80# Text", cal: 0.0059, gsm: 118, type: 'Text', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Cougar 100# Text", cal: 0.0075, gsm: 148, type: 'Text', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Cougar 65# Cover", cal: 0.0088, gsm: 176, type: 'Cover', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Cougar 80# Cover", cal: 0.0109, gsm: 216, type: 'Cover', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Cougar 100# Cover", cal: 0.0139, gsm: 270, type: 'Cover', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Lynx 60# Text", cal: 0.0044, gsm: 89, type: 'Text', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Lynx 70# Text", cal: 0.0050, gsm: 104, type: 'Text', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Lynx 80# Text", cal: 0.0057, gsm: 118, type: 'Text', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Husky 60# Offset", cal: 0.0042, gsm: 89, type: 'Text', source: 'domtar', tolerance: 0.05 },
    { name: "Domtar Husky 70# Offset", cal: 0.0048, gsm: 104, type: 'Text', source: 'domtar', tolerance: 0.05 },

    // MOHAWK
    { name: "Mohawk Superfine 80# Text Eggshell", cal: 0.0058, gsm: 118, type: 'Text', source: 'mohawk', tolerance: 0.05 },
    { name: "Mohawk Superfine 80# Cover Eggshell", cal: 0.0108, gsm: 216, type: 'Cover', source: 'mohawk', tolerance: 0.05 },
    { name: "Mohawk Superfine 100# Cover Eggshell", cal: 0.0130, gsm: 270, type: 'Cover', source: 'mohawk', tolerance: 0.05 },
    { name: "Mohawk Via 80# Text Vellum", cal: 0.0060, gsm: 118, type: 'Text', source: 'mohawk', tolerance: 0.05 },
    { name: "Mohawk Via 80# Cover Vellum", cal: 0.0110, gsm: 216, type: 'Cover', source: 'mohawk', tolerance: 0.05 },
    { name: "Mohawk Options 80# Text", cal: 0.0056, gsm: 118, type: 'Text', source: 'mohawk', tolerance: 0.05 },
    { name: "Mohawk Options 80# Cover", cal: 0.0105, gsm: 216, type: 'Cover', source: 'mohawk', tolerance: 0.05 },

    // NEENAH
    { name: "Neenah Classic Crest 80# Text", cal: 0.0056, gsm: 118, type: 'Text', source: 'neenah', tolerance: 0.05 },
    { name: "Neenah Classic Crest 80# Cover", cal: 0.0105, gsm: 216, type: 'Cover', source: 'neenah', tolerance: 0.05 },
    { name: "Neenah Classic Crest 100# Cover", cal: 0.0130, gsm: 270, type: 'Cover', source: 'neenah', tolerance: 0.05 },
    { name: "Neenah Classic Linen 80# Text", cal: 0.0058, gsm: 118, type: 'Text', source: 'neenah', tolerance: 0.05 },
    { name: "Neenah Classic Linen 80# Cover", cal: 0.0110, gsm: 216, type: 'Cover', source: 'neenah', tolerance: 0.05 },
    { name: "Neenah Environment 80# Text", cal: 0.0054, gsm: 118, type: 'Text', source: 'neenah', tolerance: 0.05 },
    { name: "Neenah Environment 80# Cover", cal: 0.0100, gsm: 216, type: 'Cover', source: 'neenah', tolerance: 0.05 },

    // FINCH
    { name: "Finch Fine 60# Text", cal: 0.0044, gsm: 89, type: 'Text', source: 'finch', tolerance: 0.05 },
    { name: "Finch Fine 70# Text", cal: 0.0050, gsm: 104, type: 'Text', source: 'finch', tolerance: 0.05 },
    { name: "Finch Fine 80# Text", cal: 0.0057, gsm: 118, type: 'Text', source: 'finch', tolerance: 0.05 },
    { name: "Finch Opaque 60# Text", cal: 0.0042, gsm: 89, type: 'Text', source: 'finch', tolerance: 0.05 },
    { name: "Finch Opaque 70# Text", cal: 0.0048, gsm: 104, type: 'Text', source: 'finch', tolerance: 0.05 },

    // INTERNATIONAL PAPER
    { name: "Hammermill Premium 24# Bond", cal: 0.0038, gsm: 90, type: 'Text', source: 'ip', tolerance: 0.05 },
    { name: "Hammermill Premium 28# Bond", cal: 0.0045, gsm: 105, type: 'Text', source: 'ip', tolerance: 0.05 },
    { name: "Hammermill Color Copy 80# Text", cal: 0.0055, gsm: 118, type: 'Text', source: 'ip', tolerance: 0.05 },
    { name: "Accent Opaque 60# Text", cal: 0.0043, gsm: 89, type: 'Text', source: 'ip', tolerance: 0.05 },
    { name: "Accent Opaque 70# Text", cal: 0.0049, gsm: 104, type: 'Text', source: 'ip', tolerance: 0.05 },
    { name: "Accent Opaque 80# Cover", cal: 0.0100, gsm: 216, type: 'Cover', source: 'ip', tolerance: 0.05 },
    { name: "Springhill 90# Index", cal: 0.0075, gsm: 163, type: 'Cover', source: 'ip', tolerance: 0.05 },
    { name: "Springhill 110# Index", cal: 0.0090, gsm: 199, type: 'Cover', source: 'ip', tolerance: 0.05 },

    // ENVELOPE / BOND
    { name: "24# White Wove Envelope", cal: 0.0040, gsm: 90, type: 'Env', source: 'industry', tolerance: 0.07 },
    { name: "28# White Wove Envelope", cal: 0.0050, gsm: 105, type: 'Env', source: 'industry', tolerance: 0.07 },
    { name: "24# Kraft Envelope", cal: 0.0042, gsm: 90, type: 'Env', source: 'industry', tolerance: 0.07 },

    // BOARDS
    { name: "9pt C1S Board", cal: 0.0090, gsm: 190, type: 'Cover', source: 'industry', tolerance: 0.05 },
    { name: "10pt C1S Board", cal: 0.0100, gsm: 220, type: 'Cover', source: 'industry', tolerance: 0.05 },
    { name: "12pt C1S Board", cal: 0.0120, gsm: 270, type: 'Cover', source: 'industry', tolerance: 0.05 },
    { name: "14pt C1S Board", cal: 0.0140, gsm: 310, type: 'Cover', source: 'industry', tolerance: 0.05 },
    { name: "10pt C2S Board", cal: 0.0100, gsm: 250, type: 'Cover', source: 'industry', tolerance: 0.08, note: 'Generic — verify against house stock' },
    { name: "12pt C2S Board", cal: 0.0120, gsm: 300, type: 'Cover', source: 'industry', tolerance: 0.08, note: 'Generic — verify against house stock' },
    { name: "14pt C2S Board", cal: 0.0140, gsm: 350, type: 'Cover', source: 'industry', tolerance: 0.08, note: 'Generic — verify against house stock' },
    { name: "16pt C2S Board", cal: 0.0160, gsm: 400, type: 'Cover', source: 'industry', tolerance: 0.08, note: 'Generic — verify against house stock' },

    // SPECIALTY
    { name: "30mil PVC Card (CR80)", cal: 0.0300, gsm: 1100, type: 'Item', source: 'industry', tolerance: 0.03 },
    { name: "20mil Magnet Sheet", cal: 0.0200, gsm: 1830, type: 'Item', source: 'industry', tolerance: 0.05 },
    { name: "15mil Magnet Sheet", cal: 0.0150, gsm: 1370, type: 'Item', source: 'industry', tolerance: 0.05 }
];

window.MailSpec.loadCustomStocks = function() {
    var STOCKS = window.MailSpec.STOCKS;
    var STORAGE_KEY_CUSTOM_STOCKS = window.MailSpec.STORAGE_KEY_CUSTOM_STOCKS;
    const custom = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_STOCKS) || '[]');
    custom.forEach(s => { if (!STOCKS.find(e => e.name === s.name)) STOCKS.push(s); });
};
