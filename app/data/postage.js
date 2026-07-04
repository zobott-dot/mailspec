// USPS Notice 123 — July 2026 rates, effective 2026-07-12. FINAL (6/15/2026 file).
// Source: PRC Docket R2026-1, Order No. 9584 / pe.usps.com/PriceChange.
// DATA RULE (CLAUDE.md): rate values change only on Dave's explicit instruction.
window.MailSpec = window.MailSpec || {};

window.MailSpec.POSTAGE = {
  meta: {
    effectiveDate: '2026-07-12',
    verifiedDate: '2026-07-04',      // transcribed from the Final 6/15/2026 file
    status: 'final',
    source: 'USPS Notice 123 (July 2026, Final 6/15/2026), PRC Docket R2026-1'
  },

  // Marketing Mail automation letters, <= 3.5 oz. No letter rate above 3.5 oz.
  mmLetter: {
    maxOz: 3.5,
    tiers: ['5-Digit', '3-Digit', 'Mixed'],
    rates: {
      '5-Digit': { none: 0.395, dscf: 0.374 },
      '3-Digit': { none: 0.435, dscf: 0.414 },
      'Mixed':   { none: 0.467, dscf: null }
    }
  },

  // Marketing Mail automation flats. Piece rate to 4 oz; piece + pound 4-20 oz.
  mmFlat: {
    pieceRateMaxOz: 4,
    maxOz: 20,                        // July 2026: raised from 16 (FR 2026-11003)
    tiers: ['5-Digit', '3-Digit', 'Mixed'],
    rates: {
      '5-Digit': { none: 0.783, dscf: 0.742 },
      '3-Digit': { none: 1.021, dscf: 0.980 },
      'Mixed':   { none: 1.260, dscf: null }
    },
    // Over 4 oz: piece portion is entry-invariant; the discount is in the pound rate.
    piecePound: {
      piece: {
        '5-Digit': { none: 0.634, dscf: 0.634 },
        '3-Digit': { none: 0.872, dscf: 0.872 },
        'Mixed':   { none: 1.111, dscf: null }
      },
      perLb: { none: 0.797, dscf: 0.433 }
    }
  },

  // First-Class automation letters: single price per tier up to 3.5 oz. Origin only.
  fcLetter: {
    maxOz: 3.5,
    tiers: ['5-Digit', '3-Digit', 'Mixed'],
    rates: { '5-Digit': 0.621, '3-Digit': 0.672, 'Mixed': 0.707 }
  },

  // First-Class automation flats: "weight not over N oz" table, index = ceil(oz)-1.
  // Step is NOT constant (0.29 to 8 oz, 0.30 for 9-11, 0.31 for 12-13) — full table.
  fcFlat: {
    maxOz: 13,
    tiers: ['5-Digit', '3-Digit', 'Mixed'],
    byOz: {
      '5-Digit': [1.025, 1.315, 1.605, 1.895, 2.185, 2.475, 2.765, 3.055, 3.355, 3.655, 3.955, 4.265, 4.575],
      '3-Digit': [1.264, 1.554, 1.844, 2.134, 2.424, 2.714, 3.004, 3.294, 3.594, 3.894, 4.194, 4.504, 4.814],
      'Mixed':   [1.585, 1.875, 2.165, 2.455, 2.745, 3.035, 3.325, 3.615, 3.915, 4.215, 4.515, 4.825, 5.135]
    }
  }
};
