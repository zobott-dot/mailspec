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
        const marketingRate = document.getElementById('postageMarketing').textContent;
        const firstClassRate = document.getElementById('postageFirstClass').textContent;

        let lines = [
            '═══════════════════════════════════════════════════════════════',
            '  MAILSPEC - ASSEMBLY SPECIFICATION',
            '  Generated: ' + new Date().toLocaleString(),
            '═══════════════════════════════════════════════════════════════',
            '',
            'ASSEMBLY SUMMARY',
            '─────────────────────────────────────────────────────────────────',
            `  Mailing Dimensions:  ${totalW}" × ${totalH}"`,
            `  Total Thickness:     ${totalThick}`,
            `  Total Weight:        ${totalWeight}`,
            `  Postal Class:        ${postalClass}`,
            ''
        ];

        // Add global seal info if present
        if (State.globalSealType !== 'none' && State.globalSealQty > 0) {
            const sealLabels = { wafer: 'Wafer Tab', glue_dot: 'Glue Dot', line_glue: 'Line Glue' };
            const seal = SEALS[State.globalSealType];
            lines.push(`  Tab Seals:           ${State.globalSealQty}× ${sealLabels[State.globalSealType]}`);
            lines.push(`                       (+${(seal.thick * State.globalSealQty).toFixed(4)}" / +${(seal.weight * State.globalSealQty).toFixed(4)} oz)`);
            lines.push('');
        }

        lines.push('POSTAGE ESTIMATES (July 2025)');
        lines.push('─────────────────────────────────────────────────────────────────');
        lines.push(`  Marketing Mail (Auto):  ${marketingRate}`);
        lines.push(`  First-Class (Auto):     ${firstClassRate}`);
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
