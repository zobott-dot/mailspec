// app/components/calculate.js
// Main calculation engine for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Components = window.MailSpec.Components || {};

    const State = window.MailSpec.State;
    const STOCKS = window.MailSpec.STOCKS;
    const COATINGS = window.MailSpec.COATINGS;
    const C = window.MailSpec.Components;

    function generatePostalWarnings(totalWeightOz, totalThickness, maxW, maxH, ratio, classification, hasComponents) {
        const warnings = [];
        if (!hasComponents) return warnings;

        const pClass = classification.pClass;

        // --- THICKNESS WARNINGS ---
        if (pClass === 'Letter') {
            if (totalThickness >= 0.240) {
                warnings.push({ level: 'red', text: `<strong>Thickness ${totalThickness.toFixed(4)}"</strong> — within 0.01" of letter limit (0.25"). Will classify as Flat.` });
            } else if (totalThickness >= 0.200) {
                warnings.push({ level: 'amber', text: `<strong>Thickness ${totalThickness.toFixed(4)}"</strong> — approaching letter limit (0.25"). May classify as Flat.` });
            }
        }
        if (pClass === 'Flat') {
            if (totalThickness >= 0.720) {
                warnings.push({ level: 'red', text: `<strong>Thickness ${totalThickness.toFixed(4)}"</strong> — within 0.03" of flat limit (0.75"). Will classify as Parcel.` });
            } else if (totalThickness >= 0.650) {
                warnings.push({ level: 'amber', text: `<strong>Thickness ${totalThickness.toFixed(4)}"</strong> — approaching flat limit (0.75"). May classify as Parcel.` });
            }
        }

        // --- WEIGHT WARNINGS ---
        if (totalWeightOz <= 1.0) {
            if (totalWeightOz >= 0.950) {
                warnings.push({ level: 'red', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — very close to 1 oz. First-class rate increases above 1 oz.` });
            } else if (totalWeightOz >= 0.850) {
                warnings.push({ level: 'amber', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — approaching 1 oz. First-class rate increases above 1 oz.` });
            }
        } else if (totalWeightOz <= 3.5) {
            if (totalWeightOz >= 3.350) {
                warnings.push({ level: 'red', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — very close to 3.5 oz letter maximum. Will classify as Flat by weight.` });
            } else if (totalWeightOz >= 3.000) {
                warnings.push({ level: 'amber', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — approaching 3.5 oz letter maximum.` });
            }
        } else if (totalWeightOz <= 13) {
            if (totalWeightOz >= 12.500) {
                warnings.push({ level: 'red', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — very close to 13 oz flat maximum. Will classify as Parcel.` });
            } else if (totalWeightOz >= 11.500) {
                warnings.push({ level: 'amber', text: `<strong>Weight ${totalWeightOz.toFixed(3)} oz</strong> — approaching 13 oz flat maximum.` });
            }
        }

        // --- DIMENSION WARNINGS ---
        if (pClass === 'Letter') {
            if (maxW >= 11.250) {
                warnings.push({ level: 'red', text: `<strong>Width ${maxW.toFixed(2)}"</strong> — within 0.25" of letter limit (11.5"). Will classify as Flat.` });
            } else if (maxW >= 10.500) {
                warnings.push({ level: 'amber', text: `<strong>Width ${maxW.toFixed(2)}"</strong> — approaching letter width limit (11.5").` });
            }
            if (maxH >= 6.000) {
                warnings.push({ level: 'red', text: `<strong>Height ${maxH.toFixed(2)}"</strong> — within 0.125" of letter limit (6.125"). Will classify as Flat.` });
            } else if (maxH >= 5.625) {
                warnings.push({ level: 'amber', text: `<strong>Height ${maxH.toFixed(2)}"</strong> — approaching letter height limit (6.125").` });
            }
        }

        // --- ASPECT RATIO WARNINGS ---
        if (pClass === 'Letter') {
            if (ratio > 0 && ratio <= 1.35) {
                warnings.push({ level: 'red', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — at or below 1.3 minimum. Non-machinable surcharge applies.` });
            } else if (ratio > 1.35 && ratio <= 1.45) {
                warnings.push({ level: 'amber', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — approaching 1.3 minimum. Risk of non-machinable classification.` });
            }
            if (ratio >= 2.45) {
                warnings.push({ level: 'red', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — at or above 2.5 maximum. Non-machinable surcharge applies.` });
            } else if (ratio >= 2.35 && ratio < 2.45) {
                warnings.push({ level: 'amber', text: `<strong>Aspect ratio ${ratio.toFixed(2)}</strong> — approaching 2.5 maximum. Risk of non-machinable classification.` });
            }
        }

        return warnings;
    }

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

        // Postal Risk Warnings
        const warnings = generatePostalWarnings(totalWeightOz, totalThickness, maxW, maxH, ratio, classification, State.components.length > 0);
        const warningsEl = document.getElementById('postalWarnings');
        if (warnings.length > 0) {
            warningsEl.className = 'space-y-2';
            warningsEl.innerHTML = warnings.map(w => {
                const isRed = w.level === 'red';
                const bgClass = isRed ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800';
                const iconClass = isRed ? 'text-red-500' : 'text-amber-500';
                const icon = isRed ? 'error' : 'warning';
                return `<div class="postal-warning flex items-center gap-2 px-3 py-2 rounded-lg ${bgClass} border text-xs">
                    <span class="material-symbols-outlined text-sm ${iconClass}">${icon}</span>
                    <span>${w.text}</span>
                </div>`;
            }).join('');
        } else {
            warningsEl.className = 'hidden';
            warningsEl.innerHTML = '';
        }

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
