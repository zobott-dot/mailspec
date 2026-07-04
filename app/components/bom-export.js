// app/components/bom-export.js
// BOM clipboard copy and text export for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Components = window.MailSpec.Components || {};

    const State = window.MailSpec.State;
    const SEALS = window.MailSpec.SEALS;
    const COATINGS = window.MailSpec.COATINGS;
    const C = window.MailSpec.Components;

    function generateBOMText() {
        const totalW = document.getElementById('totalW').textContent;
        const totalH = document.getElementById('totalH').textContent;
        const totalThick = document.getElementById('totalThick').textContent;
        const totalWeight = document.getElementById('totalWeight').textContent;
        const postalClass = document.getElementById('postalClass').textContent;

        let lines = [
            '═══════════════════════════════════════════════════════════════',
            '  MAILSPEC - ASSEMBLY SPECIFICATION',
            '  Generated: ' + new Date().toLocaleString(),
            '═══════════════════════════════════════════════════════════════',
            '',
            'ASSEMBLY SUMMARY',
            '─────────────────────────────────────────────────────────────────',
            `  Mailing Dimensions:  ${totalW} × ${totalH}`,
            `  Total Thickness:     ${totalThick}`,
            `  Total Weight:        ${totalWeight}`,
            `  Postal Class:        ${postalClass}`,
            ''
        ];

        // Add global seal info if present
        if (State.globalSealType !== 'none' && State.globalSealQty > 0) {
            const sealLabels = { wafer: 'Wafer Tab', glue_dot: 'Glue Dot', line_glue: 'Line Glue', perf_tab: 'Perforated Tab' };
            const seal = SEALS[State.globalSealType];
            lines.push(`  Tab Seals:           ${State.globalSealQty}× ${sealLabels[State.globalSealType]}`);
            lines.push(`                       (+${(seal.thick * State.globalSealQty).toFixed(4)}" / +${(seal.weight * State.globalSealQty).toFixed(4)} oz)`);
            lines.push('');
        }

        // Self-mailer compliance verdict — mirrors the print sheet: reads the live
        // compliance panel rather than re-running evaluation (panel = source of truth).
        const compPanel = document.getElementById('compliancePanel');
        if (compPanel && !compPanel.classList.contains('hidden')) {
            const statusEl = document.querySelector('#complianceContent .font-bold.text-sm');
            if (statusEl) {
                lines.push(`  FSM Compliance:      ${statusEl.textContent} (DMM 201.3.14)`);
                const msgs = document.querySelectorAll('#complianceContent .text-xs.text-slate-600 span:last-child');
                Array.from(msgs).forEach(m => lines.push(`                       - ${m.textContent}`));
                lines.push('');
            }
        }

        // Postage — DOM-read the live card (card = single source of truth), mirroring
        // its range/entry display in text. Dash rows export a dash; visible note
        // lines are included underneath the value column.
        const postageLine = (label, id) => {
            const rate = (document.getElementById(id).textContent || '').trim() || '—';
            const subEl = document.getElementById(id + 'Sub');
            const sub = subEl ? subEl.textContent.trim() : '';
            lines.push(label + rate + (sub ? `  (${sub})` : ''));
            const noteEl = document.getElementById(id + 'Note');
            if (noteEl && !noteEl.classList.contains('hidden') && noteEl.textContent.trim()) {
                lines.push(' '.repeat(26) + noteEl.textContent.trim());
            }
        };

        lines.push('POSTAGE ESTIMATES');
        lines.push('─────────────────────────────────────────────────────────────────');
        postageLine('  Marketing Mail (Auto):  ', 'postageMarketing');
        postageLine('  First-Class (Auto):     ', 'postageFirstClass');
        const postageFooterEl = document.getElementById('postageFooter');
        if (postageFooterEl && postageFooterEl.textContent.trim()) {
            lines.push('  ' + postageFooterEl.textContent.trim());
        }
        lines.push('');
        lines.push('BILL OF MATERIALS');
        lines.push('─────────────────────────────────────────────────────────────────');

        State.lastBomData.forEach((item, i) => {
            lines.push(`  ${i + 1}. ${item.name}`);
            lines.push(`     Size: ${item.dim}  |  Stock: ${item.stockName}`);
            lines.push(`     Thickness: ${item.thick.toFixed(4)}"  |  Weight: ${item.weight.toFixed(3)} oz`);
            if (item.coating !== 'none') lines.push(`     Coating: ${COATINGS[item.coating]?.label}`);
            lines.push('');
        });

        lines.push('═══════════════════════════════════════════════════════════════');
        lines.push('  * Weights include 5% buffer for ink/varnish');
        lines.push('  * Verify specs with physical samples for critical jobs');
        lines.push('═══════════════════════════════════════════════════════════════');

        return lines.join('\n');
    }

    function copyBOMToClipboard() {
        const text = generateBOMText();
        navigator.clipboard.writeText(text).then(() => alert('BOM copied to clipboard!')).catch(() => alert('Copy failed.'));
    }

    function exportBOMText() {
        const text = generateBOMText();
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `mailspec-bom-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }

    C.copyBOMToClipboard = copyBOMToClipboard;
    C.exportBOMText = exportBOMText;
    C.generateBOMText = generateBOMText;
})();
