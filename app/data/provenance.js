/**
 * MailSpec Data Provenance
 * Maps stock source keys to their documentation references
 */

window.MailSpec = window.MailSpec || {};

window.MailSpec.PROVENANCE = {
    sappi: {
        publisher: 'Sappi North America',
        document: 'Product Specifications Guide',
        url: 'https://www.sappi.com/printing-papers',
        verified: '2025-06',
        notes: 'McCoy, Flo, Opus, Somerset lines'
    },
    domtar: {
        publisher: 'Domtar / Paper Excellence',
        document: 'Paper Specifications',
        url: 'https://www.domtar.com/en/paper',
        verified: '2025-06',
        notes: 'Cougar, Lynx, Husky lines'
    },
    mohawk: {
        publisher: 'Mohawk Fine Papers',
        document: 'Product Specifications',
        url: 'https://www.mohawkconnects.com',
        verified: '2025-06',
        notes: 'Superfine, Via, Options lines'
    },
    neenah: {
        publisher: 'Neenah Paper (Ahlstrom)',
        document: 'Product Specifications',
        url: 'https://www.neenahpaper.com',
        verified: '2025-06',
        notes: 'Classic Crest, Linen, Environment lines'
    },
    finch: {
        publisher: 'Finch Paper',
        document: 'Product Specifications',
        url: 'https://www.finchpaper.com',
        verified: '2025-06',
        notes: 'Fine, Opaque lines'
    },
    ip: {
        publisher: 'International Paper',
        document: 'Paper Specifications',
        url: 'https://www.internationalpaper.com',
        verified: '2025-06',
        notes: 'Hammermill, Accent, Springhill lines'
    },
    industry: {
        publisher: 'Industry standard',
        document: 'Common trade specifications',
        url: null,
        verified: '2025-06',
        notes: 'Envelopes, boards, specialty items'
    },
    custom: {
        publisher: 'User-defined',
        document: null,
        url: null,
        verified: null,
        notes: 'Custom stocks added by user'
    }
};
