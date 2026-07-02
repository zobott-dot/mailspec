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
     * Classify a mail piece based on dimensions and thickness.
     * Returns { pClass, pSub, isFlat }
     */
    classifyPiece: function(width, height, totalThickness, hasComponents) {
      var ratio = this.calculateAspectRatio(width, height);
      var pClass = 'Letter', pSub = 'Automation', isFlat = false;
      if (!hasComponents) { pClass = '—'; pSub = 'Add components'; }
      else if (height < 3.5 || width < 5) { pClass = 'Non-Mailable'; pSub = 'Too Small'; }
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
      return 'Parcel';
    },

    /**
     * Look up postage rates based on classification and weight.
     * Returns { marketingRate, firstClassRate }
     */
    lookupPostage: function(postalClass, isFlat, totalWeightOz, hasComponents) {
      var POSTAGE = window.MailSpec.POSTAGE;
      var marketingRate = 0, firstClassRate = 0;
      if (hasComponents && postalClass !== 'Parcel' && postalClass !== 'Non-Mailable' && postalClass !== '—') {
        if (isFlat || postalClass === 'Flat') {
          marketingRate = POSTAGE.marketing.flat;
          firstClassRate = POSTAGE.firstClass.flat;
        } else {
          marketingRate = POSTAGE.marketing.letter;
          if (totalWeightOz <= 1) firstClassRate = POSTAGE.firstClass.letter1oz;
          else if (totalWeightOz <= 2) firstClassRate = POSTAGE.firstClass.letter2oz;
          else firstClassRate = POSTAGE.firstClass.letter3oz;
        }
      }
      return { marketingRate: marketingRate, firstClassRate: firstClassRate };
    },

    /**
     * Calculate tray capacity for 2-foot and 1-foot trays.
     * Returns { tray2Count, tray1Count, tray2Weight, tray1Weight, emm }
     */
    calculateTrayCapacity: function(maxW, maxH, totalThickness, totalWeightOz) {
      var tray2 = 21.0, tray1 = 10.25, emm = false;
      if (maxH > 6.125 || maxW > 11.5) { tray2 = 21.75; emm = true; }
      var c2 = totalThickness > 0 ? Math.floor((tray2 / totalThickness) * 0.85) : 0;
      var c1 = totalThickness > 0 ? Math.floor((tray1 / totalThickness) * 0.85) : 0;
      return {
        tray2Count: c2,
        tray1Count: c1,
        tray2Weight: (c2 * totalWeightOz) / 16,
        tray1Weight: (c1 * totalWeightOz) / 16,
        emm: emm
      };
    }

  };
})();
