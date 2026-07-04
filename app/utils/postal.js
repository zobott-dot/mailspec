// app/utils/postal.js
// USPS postal classification and postage utilities for MailSpec

(function() {
  window.MailSpec = window.MailSpec || {};
  window.MailSpec.Postal = {

    /**
     * Calculate aspect ratio (width / height).
     */
    calculateAspectRatio: function(width, height) {
      return height > 0 ? width / height : 0;
    },

    /**
     * DMM minimum thickness: 0.007", rising to 0.009" when the piece is
     * more than 4.25" high or more than 6" long (DMM 201, strict "more than").
     */
    getMinimumThickness: function(width, height) {
      return (height > 4.25 || width > 6) ? 0.009 : 0.007;
    },

    /**
     * Classify a mail piece based on dimensions and thickness.
     * Returns { pClass, pSub, isFlat }
     */
    classifyPiece: function(width, height, totalThickness, hasComponents) {
      var ratio = this.calculateAspectRatio(width, height);
      var pClass = 'Letter', pSub = 'Automation', isFlat = false;
      if (!hasComponents) { pClass = '—'; pSub = 'Add components'; }
      else if (height < 3.5 || width < 5) { pClass = 'Non-Mailable'; pSub = 'Too Small'; }
      else if (totalThickness < this.getMinimumThickness(width, height)) { pClass = 'Non-Mailable'; pSub = 'Too Thin'; }
      else if (width > 11.5 || height > 6.125 || totalThickness > 0.25) {
        pClass = 'Flat'; pSub = 'Large Envelope'; isFlat = true;
        if (width > 15 || height > 12 || totalThickness > 0.75) { pClass = 'Parcel'; pSub = 'Oversize'; }
      } else if (ratio < 1.3 || ratio > 2.5) { pSub = 'Non-Machinable'; }
      return { pClass: pClass, pSub: pSub, isFlat: isFlat };
    },

    /**
     * Select which component drives piece classification.
     * Envelopes are the mailing container and outrank their contents;
     * among multiple envelopes the largest-area one (the outer) wins.
     * With no envelope present, the largest-area component drives.
     * items: array of { name, type, finW, finH }
     * Returns { maxW, maxH, driverName, driverIsEnvelope }
     */
    selectDimensionDriver: function(items) {
      var driver = null;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var area = it.finW * it.finH;
        var isEnv = it.type === 'envelope';
        if (!driver) {
          driver = { name: it.name, finW: it.finW, finH: it.finH, area: area, isEnv: isEnv };
        } else if (isEnv && !driver.isEnv) {
          // First envelope always beats a non-envelope driver.
          driver = { name: it.name, finW: it.finW, finH: it.finH, area: area, isEnv: isEnv };
        } else if (isEnv === driver.isEnv && area > driver.area) {
          // Same kind: larger area wins. (A non-envelope never overrides an envelope.)
          driver = { name: it.name, finW: it.finW, finH: it.finH, area: area, isEnv: isEnv };
        }
      }
      if (!driver) return { maxW: 0, maxH: 0, driverName: '-', driverIsEnvelope: false };
      return { maxW: driver.finW, maxH: driver.finH, driverName: driver.name, driverIsEnvelope: driver.isEnv };
    },

    /**
     * Does content (cW x cH) fit inside an envelope (eW x eH), allowing a 90 deg rotation?
     * Conservative: compares against the envelope's OUTER dimensions, so it only flags
     * content that exceeds the envelope entirely — it does not model interior clearance.
     */
    fitsInsideEnvelope: function(cW, cH, eW, eH) {
      return (cW <= eW && cH <= eH) || (cW <= eH && cH <= eW);
    },

    /**
     * Determine weight status label for display.
     */
    getWeightStatus: function(totalWeightOz, hasComponents) {
      if (!hasComponents) return '—';
      if (totalWeightOz <= 1) return 'Machinable ≤1oz';
      if (totalWeightOz <= 3.5) return 'Std Letter ≤3.5oz';
      if (totalWeightOz <= 13) return 'Flat ≤13oz';
      if (totalWeightOz < 20) return 'MM Flat only <20oz';
      return 'Parcel';
    },

    /**
     * Generate postal risk warnings as the assembly approaches USPS
     * classification boundaries. Pure function — returns an array of
     * { level, text } (level: 'red' | 'amber' | 'info').
     */
    generatePostalWarnings: function(totalWeightOz, totalThickness, maxW, maxH, ratio, classification, hasComponents) {
        const warnings = [];
        if (!hasComponents) return warnings;

        const pClass = classification.pClass;

        // --- MINIMUM THICKNESS (DMM 201: ≥0.007"; ≥0.009" if height > 4.25" or length > 6") ---
        if (totalThickness > 0) {
            const minThick = this.getMinimumThickness(maxW, maxH);
            if (totalThickness < minThick) {
                const rule = minThick === 0.009
                    ? '0.009" minimum (applies to pieces over 4.25" high or 6" long)'
                    : '0.007" minimum';
                warnings.push({ level: 'red', text: `<strong>Thickness ${totalThickness.toFixed(4)}"</strong> — below the DMM ${rule}. Non-mailable as designed; add stock or components.` });
            }
        }

        // --- THICKNESS WARNINGS ---
        if (pClass === 'Letter') {
            const margin = (0.25 - totalThickness).toFixed(4);
            if (totalThickness >= 0.235) {
                warnings.push({ level: 'amber', text: `<strong>Thickness ${totalThickness.toFixed(4)}"</strong> — only ${margin}" from letter limit (0.25"). Adding components could push to Flat classification.` });
            } else if (totalThickness >= 0.200) {
                warnings.push({ level: 'info', text: `<strong>Thickness ${totalThickness.toFixed(4)}"</strong> — ${margin}" from letter limit (0.25").` });
            }
        }
        if (pClass === 'Flat') {
            const margin = (0.75 - totalThickness).toFixed(4);
            if (totalThickness >= 0.710) {
                warnings.push({ level: 'amber', text: `<strong>Thickness ${totalThickness.toFixed(4)}"</strong> — only ${margin}" from flat limit (0.75"). Adding components could push to Parcel.` });
            } else if (totalThickness >= 0.650) {
                warnings.push({ level: 'info', text: `<strong>Thickness ${totalThickness.toFixed(4)}"</strong> — ${margin}" from flat limit (0.75").` });
            }
        }

        // --- WEIGHT WARNINGS ---
        if (totalWeightOz <= 1.0) {
            const margin = (1.0 - totalWeightOz).toFixed(3);
            if (totalWeightOz >= 0.950) {
                warnings.push({ level: 'amber', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — only ${margin} oz from 1 oz tier. Adding components will increase first-class rate.` });
            } else if (totalWeightOz >= 0.850) {
                warnings.push({ level: 'info', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — ${margin} oz from 1 oz tier. First-class rate increases above 1 oz.` });
            }
        } else if (totalWeightOz <= 3.5) {
            const margin = (3.5 - totalWeightOz).toFixed(3);
            if (totalWeightOz >= 3.350) {
                warnings.push({ level: 'amber', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — only ${margin} oz from the 3.5 oz letter maximum. Above 3.5 oz, letter-size pieces take flat prices and preparation (dimensional classification is unchanged).` });
            } else if (totalWeightOz >= 3.000) {
                warnings.push({ level: 'info', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — ${margin} oz from 3.5 oz letter maximum.` });
            }
        } else if (totalWeightOz <= 13) {
            const margin = (13.0 - totalWeightOz).toFixed(3);
            if (totalWeightOz >= 12.500) {
                warnings.push({ level: 'amber', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — only ${margin} oz from the 13 oz First-Class flat maximum. Above 13 oz, First-Class is unavailable; Marketing Mail flats are permitted to just under 20 oz.` });
            } else if (totalWeightOz >= 11.500) {
                warnings.push({ level: 'info', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — ${margin} oz from the 13 oz First-Class flat maximum.` });
            }
        } else if (totalWeightOz < 20) {
            warnings.push({ level: 'amber', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — over the 13 oz First-Class limit. Marketing Mail flats only (permitted to just under 20 oz).` });
        } else {
            warnings.push({ level: 'red', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — at or over 20 oz. Outside Marketing Mail flats; parcel rates apply.` });
        }

        // --- DIMENSION WARNINGS ---
        if (pClass === 'Letter') {
            if (maxW >= 10.500) {
                const margin = (11.5 - maxW).toFixed(2);
                if (maxW >= 11.250) {
                    warnings.push({ level: 'amber', text: `<strong>Width ${maxW.toFixed(2)}"</strong> — only ${margin}" from letter limit (11.5"). Could push to Flat classification.` });
                } else {
                    warnings.push({ level: 'info', text: `<strong>Width ${maxW.toFixed(2)}"</strong> — ${margin}" from letter limit (11.5").` });
                }
            }
            if (maxH >= 5.625) {
                const margin = (6.125 - maxH).toFixed(3);
                if (maxH >= 5.975) {
                    warnings.push({ level: 'amber', text: `<strong>Height ${maxH.toFixed(2)}"</strong> — only ${margin}" from letter limit (6.125"). Could push to Flat classification.` });
                } else {
                    warnings.push({ level: 'info', text: `<strong>Height ${maxH.toFixed(2)}"</strong> — ${margin}" from letter limit (6.125").` });
                }
            }
        }

        // --- ASPECT RATIO WARNINGS ---
        if (pClass === 'Letter') {
            // Low end (boundary: 1.3)
            if (ratio > 0 && ratio < 1.30) {
                warnings.push({ level: 'red', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — below 1.3 minimum. Non-machinable surcharge applies.` });
            } else if (ratio <= 1.35) {
                const margin = (ratio - 1.3).toFixed(2);
                const msg = margin === '0.00'
                    ? 'at the 1.3 minimum — compliant, but designing at the limit; trim variance could trigger the non-machinable surcharge'
                    : `only ${margin} from 1.3 minimum. Adjusting dimensions could trigger non-machinable surcharge`;
                warnings.push({ level: 'amber', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — ${msg}.` });
            } else if (ratio <= 1.45) {
                const margin = (ratio - 1.3).toFixed(2);
                warnings.push({ level: 'info', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — ${margin} from 1.3 minimum for automation.` });
            }
            // High end (boundary: 2.5)
            if (ratio > 2.50) {
                warnings.push({ level: 'red', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — exceeds 2.5 maximum. Non-machinable surcharge applies.` });
            } else if (ratio >= 2.45) {
                const margin = (2.5 - ratio).toFixed(2);
                const msg = margin === '0.00'
                    ? 'at the 2.5 maximum — compliant, but designing at the limit; trim variance could trigger the non-machinable surcharge'
                    : `only ${margin} from 2.5 maximum. Adjusting dimensions could trigger non-machinable surcharge`;
                warnings.push({ level: 'amber', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — ${msg}.` });
            } else if (ratio >= 2.35) {
                const margin = (2.5 - ratio).toFixed(2);
                warnings.push({ level: 'info', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — ${margin} from 2.5 maximum for automation.` });
            }
        }

        return warnings;
    },

    /**
     * Look up postage as presort-tier ranges (5-Digit -> Mixed) per class.
     * Pure function: takes (pClass, weightOz), returns a structured result the
     * card can render as two rows. No DOM, no sort/entry selection.
     *
     * Return shape:
     *   {
     *     mm: { low, high, lowTier, highTier, dscfBest, note, requoted } | null,
     *     fc: { low, high, lowTier, highTier, note, requoted } | null,
     *     meta
     *   }
     * A class object with null low/high but a note means "priced out of range"
     * (over the flat weight cap) — the card shows the note and dashes the price.
     * A null class object means no estimate applies (the card dashes the row).
     */
    lookupPostage: function(pClass, weightOz) {
      var POSTAGE = window.MailSpec.POSTAGE;
      var meta = POSTAGE.meta;

      // Non-mailable / parcel / empty classification: no estimate.
      if (pClass === 'Parcel' || pClass === 'Non-Mailable' || pClass === '—' || !pClass) {
        return { mm: null, fc: null, meta: meta };
      }

      // Marketing Mail flat quote (also used to re-quote over-weight letters).
      var mmFlatQuote = function() {
        var mf = POSTAGE.mmFlat;
        // >= maxOz so exactly 20.00 oz dashes out, matching getWeightStatus' Parcel
        // (>= 20) red flag — never price a piece the warning engine red-flags.
        if (weightOz >= mf.maxOz) {
          return { low: null, high: null, lowTier: null, highTier: null, dscfBest: null,
                   note: 'At or over 20 oz — Marketing Mail flat maximum. Parcel pricing applies (not modeled).', requoted: false };
        }
        if (weightOz <= mf.pieceRateMaxOz) {
          return { low: mf.rates['5-Digit'].none, high: mf.rates['Mixed'].none,
                   lowTier: '5-Digit', highTier: 'Mixed',
                   dscfBest: mf.rates['5-Digit'].dscf, note: null, requoted: false };
        }
        // Over 4 oz: piece + pound. Piece portion is entry-invariant.
        var lbs = weightOz / 16;
        var pp = mf.piecePound;
        return {
          low: pp.piece['5-Digit'].none + pp.perLb.none * lbs,
          high: pp.piece['Mixed'].none + pp.perLb.none * lbs,
          lowTier: '5-Digit', highTier: 'Mixed',
          dscfBest: pp.piece['5-Digit'].dscf + pp.perLb.dscf * lbs,
          note: 'Piece + pound pricing (over 4 oz)', requoted: false
        };
      };

      // First-Class flat quote ("weight not over N oz" table).
      var fcFlatQuote = function() {
        var ff = POSTAGE.fcFlat;
        if (weightOz > ff.maxOz) {
          return { low: null, high: null, lowTier: null, highTier: null,
                   note: 'Over 13 oz — First-Class flat maximum.', requoted: false };
        }
        var idx = Math.max(0, Math.ceil(weightOz) - 1);
        return { low: ff.byOz['5-Digit'][idx], high: ff.byOz['Mixed'][idx],
                 lowTier: '5-Digit', highTier: 'Mixed', note: null, requoted: false };
      };

      // Letter path, <= 3.5 oz: single letter prices per tier.
      if (pClass === 'Letter' && weightOz <= POSTAGE.mmLetter.maxOz) {
        var mmL = POSTAGE.mmLetter.rates;
        var fcL = POSTAGE.fcLetter.rates;
        return {
          mm: { low: mmL['5-Digit'].none, high: mmL['Mixed'].none,
                lowTier: '5-Digit', highTier: 'Mixed',
                dscfBest: mmL['5-Digit'].dscf, note: null, requoted: false },
          fc: { low: fcL['5-Digit'], high: fcL['Mixed'],
                lowTier: '5-Digit', highTier: 'Mixed', note: null, requoted: false },
          meta: meta
        };
      }

      // Flat, or a letter-dims piece over 3.5 oz re-quoted as a flat.
      var requoted = (pClass === 'Letter');
      var mm = mmFlatQuote();
      var fc = fcFlatQuote();
      if (requoted) {
        var reNote = 'Letters over 3.5 oz pay flat prices and preparation';
        // Append, don't clobber: a heavy re-quoted letter keeps the flat quote's
        // own note (e.g. FC's "Over 13 oz" or MM's piece+pound explanation).
        mm.requoted = true; mm.note = mm.note ? (mm.note + ' ' + reNote) : reNote;
        fc.requoted = true; fc.note = fc.note ? (fc.note + ' ' + reNote) : reNote;
      }
      return { mm: mm, fc: fc, meta: meta };
    },

    /**
     * Calculate tray capacity for 2-foot and 1-foot letter trays.
     *
     * Modes:
     *  'letter' — counts apply. EMM trays (21.75" usable) are required when a
     *             letter-size piece exceeds MM tray inside dimensions:
     *             height > 4.625" or length > 10" (DMM/M033). EMM trays are
     *             2-ft only, so tray1Count is null when emm is true.
     *  'flat'   — flats are prepared in flat trays/sacks; letter-tray counts
     *             do not apply. All counts null.
     *  'none'   — Parcel, Non-Mailable, or empty assembly. All counts null.
     *
     * Returns { mode, emm, tray2Count, tray1Count, tray2Weight, tray1Weight }
     * (count/weight fields are null when inapplicable)
     */
    calculateTrayCapacity: function(maxW, maxH, totalThickness, totalWeightOz, pClass) {
      if (pClass !== 'Letter') {
        var mode = (pClass === 'Flat') ? 'flat' : 'none';
        return { mode: mode, emm: false, tray2Count: null, tray1Count: null, tray2Weight: null, tray1Weight: null };
      }
      var emm = (maxH > 4.625 || maxW > 10);
      var tray2 = emm ? 21.75 : 21.0;
      var c2 = totalThickness > 0 ? Math.floor((tray2 / totalThickness) * 0.85) : 0;
      var c1 = null;
      if (!emm) {
        c1 = totalThickness > 0 ? Math.floor((10.25 / totalThickness) * 0.85) : 0;
      }
      return {
        mode: 'letter',
        emm: emm,
        tray2Count: c2,
        tray1Count: c1,
        tray2Weight: (c2 * totalWeightOz) / 16,
        tray1Weight: c1 !== null ? (c1 * totalWeightOz) / 16 : null
      };
    }

  };
})();
