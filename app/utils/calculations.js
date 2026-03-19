// app/utils/calculations.js
// Weight, thickness, and fold calculation utilities for MailSpec

(function() {
  window.MailSpec = window.MailSpec || {};
  window.MailSpec.Calculations = {

    /**
     * Calculate weight, thickness, and finished dimensions for a single component.
     * Returns { finW, finH, weightOz, itemThick }
     */
    calculateComponentMetrics: function(c) {
      var STOCKS = window.MailSpec.STOCKS;
      var COATINGS = window.MailSpec.COATINGS;

      var finW = c.w, finH = c.h, weightOz = 0, itemThick = 0;
      var coating = COATINGS[c.coating] || { weightAdd: 0 };

      // Custom panel mode: user-specified flat size, finished size, and layer count
      if (c.customPanels && c.flatWidth != null && c.flatHeight != null &&
          c.finishedWidth != null && c.finishedHeight != null && c.layersAtFold != null) {
        finW = c.finishedWidth;
        finH = c.finishedHeight;
        var flatArea = c.flatWidth * c.flatHeight;
        weightOz = (flatArea / 1550.0031) * c.gsm * 0.035274;
        var ply = parseInt(c.layersAtFold);
        var bulge = ply > 1 ? 1.1 + (ply * 0.02) : 1.0;
        itemThick = c.caliper * ply * bulge;
      } else if (c.type === 'envelope') {
        var area = c.w * c.h * 2.1;
        weightOz = (area / 1550.0031) * c.gsm * 0.035274;
        itemThick = c.caliper * 2 * 1.1;
      } else if (c.type === 'sheet' || c.type === 'selfmailer') {
        var flatArea = c.w * c.h;
        weightOz = (flatArea / 1550.0031) * c.gsm * 0.035274;
        var ply = parseInt(c.fold);
        var bulge = ply > 1 ? 1.1 + (ply * 0.02) : 1.0;
        if (c.foldAxis === 'h') finH = c.h / ply; else finW = c.w / ply;
        itemThick = c.caliper * ply * bulge;
      } else if (c.type === 'accordion') {
        var flatArea = c.w * c.h;
        weightOz = (flatArea / 1550.0031) * c.gsm * 0.035274;
        var ply = parseFloat(c.panels) || 1;
        var bulge = ply > 1 ? 1.1 + (ply * 0.02) : 1.0;
        if (c.foldAxis === 'h') finH = c.h / ply; else finW = c.w / ply;
        itemThick = c.caliper * ply * bulge;
      } else if (c.type === 'booklet') {
        var bodyPages = c.panels;
        var hasCover = c.coverStockIdx != -1;
        if (hasCover) bodyPages -= 4;
        var bodyWeight = 0;
        if (bodyPages > 0) {
          var bodyArea = (c.w * c.h * 2) * (bodyPages / 4);
          bodyWeight = (bodyArea / 1550.0031) * STOCKS[c.stockIdx].gsm * 0.035274;
        }
        var covIdx = hasCover ? c.coverStockIdx : c.stockIdx;
        var coverArea = c.w * 2 * c.h;
        var coverWeight = (coverArea / 1550.0031) * STOCKS[covIdx].gsm * 0.035274;
        weightOz = bodyWeight + coverWeight;
        var bodyThick = bodyPages > 0 ? STOCKS[c.stockIdx].cal * (bodyPages / 2) : 0;
        var coverThick = STOCKS[covIdx].cal * 2;
        var bulge = c.binding === 'stitch' ? 1.25 : 1.05;
        var glueThick = c.binding === 'paste' ? 0.015 : 0;
        itemThick = ((bodyThick + coverThick) * bulge) + glueThick;
      } else {
        var area = c.w * c.h;
        weightOz = (area / 1550.0031) * c.gsm * 0.035274;
        itemThick = c.caliper;
      }

      // Add coating weight
      weightOz *= (1 + coating.weightAdd);

      // Apply manual overrides
      if (c.manualWeight !== null) weightOz = c.manualWeight;
      if (c.manualThick !== null) itemThick = c.manualThick;

      return { finW: finW, finH: finH, weightOz: weightOz, itemThick: itemThick };
    },

    /**
     * Apply global weight buffer percentage to total weight.
     */
    applyWeightBuffer: function(totalWeightOz, bufferPercent) {
      if (bufferPercent > 0) totalWeightOz *= (1 + bufferPercent / 100);
      return totalWeightOz;
    },

    /**
     * Apply global thickness buffer percentage to total thickness and tolerance.
     * Returns { thickness, toleranceSum }
     */
    applyThicknessBuffer: function(totalThickness, totalToleranceSum, bufferPercent) {
      if (bufferPercent > 0) {
        totalThickness *= (1 + bufferPercent / 100);
        totalToleranceSum *= (1 + bufferPercent / 100);
      }
      return { thickness: totalThickness, toleranceSum: totalToleranceSum };
    },

    /**
     * Apply global seal additions to totals.
     * Returns { thickness, weightOz }
     */
    applySeals: function(totalThickness, totalWeightOz, sealType, sealQty) {
      var SEALS = window.MailSpec.SEALS;
      if (sealType !== 'none' && sealQty > 0) {
        var seal = SEALS[sealType];
        totalThickness += seal.thick * sealQty;
        totalWeightOz += seal.weight * sealQty;
      }
      return { thickness: totalThickness, weightOz: totalWeightOz };
    }

  };
})();
