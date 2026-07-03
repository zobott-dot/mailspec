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
        let maxW = 0, maxH = 0, driverName = '-', driverIsEnvelope = false;
        const driverItems = [];
        // Compliance uses .find() below, which returns the first match — mirror that here.
        let selfMailerFinishedW = 0, selfMailerFinishedH = 0, selfMailerCaptured = false;

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

            driverItems.push({ name: c.name, type: c.type, finW: finW, finH: finH });

            if (c.type === 'selfmailer' && !selfMailerCaptured) {
                selfMailerFinishedW = finW;
                selfMailerFinishedH = finH;
                selfMailerCaptured = true;
            }

            totalWeightOz += weightOz;
            totalThickness += itemThick;
            totalToleranceSum += itemThick * tol;

            const stock = STOCKS[c.stockIdx];
            return { name: c.name, dim: `${finW.toFixed(3)}" × ${finH.toFixed(3)}"`, thick: itemThick, thickMax: itemThick * (1 + tol), weight: weightOz, isManual: c.manualWeight !== null || c.manualThick !== null, stockName: stock.name, stockSource: stock.source, coating: c.coating };
        });

        State.lastBomData = bomData;

        const driver = Postal.selectDimensionDriver(driverItems);
        maxW = driver.maxW;
        maxH = driver.maxH;
        driverName = driver.driverName;
        driverIsEnvelope = driver.driverIsEnvelope;

        // Apply global buffers
        totalWeightOz = Calc.applyWeightBuffer(totalWeightOz, State.globalBuffer);
        const thickResult = Calc.applyThicknessBuffer(totalThickness, totalToleranceSum, State.globalThickBuffer);
        totalThickness = thickResult.thickness;
        totalToleranceSum = thickResult.toleranceSum;

        // Apply global seals
        const sealResult = Calc.applySeals(totalThickness, totalWeightOz, State.globalSealType, State.globalSealQty);
        totalThickness = sealResult.thickness;
        totalWeightOz = sealResult.weightOz;

        const hasComponents = State.components.length > 0;
        document.getElementById('totalW').textContent = hasComponents ? maxW.toFixed(3) + '"' : '—';
        document.getElementById('totalH').textContent = hasComponents ? maxH.toFixed(3) + '"' : '—';
        document.getElementById('dimSource').textContent = hasComponents ? `From: ${driverName}` : 'Add a component';
        document.getElementById('totalThick').textContent = hasComponents ? totalThickness.toFixed(4) + '"' : '—';
        document.getElementById('totalWeight').textContent = hasComponents ? totalWeightOz.toFixed(3) + ' oz' : '—';
        document.getElementById('thickRange').textContent = hasComponents ? `${(totalThickness - totalToleranceSum).toFixed(4)}" – ${(totalThickness + totalToleranceSum).toFixed(4)}"` : '—';

        // Classification
        const classification = Postal.classifyPiece(maxW, maxH, totalThickness, State.components.length > 0);
        const ratio = Postal.calculateAspectRatio(maxW, maxH);

        document.getElementById('postalClass').textContent = classification.pClass;
        document.getElementById('postalSub').textContent = classification.pSub;
        document.getElementById('aspectVal').textContent = hasComponents ? ratio.toFixed(2) : '—';
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
        const warnings = Postal.generatePostalWarnings(totalWeightOz, totalThickness, maxW, maxH, ratio, classification, State.components.length > 0);

        // Fit check: warn if any non-envelope content exceeds the driving envelope.
        if (driverIsEnvelope) {
            driverItems.forEach(function(it) {
                if (it.type !== 'envelope' &&
                    !Postal.fitsInsideEnvelope(it.finW, it.finH, maxW, maxH)) {
                    warnings.push({
                        level: 'amber',
                        text: `<strong>${it.name}</strong> (${it.finW.toFixed(2)}" × ${it.finH.toFixed(2)}") is larger than the ${driverName} (${maxW.toFixed(2)}" × ${maxH.toFixed(2)}") — contents will not fit; verify sizing.`
                    });
                }
            });
        }

        const warningsEl = document.getElementById('postalWarnings');
        if (warnings.length > 0) {
            warningsEl.className = 'space-y-2';
            warningsEl.innerHTML = warnings.map(w => {
                let bgClass, iconClass, icon;
                if (w.level === 'red') {
                    bgClass = 'bg-red-50 border-red-200 text-red-800';
                    iconClass = 'text-red-500';
                    icon = 'error';
                } else if (w.level === 'amber') {
                    bgClass = 'bg-amber-50 border-amber-200 text-amber-800';
                    iconClass = 'text-amber-500';
                    icon = 'warning';
                } else {
                    bgClass = 'bg-blue-50 border-blue-200 text-blue-800';
                    iconClass = 'text-blue-500';
                    icon = 'info';
                }
                return `<div class="postal-warning flex items-center gap-2 px-3 py-2 rounded-lg ${bgClass} border text-xs">
                    <span class="material-symbols-outlined text-sm ${iconClass}">${icon}</span>
                    <span>${w.text}</span>
                </div>`;
            }).join('');
        } else {
            warningsEl.className = 'hidden';
            warningsEl.innerHTML = '';
        }

        // Self-Mailer Compliance Check
        const Compliance = window.MailSpec.Compliance;
        const compliancePanel = document.getElementById('compliancePanel');
        const selfMailer = State.components.find(c => c.type === 'selfmailer');

        const complianceFold = (selfMailer && selfMailer.complianceFoldType) ? selfMailer.complianceFoldType : (selfMailer ? selfMailer.fold : '1');

        if (selfMailer && complianceFold !== '1' && State.components.length > 0) {
            const hasOptional = document.getElementById('complianceOptionalElements')?.checked || false;
            const compliance = Compliance.evaluateSelfMailer({
                foldType: complianceFold,
                totalWeightOz: totalWeightOz,
                sealType: State.globalSealType,
                sealQty: State.globalSealQty,
                hasOptionalElements: hasOptional,
                finishedW: selfMailerFinishedW,
                finishedH: selfMailerFinishedH,
                stockGsm: selfMailer.gsm
            });

            compliancePanel.className = '';
            const content = document.getElementById('complianceContent');

            let statusIcon, statusColor, statusBg, statusLabel;
            if (compliance.status === 'pass') {
                statusIcon = 'check_circle';
                statusColor = 'text-emerald-600';
                statusBg = 'bg-emerald-50 border-emerald-200';
                statusLabel = 'Compliant';
            } else if (compliance.status === 'caution') {
                statusIcon = 'warning';
                statusColor = 'text-amber-600';
                statusBg = 'bg-amber-50 border-amber-200';
                statusLabel = 'Verify';
            } else if (compliance.status === 'fail') {
                statusIcon = 'error';
                statusColor = 'text-red-600';
                statusBg = 'bg-red-50 border-red-200';
                statusLabel = 'Non-Compliant';
            } else {
                statusIcon = 'info';
                statusColor = 'text-slate-500';
                statusBg = 'bg-slate-50 border-slate-200';
                statusLabel = 'N/A';
            }

            let reqHtml = '';
            if (compliance.requiredTabs > 0) {
                reqHtml = `<div class="text-xs text-slate-500 mb-2">Required: <strong>${compliance.requiredTabs} tabs</strong> at <strong>${compliance.requiredSize}</strong> minimum</div>`;
            }

            content.innerHTML = `
                <div class="flex items-center gap-3 mb-3">
                    <div class="flex items-center gap-2 px-3 py-2 rounded-lg ${statusBg} border">
                        <span class="material-symbols-outlined ${statusColor}">${statusIcon}</span>
                        <span class="font-bold text-sm ${statusColor}">${statusLabel}</span>
                    </div>
                    ${reqHtml}
                </div>
                <div class="space-y-1">
                    ${compliance.messages.map(m => `<div class="text-xs text-slate-600 flex items-start gap-1.5"><span class="material-symbols-outlined text-xs text-slate-400 mt-0.5">arrow_right</span><span>${m}</span></div>`).join('')}
                </div>
                <div class="mt-3 text-[9px] text-slate-400">Checks tab count/size, weight, size, and paper minimums per ${compliance.reference}. Tab placement zones, final-fold orientation, and panel-count limits are not modeled — confirm with QSG 601a or an MDA (mda@usps.gov) before production.</div>
            `;
        } else {
            compliancePanel.className = 'hidden';
        }

        // Trays
        const trays = Postal.calculateTrayCapacity(maxW, maxH, totalThickness, totalWeightOz, classification.pClass);
        const trayNoteEl = document.getElementById('trayNote');
        const noteBase = 'mt-3 text-[11px] p-2 rounded border flex items-center gap-2 ';

        if (trays.mode === 'letter') {
            document.getElementById('tray2Count').textContent = trays.tray2Count.toLocaleString();
            document.getElementById('tray2Weight').textContent = trays.tray2Weight.toFixed(1) + ' lbs';
            if (trays.emm) {
                document.getElementById('tray1Count').textContent = '—';
                document.getElementById('tray1Weight').textContent = 'EMM trays are 2-ft only';
                trayNoteEl.className = noteBase + 'text-amber-700 bg-amber-50 border-amber-100';
                trayNoteEl.innerHTML = '<span class="material-symbols-outlined text-sm">warning</span><span><strong>EMM Tray Required</strong> — letter exceeds 4.625&quot; H or 10&quot; L (21.75&quot; usable length)</span>';
            } else {
                document.getElementById('tray1Count').textContent = trays.tray1Count.toLocaleString();
                document.getElementById('tray1Weight').textContent = trays.tray1Weight.toFixed(1) + ' lbs';
                trayNoteEl.className = 'hidden';
            }
        } else {
            document.getElementById('tray2Count').textContent = '—';
            document.getElementById('tray1Count').textContent = '—';
            document.getElementById('tray2Weight').textContent = '—';
            document.getElementById('tray1Weight').textContent = '—';
            if (trays.mode === 'flat') {
                trayNoteEl.className = noteBase + 'text-slate-600 bg-slate-50 border-slate-200';
                trayNoteEl.innerHTML = '<span class="material-symbols-outlined text-sm">info</span><span>Flats are prepared in flat trays/sacks — letter-tray counts do not apply</span>';
            } else {
                trayNoteEl.className = 'hidden';
            }
        }

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
        document.getElementById('bomTotalThick').textContent = hasComponents ? totalThickness.toFixed(4) + '"' : '—';
        document.getElementById('bomTotalWeight').textContent = hasComponents ? totalWeightOz.toFixed(3) + ' oz' : '—';
    }

    C.calculate = calculate;
})();
