// app/components/config-manager.js
// Configuration save, load, delete, and import/export for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Components = window.MailSpec.Components || {};

    const State = window.MailSpec.State;
    const STOCKS = window.MailSpec.STOCKS;
    const C = window.MailSpec.Components;
    const STORAGE_KEY_CONFIGS = window.MailSpec.STORAGE_KEY_CONFIGS;
    const STORAGE_KEY_CUSTOM_STOCKS = window.MailSpec.STORAGE_KEY_CUSTOM_STOCKS;

    function saveConfiguration() {
        const name = document.getElementById('configName').value.trim();
        if (!name) return alert('Enter a name.');
        if (State.components.length === 0) return alert('No components to save.');
        const configs = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIGS) || '{}');
        configs[name] = { components: State.components, globalBuffer: State.globalBuffer, globalThickBuffer: State.globalThickBuffer, globalSealType: State.globalSealType, globalSealQty: State.globalSealQty, nextId: State.nextId, savedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(configs));
        document.getElementById('configName').value = '';
        renderConfigList();
        alert(`"${name}" saved!`);
    }

    function loadConfiguration(name) {
        const configs = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIGS) || '{}');
        const config = configs[name];
        if (!config) return alert('Not found.');
        if (State.components.length && !confirm('Replace current assembly?')) return;
        State.components = config.components || [];
        State.globalBuffer = config.globalBuffer || 5;
        State.globalThickBuffer = config.globalThickBuffer || 5;
        State.globalSealType = config.globalSealType || 'none';
        State.globalSealQty = config.globalSealQty || 0;
        State.nextId = config.nextId || 1;
        document.getElementById('globalWeightBuffer').value = State.globalBuffer;
        document.getElementById('globalThickBuffer').value = State.globalThickBuffer;
        document.getElementById('globalSealType').value = State.globalSealType;
        document.getElementById('globalSealQty').value = State.globalSealQty;
        C.updateSealInfo();
        C.renderComponents();
        C.calculate();
        C.autoSave();
        document.getElementById('configModal').close();
    }

    function deleteConfiguration(name) {
        if (!confirm(`Delete "${name}"?`)) return;
        const configs = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIGS) || '{}');
        delete configs[name];
        localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify(configs));
        renderConfigList();
    }

    function renderConfigList() {
        const container = document.getElementById('configList');
        const configs = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIGS) || '{}');
        const names = Object.keys(configs);
        if (names.length === 0) { container.innerHTML = '<p class="text-sm text-slate-400 py-4 text-center">No saved configurations</p>'; return; }
        container.innerHTML = names.map(name => {
            const c = configs[name];
            return `<div class="config-item"><div><div class="font-bold text-sm">${name}</div><div class="text-xs text-slate-400">${c.components?.length || 0} items</div></div><div class="flex gap-2"><button class="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded hover:bg-indigo-200" onclick="loadConfiguration('${name}')">Load</button><button class="p-1 text-slate-400 hover:text-red-500" onclick="deleteConfiguration('${name}')"><span class="material-symbols-outlined text-sm">delete</span></button></div></div>`;
        }).join('');
    }

    function exportConfigurations() {
        const data = { version: '2.3', exportedAt: new Date().toISOString(), configurations: JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIGS) || '{}'), customStocks: JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_STOCKS) || '[]') };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `mailspec-configs-${new Date().toISOString().split('T')[0]}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }

    function importConfigurations(event) {
        const file = event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.configurations) { const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIGS) || '{}'); localStorage.setItem(STORAGE_KEY_CONFIGS, JSON.stringify({ ...existing, ...data.configurations })); }
                if (data.customStocks?.length) { const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_STOCKS) || '[]'); const newOnes = data.customStocks.filter(s => !existing.find(e => e.name === s.name)); localStorage.setItem(STORAGE_KEY_CUSTOM_STOCKS, JSON.stringify([...existing, ...newOnes])); newOnes.forEach(s => STOCKS.push(s)); }
                renderConfigList(); alert('Import successful!');
            } catch (err) { alert('Import failed.'); }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    C.saveConfiguration = saveConfiguration;
    C.loadConfiguration = loadConfiguration;
    C.deleteConfiguration = deleteConfiguration;
    C.renderConfigList = renderConfigList;
    C.exportConfigurations = exportConfigurations;
    C.importConfigurations = importConfigurations;
})();
