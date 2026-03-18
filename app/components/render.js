// app/components/render.js
// Component card rendering and stock filtering for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Components = window.MailSpec.Components || {};

    const State = window.MailSpec.State;
    const STOCKS = window.MailSpec.STOCKS;
    const COATINGS = window.MailSpec.COATINGS;
    const C = window.MailSpec.Components;

    function getSourceBadge(source) {
        const map = { sappi: 'sappi', domtar: 'domtar', mohawk: 'mohawk', neenah: 'neenah', finch: 'finch', ip: 'ip', custom: 'custom', industry: 'industry' };
        return `<span class="source-badge ${map[source] || 'industry'}">${source.toUpperCase()}</span>`;
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
            list.innerHTML = '<div class="text-center py-8 text-slate-400"><span class="material-symbols-outlined text-4xl mb-2">inbox</span><p class="text-sm">No components yet</p><p class="text-xs">Add components above or use Templates button</p></div>';
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
            const stockInfo = `<div class="mt-1 flex items-center gap-2">${getSourceBadge(stock.source)}<span class="text-[10px] text-slate-400">${stock.cal.toFixed(4)}" / ${stock.gsm}gsm</span></div>`;

            // Coating dropdown
            const coatingOpts = Object.entries(COATINGS).map(([k, v]) => `<option value="${k}" ${c.coating === k ? 'selected' : ''}>${v.label}</option>`).join('');

            let mainInputs = '', badge = '';

            if (c.type === 'envelope') {
                badge = '<span class="mode-pill finished">Env</span>';
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
                badge = `<span class="mode-pill ${c.type === 'selfmailer' ? 'mailer' : 'flat'}">${c.dimMode === 'flat' ? 'Flat' : 'Fin.'}</span>`;
                mainInputs = `
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
            } else if (c.type === 'booklet') {
                badge = '<span class="mode-pill finished">Booklet</span>';
                mainInputs = `
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
            } else {
                badge = '<span class="mode-pill finished">Item</span>';
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
                        <input type="text" value="${c.name}" class="font-bold text-sm text-slate-700 bg-transparent border-none p-0 w-24" onchange="updateComponent(${c.id}, 'name', this.value)">
                        ${badge}${manualBadge}
                    </div>
                    <div class="flex gap-0.5">
                        ${(c.type === 'sheet' || c.type === 'selfmailer') ? `<button title="Toggle Flat/Finished" onclick="toggleDimMode(${c.id})" class="text-slate-300 hover:text-amber-600 p-1"><span class="material-symbols-outlined text-base">swap_vert</span></button>` : ''}
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
    C.filterStocks = filterStocks;
    C.renderComponents = renderComponents;
    C.updateStockSearch = updateStockSearch;
})();
