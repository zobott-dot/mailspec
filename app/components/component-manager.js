// app/components/component-manager.js
// Component CRUD operations, templates, and custom stocks for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Components = window.MailSpec.Components || {};

    const State = window.MailSpec.State;
    const STOCKS = window.MailSpec.STOCKS;
    const TEMPLATES = window.MailSpec.TEMPLATES;
    const STORAGE_KEY_CUSTOM_STOCKS = window.MailSpec.STORAGE_KEY_CUSTOM_STOCKS;
    const C = window.MailSpec.Components;

    function getName(type) {
        return { 'envelope': 'Envelope', 'selfmailer': 'Self-Mailer', 'sheet': 'Insert', 'accordion': 'Accordion', 'booklet': 'Booklet', 'card': 'Card' }[type] || 'Component';
    }

    function addComponent(type, defaults = {}) {
        const id = State.nextId++;
        const defaultStock = STOCKS.findIndex(s => s.name.includes("McCoy 80# Gloss Text"));
        const comp = {
            id, type,
            name: defaults.name || getName(type),
            w: defaults.w || 8.5, h: defaults.h || 11,
            fold: defaults.fold || '1', panels: type === 'accordion' ? 4 : 8,
            foldAxis: defaults.foldAxis || 'h', dimMode: 'flat',
            stockIdx: defaults.stockIdx !== undefined ? defaults.stockIdx : (defaultStock >= 0 ? defaultStock : 0),
            coverStockIdx: -1, binding: 'stitch',
            sealType: 'none', coating: 'none',
            manualWeight: null, manualThick: null,
            customPanels: defaults.customPanels || false,
            flatWidth: defaults.flatWidth || null,
            flatHeight: defaults.flatHeight || null,
            finishedWidth: defaults.finishedWidth || null,
            finishedHeight: defaults.finishedHeight || null,
            layersAtFold: defaults.layersAtFold || null,
            caliper: 0, gsm: 0
        };
        const stock = STOCKS[comp.stockIdx];
        comp.caliper = stock.cal; comp.gsm = stock.gsm;
        State.components.push(comp);
        C.renderComponents(); C.calculate(); C.autoSave();
    }

    function duplicateComponent(id) {
        const orig = State.components.find(c => c.id === id); if (!orig) return;
        const newComp = { ...orig, id: State.nextId++, name: orig.name + ' (copy)' };
        const idx = State.components.findIndex(c => c.id === id);
        State.components.splice(idx + 1, 0, newComp);
        C.renderComponents(); C.calculate(); C.autoSave();
    }

    function removeComponent(id) {
        State.components = State.components.filter(c => c.id !== id);
        C.renderComponents(); C.calculate(); C.autoSave();
    }

    function clearAllComponents() {
        if (!State.components.length || !confirm('Remove all?')) return;
        State.components = [];
        C.renderComponents(); C.calculate(); C.autoSave();
    }

    function updateComponent(id, field, value) {
        const comp = State.components.find(c => c.id === id); if (!comp) return;
        if (field === 'stockIdx') {
            comp.stockIdx = parseInt(value);
            const s = STOCKS[comp.stockIdx];
            comp.caliper = s.cal; comp.gsm = s.gsm;
        } else if (field === 'w' || field === 'h') {
            const val = parseFloat(value);
            if ((comp.type === 'sheet' || comp.type === 'selfmailer') && comp.dimMode === 'finished') {
                const ply = parseInt(comp.fold);
                if (comp.foldAxis === 'h' && field === 'h') comp.h = val * ply;
                else if (comp.foldAxis === 'w' && field === 'w') comp.w = val * ply;
                else comp[field] = val;
            } else { comp[field] = val; }
        } else if (['flatWidth', 'flatHeight', 'finishedWidth', 'finishedHeight'].includes(field)) {
            comp[field] = parseFloat(value);
        } else if (field === 'layersAtFold') {
            comp[field] = parseInt(value);
        } else { comp[field] = value; }
        C.calculate(); C.autoSave();
    }

    function toggleDimMode(id) {
        const comp = State.components.find(c => c.id === id); if (!comp) return;
        comp.dimMode = comp.dimMode === 'flat' ? 'finished' : 'flat';
        C.renderComponents(); C.autoSave();
    }

    function toggleManual(id, mode) {
        const comp = State.components.find(c => c.id === id); if (!comp) return;
        if (mode === 'weight') { const v = prompt("Custom weight (oz):", comp.manualWeight || ""); comp.manualWeight = v ? parseFloat(v) : null; }
        if (mode === 'thick') { const v = prompt("Custom thickness (in):", comp.manualThick || ""); comp.manualThick = v ? parseFloat(v) : null; }
        C.renderComponents(); C.calculate(); C.autoSave();
    }

    function toggleCustomPanels(id) {
        const comp = State.components.find(c => c.id === id); if (!comp) return;
        comp.customPanels = !comp.customPanels;
        if (comp.customPanels && comp.flatWidth == null) {
            // Pre-populate from current standard values
            comp.flatWidth = comp.w;
            comp.flatHeight = comp.h;
            if (comp.type === 'sheet' || comp.type === 'selfmailer') {
                const ply = parseInt(comp.fold) || 1;
                comp.finishedWidth = comp.foldAxis === 'w' ? comp.w / ply : comp.w;
                comp.finishedHeight = comp.foldAxis === 'h' ? comp.h / ply : comp.h;
                comp.layersAtFold = ply;
            } else if (comp.type === 'accordion') {
                const ply = parseInt(comp.panels) || 1;
                comp.finishedWidth = comp.foldAxis === 'w' ? comp.w / ply : comp.w;
                comp.finishedHeight = comp.foldAxis === 'h' ? comp.h / ply : comp.h;
                comp.layersAtFold = ply;
            } else if (comp.type === 'booklet') {
                comp.finishedWidth = comp.w;
                comp.finishedHeight = comp.h;
                comp.layersAtFold = Math.ceil(comp.panels / 2);
            }
        }
        C.renderComponents(); C.calculate(); C.autoSave();
    }

    function addTemplate(id) {
        const t = TEMPLATES[id]; if (!t) return;
        const stockIdx = STOCKS.findIndex(s => s.name === t.stockName);
        const defaults = { name: t.name, w: t.w, h: t.h, fold: t.fold || '1', foldAxis: t.foldAxis || 'h', stockIdx: stockIdx >= 0 ? stockIdx : 0 };
        if (t.customPanels) {
            defaults.customPanels = true;
            defaults.flatWidth = t.flatWidth;
            defaults.flatHeight = t.flatHeight;
            defaults.finishedWidth = t.finishedWidth;
            defaults.finishedHeight = t.finishedHeight;
            defaults.layersAtFold = t.layersAtFold;
        }
        addComponent(t.type, defaults);
    }

    function addCustomStock() {
        const name = document.getElementById('customName').value.trim();
        const cal = parseFloat(document.getElementById('customCal').value);
        const gsm = parseFloat(document.getElementById('customGsm').value);
        const type = document.getElementById('customType').value;
        if (!name || isNaN(cal) || isNaN(gsm)) return alert('Fill all fields.');
        const newStock = { name, cal, gsm, type, source: 'custom', tolerance: 0.05 };
        STOCKS.push(newStock);
        const custom = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_STOCKS) || '[]');
        custom.push(newStock);
        localStorage.setItem(STORAGE_KEY_CUSTOM_STOCKS, JSON.stringify(custom));
        document.getElementById('customName').value = '';
        document.getElementById('customCal').value = '';
        document.getElementById('customGsm').value = '';
        document.getElementById('customStockModal').close();
        C.renderComponents();
        alert(`"${name}" added!`);
    }

    C.getName = getName;
    C.addComponent = addComponent;
    C.duplicateComponent = duplicateComponent;
    C.removeComponent = removeComponent;
    C.clearAllComponents = clearAllComponents;
    C.updateComponent = updateComponent;
    C.toggleDimMode = toggleDimMode;
    C.toggleManual = toggleManual;
    C.toggleCustomPanels = toggleCustomPanels;
    C.addTemplate = addTemplate;
    C.addCustomStock = addCustomStock;
})();
