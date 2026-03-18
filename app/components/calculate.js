// app/components/calculate.js
// Main calculation engine for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Components = window.MailSpec.Components || {};

    const State = window.MailSpec.State;
    const STOCKS = window.MailSpec.STOCKS;
    const COATINGS = window.MailSpec.COATINGS;
    const C = window.MailSpec.Components;

    function calculate() {
        const Calc = window.MailSpec.Calculations;
        const Postal = window.MailSpec.Postal;

        let totalWeightOz = 0, totalThickness = 0, totalToleranceSum = 0;
        let maxW = 0, maxH = 0, driverName = '-', hasEnvelope = false;

        const bomData = State.components.map(c => {
            // Validate stockIdx
            if (c.stockIdx < 0 || c.stockIdx >= STOCKS.length || !STOCKS[c.stockIdx]) {
                c.stockIdx = 0;
                c.caliper = STOCKS[0].cal;
                c.gsm = STOCKS[0].gsm;
            }

            const tol = STOCKS[c.stockIdx]?.tolerance || 0.05;
            const metrics = Calc.calculateComponentMetrics(c);
            const finW = metrics.finW, finH = metrics.finH;
            const weightOz = metrics.weightOz, itemThick = metrics.itemThick;

            if (c.type === 'envelope') hasEnvelope = true;

            const area = finW * finH;
            if (c.type === 'envelope' || (!hasEnvelope && area > maxW * maxH)) {
                maxW = finW; maxH = finH; driverName = c.name;
            }

            totalWeightOz += weightOz;
            totalThickness += itemThick;
            totalToleranceSum += itemThick * tol;

            const stock = STOCKS[c.stockIdx];
            return { name: c.name, dim: `${finW.toFixed(2)}" × ${finH.toFixed(2)}"`, thick: itemThick, thickMax: itemThick * (1 + tol), weight: weightOz, isManual: c.manualWeight !== null || c.manualThick !== null, stockName: stock.name, stockSource: stock.source, coating: c.coating };
        });

        State.lastBomData = bomData;

        // Apply global buffers
        totalWeightOz = Calc.applyWeightBuffer(totalWeightOz, State.globalBuffer);
        const thickResult = Calc.applyThicknessBuffer(totalThickness, totalToleranceSum, State.globalThickBuffer);
        totalThickness = thickResult.thickness;
        totalToleranceSum = thickResult.toleranceSum;

        // Apply global seals
        const sealResult = Calc.applySeals(totalThickness, totalWeightOz, State.globalSealType, State.globalSealQty);
        totalThickness = sealResult.thickness;
        totalWeightOz = sealResult.weightOz;

        document.getElementById('totalW').textContent = maxW.toFixed(2);
        document.getElementById('totalH').textContent = maxH.toFixed(2);
        document.getElementById('dimSource').textContent = State.components.length ? `From: ${driverName}` : 'Add a component';
        document.getElementById('totalThick').textContent = totalThickness.toFixed(4);
        document.getElementById('totalWeight').textContent = totalWeightOz.toFixed(3);
        document.getElementById('thickRange').textContent = State.components.length ? `${(totalThickness - totalToleranceSum).toFixed(4)}" – ${(totalThickness + totalToleranceSum).toFixed(4)}"` : '—';

        // Classification
        const classification = Postal.classifyPiece(maxW, maxH, totalThickness, State.components.length > 0);
        const ratio = Postal.calculateAspectRatio(maxW, maxH);

        document.getElementById('postalClass').textContent = classification.pClass;
        document.getElementById('postalSub').textContent = classification.pSub;
        document.getElementById('aspectVal').textContent = ratio.toFixed(2);
        const rPct = Math.min(100, Math.max(0, ((ratio - 0.5) / 2.5) * 100));
        document.getElementById('aspectBar').style.width = rPct + '%';
        document.getElementById('aspectBar').className = (ratio >= 1.3 && ratio <= 2.5) ? 'h-full bg-emerald-500' : 'h-full bg-amber-500';

        // Weight status
        document.getElementById('weightStatus').textContent = Postal.getWeightStatus(totalWeightOz, State.components.length > 0);

        // POSTAGE CALCULATION
        const postage = Postal.lookupPostage(classification.pClass, classification.isFlat, totalWeightOz, State.components.length > 0);
        document.getElementById('postageMarketing').textContent = postage.marketingRate ? `$${postage.marketingRate.toFixed(3)}` : '—';
        document.getElementById('postageFirstClass').textContent = postage.firstClassRate ? `$${postage.firstClassRate.toFixed(2)}` : '—';

        // Trays
        const trays = Postal.calculateTrayCapacity(maxW, maxH, totalThickness, totalWeightOz);
        document.getElementById('emmAlert').className = trays.emm ? 'mt-3 text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 flex items-center gap-2' : 'hidden';
        document.getElementById('tray2Count').textContent = trays.tray2Count.toLocaleString();
        document.getElementById('tray1Count').textContent = trays.tray1Count.toLocaleString();
        document.getElementById('tray2Weight').textContent = trays.tray2Weight.toFixed(1);
        document.getElementById('tray1Weight').textContent = trays.tray1Weight.toFixed(1);

        // BOM Table
        document.getElementById('bomTable').innerHTML = bomData.map(i => {
            const coatingLabel = i.coating !== 'none' ? ` <span class="text-[9px] text-amber-600">${COATINGS[i.coating]?.label}</span>` : '';
            return `
            <tr class="${i.isManual ? 'bg-purple-50' : ''}">
                <td class="px-4 py-2 font-medium text-slate-700">${i.name}${coatingLabel}</td>
                <td class="px-4 py-2 text-slate-500 text-xs">${i.dim}</td>
                <td class="px-4 py-2 text-xs"><div class="flex items-center gap-1">${C.getSourceBadge(i.stockSource)}<span class="text-slate-500 truncate max-w-[120px]" title="${i.stockName}">${i.stockName.replace(/^(Sappi|Domtar|Mohawk|Neenah|Finch|Hammermill|Accent|French|Springhill)\s+/, '')}</span></div></td>
                <td class="px-4 py-2 text-right font-mono text-xs">${i.thick.toFixed(4)}"</td>
                <td class="px-4 py-2 text-right font-mono text-xs">${i.weight.toFixed(3)} oz</td>
            </tr>`;
        }).join('');
        document.getElementById('bomTotalThick').textContent = totalThickness.toFixed(4) + '"';
        document.getElementById('bomTotalWeight').textContent = totalWeightOz.toFixed(3) + ' oz';
    }

    C.calculate = calculate;
})();
