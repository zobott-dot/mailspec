// app/components/render.js
// Component card rendering and stock filtering for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Components = window.MailSpec.Components || {};

    const State = window.MailSpec.State;
    const STOCKS = window.MailSpec.STOCKS;
    const COATINGS = window.MailSpec.COATINGS;
    const PROVENANCE = window.MailSpec.PROVENANCE;
    const C = window.MailSpec.Components;

    function getSourceBadge(source) {
        const map = { sappi: 'sappi', domtar: 'domtar', mohawk: 'mohawk', neenah: 'neenah', finch: 'finch', ip: 'ip', custom: 'custom', industry: 'industry' };
        return `<span class="source-badge ${map[source] || 'industry'}">${source.toUpperCase()}</span>`;
    }

    function getStockInfo(stock) {
        const prov = PROVENANCE[stock.source] || PROVENANCE['industry'];

        // Source badge (linked if URL available)
        const badge = prov.url
            ? `<a href="${prov.url}" target="_blank" rel="noopener" title="${prov.publisher}: ${prov.document || ''}">${getSourceBadge(stock.source)}</a>`
            : getSourceBadge(stock.source);

        // Caliper and GSM specs
        const specs = `<span class="text-[10px] text-slate-400">${stock.cal.toFixed(4)}" / ${stock.gsm}gsm</span>`;

        // Tolerance indicator
        const tolPct = Math.round(stock.tolerance * 100);
        let tolColor = 'text-slate-400';
        if (tolPct <= 3) tolColor = 'text-emerald-500';
        else if (tolPct >= 7) tolColor = 'text-amber-500';
        if (tolPct >= 10) tolColor = 'text-red-400';
        const tolTag = `<span class="text-[9px] ${tolColor}" title="Caliper tolerance: ±${tolPct}%">±${tolPct}%</span>`;

        // Provenance date with staleness detection
        let verifiedTag = '';
        if (prov.verified) {
            const [year, month] = prov.verified.split('-');
            const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthStr = monthNames[parseInt(month)] || month;

            const now = new Date();
            const verifiedDate = new Date(parseInt(year), parseInt(month) - 1);
            const ageMonths = (now.getFullYear() - verifiedDate.getFullYear()) * 12 + (now.getMonth() - verifiedDate.getMonth());

            let dateColor = 'text-slate-300';
            let dateTitle = `${prov.publisher}${prov.document ? ': ' + prov.document : ''}`;
            if (ageMonths >= 24) {
                dateColor = 'text-red-400';
                dateTitle += ' — Data over 2 years old, may need re-verification';
            } else if (ageMonths >= 12) {
                dateColor = 'text-amber-400';
                dateTitle += ' — Data over 1 year old, consider re-verification';
            }

            verifiedTag = `<span class="text-[9px] text-slate-300">·</span><span class="text-[9px] ${dateColor}" title="${dateTitle}">${monthStr} ${year}</span>`;
        }

        // Custom stock note
        let customNote = '';
        if (stock.source === 'custom') {
            customNote = `<span class="text-[9px] text-slate-300">·</span><span class="text-[9px] text-purple-400 italic" title="User-provided values — not verified against manufacturer data">Unverified</span>`;
        }

        return `<div class="mt-1 flex items-center gap-2 flex-wrap">${badge}${specs}<span class="text-[9px] text-slate-300">·</span>${tolTag}${verifiedTag}${customNote}</div>`;
    }

    function filterStocks(searchTerm, selectedIdx) {
        const term = searchTerm.toLowerCase();
        const groups = { 'sappi': [], 'domtar': [], 'mohawk': [], 'neenah': [], 'finch': [], 'ip': [], 'industry': [], 'custom': [] };

        STOCKS.forEach((s, i) => {
            if (term && !s.name.toLowerCase().includes(term)) return;
            const group = groups[s.source] || groups['industry'];
            group.push({ ...s, idx: i });
        });

        const labels = { sappi: 'SAPPI', domtar: 'DOMTAR', mohawk: 'MOHAWK', neenah: 'NEENAH', finch: 'FINCH', ip: "INT'L PAPER", industry: 'STANDARD', custom: 'CUSTOM ★' };
        let html = '';
        for (const key of Object.keys(groups)) {
            if (groups[key].length === 0) continue;
            html += `<optgroup label="── ${labels[key]} ──">`;
            groups[key].forEach(s => { html += `<option value="${s.idx}" ${s.idx == selectedIdx ? 'selected' : ''}>${s.name}</option>`; });
            html += '</optgroup>';
        }
        return html || '<option disabled>No matches</option>';
    }

    function renderComponents() {
        const list = document.getElementById('componentList');
        if (State.components.length === 0) {
            list.innerHTML = '<div class="text-center py-8 text-slate-400"><span class="material-symbols-outlined text-4xl mb-2">inbox</span><p class="text-sm">No components yet</p></div>';
            return;
        }
        list.innerHTML = '';
        State.components.forEach(c => {
            const el = document.createElement('div');
            el.className = 'component-card p-4';

            // Validate stockIdx - fix if out of bounds
            if (c.stockIdx < 0 || c.stockIdx >= STOCKS.length || !STOCKS[c.stockIdx]) {
                console.warn('MailSpec: Invalid stockIdx', c.stockIdx, '- resetting to 0');
                c.stockIdx = 0;
                c.caliper = STOCKS[0].cal;
                c.gsm = STOCKS[0].gsm;
            }

            const stock = STOCKS[c.stockIdx];
            const stockOpts = filterStocks('', c.stockIdx);
            const stockInfo = getStockInfo(stock);

            // Coating dropdown
            const coatingOpts = Object.entries(COATINGS).map(([k, v]) => `<option value="${k}" ${c.coating === k ? 'selected' : ''}>${v.label}</option>`).join('');

            let mainInputs = '';
            const isCustomPanelType = ['sheet', 'selfmailer', 'accordion', 'booklet'].includes(c.type);
            const customPanelToggle = isCustomPanelType ? `
                    <label class="flex items-center gap-1.5 mb-2 cursor-pointer select-none">
                        <input type="checkbox" class="accent-indigo-600" ${c.customPanels ? 'checked' : ''} onchange="toggleCustomPanels(${c.id})">
                        <span class="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Custom panels</span>
                    </label>` : '';
            const customPanelInputs = `
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div><label class="input-label">Flat W</label><input type="number" step="any" class="input-field" value="${c.flatWidth != null ? c.flatWidth : ''}" onchange="updateComponent(${c.id}, 'flatWidth', this.value)"></div>
                        <div><label class="input-label">Flat H</label><input type="number" step="any" class="input-field" value="${c.flatHeight != null ? c.flatHeight : ''}" onchange="updateComponent(${c.id}, 'flatHeight', this.value)"></div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div><label class="input-label">Fin. W</label><input type="number" step="any" class="input-field" value="${c.finishedWidth != null ? c.finishedWidth : ''}" onchange="updateComponent(${c.id}, 'finishedWidth', this.value)"></div>
                        <div><label class="input-label">Fin. H</label><input type="number" step="any" class="input-field" value="${c.finishedHeight != null ? c.finishedHeight : ''}" onchange="updateComponent(${c.id}, 'finishedHeight', this.value)"></div>
                    </div>
                    <div class="mb-2">
                        <label class="input-label">Layers at fold</label>
                        <input type="number" step="1" min="1" class="input-field w-20" value="${c.layersAtFold != null ? c.layersAtFold : ''}" onchange="updateComponent(${c.id}, 'layersAtFold', this.value)">
                    </div>`;

            if (c.type === 'envelope') {
                mainInputs = `
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div><label class="input-label">Width</label><input type="number" step="any" class="input-field" value="${c.w}" onchange="updateComponent(${c.id}, 'w', this.value)"></div>
                        <div><label class="input-label">Height</label><input type="number" step="any" class="input-field" value="${c.h}" onchange="updateComponent(${c.id}, 'h', this.value)"></div>
                    </div>
                    <div class="mb-2">
                        <label class="input-label">Material <span class="text-slate-300 font-normal">(type to search)</span></label>
                        <input type="text" class="input-field stock-search-input mb-1" placeholder="Search stocks..." oninput="updateStockSearch(${c.id}, this.value)">
                        <select class="input-field stock-dropdown" id="stock-${c.id}" onchange="updateComponent(${c.id}, 'stockIdx', this.value)">${stockOpts}</select>
                        ${stockInfo}
                    </div>`;
            } else if (c.type === 'sheet' || c.type === 'selfmailer') {
                const ply = parseInt(c.fold);
                let dW = c.w, dH = c.h;
                if (c.dimMode === 'finished') { if (c.foldAxis === 'h') dH = c.h / ply; else dW = c.w / ply; }
                if (c.customPanels) {
                    mainInputs = `
                    ${customPanelToggle}
                    ${customPanelInputs}
                    <div class="mb-2">
                        <label class="input-label">Material</label>
                        <input type="text" class="input-field stock-search-input mb-1" placeholder="Search..." oninput="updateStockSearch(${c.id}, this.value)">
                        <select class="input-field stock-dropdown" id="stock-${c.id}" onchange="updateComponent(${c.id}, 'stockIdx', this.value)">${stockOpts}</select>
                        ${stockInfo}
                    </div>
                    <div><label class="input-label">Coating</label><select class="input-field" onchange="updateComponent(${c.id}, 'coating', this.value)">${coatingOpts}</select></div>`;
                } else {
                    mainInputs = `
                    ${customPanelToggle}
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div><label class="input-label">${c.dimMode === 'flat' ? 'Flat W' : 'Fin. W'}</label><input type="number" step="any" class="input-field" value="${dW.toFixed(3)}" onchange="updateComponent(${c.id}, 'w', this.value)"></div>
                        <div><label class="input-label">${c.dimMode === 'flat' ? 'Flat H' : 'Fin. H'}</label><input type="number" step="any" class="input-field" value="${dH.toFixed(3)}" onchange="updateComponent(${c.id}, 'h', this.value)"></div>
                    </div>
                    <div class="mb-2">
                        <label class="input-label">Material</label>
                        <input type="text" class="input-field stock-search-input mb-1" placeholder="Search..." oninput="updateStockSearch(${c.id}, this.value)">
                        <select class="input-field stock-dropdown" id="stock-${c.id}" onchange="updateComponent(${c.id}, 'stockIdx', this.value)">${stockOpts}</select>
                        ${stockInfo}
                    </div>
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div><label class="input-label">Fold</label><select class="input-field" onchange="updateComponent(${c.id}, 'fold', this.value)">
                            <option value="1" ${c.fold == '1' ? 'selected' : ''}>None</option>
                            <option value="2" ${c.fold == '2' ? 'selected' : ''}>Bi-Fold</option>
                            <option value="3" ${c.fold == '3' ? 'selected' : ''}>Tri-Fold</option>
                            <option value="4" ${c.fold == '4' ? 'selected' : ''}>Gate</option>
                        </select></div>
                        <div><label class="input-label">Axis</label><select class="input-field" onchange="updateComponent(${c.id}, 'foldAxis', this.value)">
                            <option value="h" ${c.foldAxis == 'h' ? 'selected' : ''}>↕H</option>
                            <option value="w" ${c.foldAxis == 'w' ? 'selected' : ''}>↔W</option>
                        </select></div>
                    </div>
                    <div><label class="input-label">Coating</label><select class="input-field" onchange="updateComponent(${c.id}, 'coating', this.value)">${coatingOpts}</select></div>`;
                }
            } else if (c.type === 'booklet') {
                if (c.customPanels) {
                    mainInputs = `
                    ${customPanelToggle}
                    ${customPanelInputs}
                    <div class="mb-2"><label class="input-label">Body Stock</label><select class="input-field" onchange="updateComponent(${c.id}, 'stockIdx', this.value)">${stockOpts}</select>${stockInfo}</div>`;
                } else {
                    mainInputs = `
                    ${customPanelToggle}
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div><label class="input-label">Fin. W</label><input type="number" step="any" class="input-field" value="${c.w}" onchange="updateComponent(${c.id}, 'w', this.value)"></div>
                        <div><label class="input-label">Fin. H</label><input type="number" step="any" class="input-field" value="${c.h}" onchange="updateComponent(${c.id}, 'h', this.value)"></div>
                        <div><label class="input-label">Binding</label><select class="input-field" onchange="updateComponent(${c.id}, 'binding', this.value)">
                            <option value="stitch" ${c.binding == 'stitch' ? 'selected' : ''}>Saddle</option>
                            <option value="paste" ${c.binding == 'paste' ? 'selected' : ''}>Perfect</option>
                        </select></div>
                        <div><label class="input-label">Pages</label><input type="number" step="4" min="4" class="input-field" value="${c.panels}" onchange="updateComponent(${c.id}, 'panels', this.value)"></div>
                    </div>
                    <div class="mb-2"><label class="input-label">Body Stock</label><select class="input-field" onchange="updateComponent(${c.id}, 'stockIdx', this.value)">${stockOpts}</select></div>`;
                }
            } else if (c.type === 'accordion') {
                if (c.customPanels) {
                    mainInputs = `
                    ${customPanelToggle}
                    ${customPanelInputs}
                    <div class="mb-2">
                        <label class="input-label">Material</label>
                        <input type="text" class="input-field stock-search-input mb-1" placeholder="Search..." oninput="updateStockSearch(${c.id}, this.value)">
                        <select class="input-field stock-dropdown" id="stock-${c.id}" onchange="updateComponent(${c.id}, 'stockIdx', this.value)">${stockOpts}</select>
                        ${stockInfo}
                    </div>`;
                } else {
                    mainInputs = `
                    ${customPanelToggle}
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div><label class="input-label">Width</label><input type="number" step="any" class="input-field" value="${c.w}" onchange="updateComponent(${c.id}, 'w', this.value)"></div>
                        <div><label class="input-label">Height</label><input type="number" step="any" class="input-field" value="${c.h}" onchange="updateComponent(${c.id}, 'h', this.value)"></div>
                    </div>
                    <div class="mb-2">
                        <label class="input-label">Material</label>
                        <input type="text" class="input-field stock-search-input mb-1" placeholder="Search..." oninput="updateStockSearch(${c.id}, this.value)">
                        <select class="input-field stock-dropdown" id="stock-${c.id}" onchange="updateComponent(${c.id}, 'stockIdx', this.value)">${stockOpts}</select>
                        ${stockInfo}
                    </div>`;
                }
            } else {
                mainInputs = `
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <div><label class="input-label">Width</label><input type="number" step="any" class="input-field" value="${c.w}" onchange="updateComponent(${c.id}, 'w', this.value)"></div>
                        <div><label class="input-label">Height</label><input type="number" step="any" class="input-field" value="${c.h}" onchange="updateComponent(${c.id}, 'h', this.value)"></div>
                    </div>
                    <div class="mb-2">
                        <label class="input-label">Material</label>
                        <input type="text" class="input-field stock-search-input mb-1" placeholder="Search..." oninput="updateStockSearch(${c.id}, this.value)">
                        <select class="input-field stock-dropdown" id="stock-${c.id}" onchange="updateComponent(${c.id}, 'stockIdx', this.value)">${stockOpts}</select>
                        ${stockInfo}
                    </div>`;
            }

            const manualBadge = (c.manualWeight || c.manualThick) ? '<span class="text-[10px] bg-purple-100 text-purple-700 px-1 rounded ml-1">Manual</span>' : '';

            el.innerHTML = `
                <div class="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                    <div class="flex items-center gap-2">
                        <input type="text" value="${c.name}" class="font-bold text-sm text-slate-700 bg-transparent border-none p-0 min-w-0 flex-1" onchange="updateComponent(${c.id}, 'name', this.value)">
                        ${manualBadge}
                    </div>
                    <div class="flex gap-0.5">
                        ${(c.type === 'sheet' || c.type === 'selfmailer') && !c.customPanels ? `<button title="Toggle Flat/Finished" onclick="toggleDimMode(${c.id})" class="text-slate-300 hover:text-amber-600 p-1"><span class="material-symbols-outlined text-base">swap_vert</span></button>` : ''}
                        <button title="Duplicate" onclick="duplicateComponent(${c.id})" class="text-slate-300 hover:text-indigo-600 p-1"><span class="material-symbols-outlined text-base">content_copy</span></button>
                        <button title="Manual Weight" onclick="toggleManual(${c.id}, 'weight')" class="text-slate-300 hover:text-purple-600 p-1"><span class="material-symbols-outlined text-base">scale</span></button>
                        <button title="Manual Thickness" onclick="toggleManual(${c.id}, 'thick')" class="text-slate-300 hover:text-purple-600 p-1"><span class="material-symbols-outlined text-base">straighten</span></button>
                        <button title="Delete" onclick="removeComponent(${c.id})" class="text-slate-300 hover:text-red-500 p-1"><span class="material-symbols-outlined text-base">delete</span></button>
                    </div>
                </div>
                ${mainInputs}`;
            list.appendChild(el);
        });
    }

    function updateStockSearch(compId, term) {
        const select = document.getElementById(`stock-${compId}`);
        if (!select) return;
        const comp = State.components.find(c => c.id === compId);
        select.innerHTML = filterStocks(term, comp?.stockIdx);
    }

    C.getSourceBadge = getSourceBadge;
    C.getStockInfo = getStockInfo;
    C.filterStocks = filterStocks;
    C.renderComponents = renderComponents;
    C.updateStockSearch = updateStockSearch;
})();
