// app/components/ui-controls.js
// Global adjustment controls, seal info, and mobile navigation for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Components = window.MailSpec.Components || {};

    const State = window.MailSpec.State;
    const SEALS = window.MailSpec.SEALS;
    const C = window.MailSpec.Components;

    function updateGlobalBuffer(val) { State.globalBuffer = parseFloat(val) || 0; C.calculate(); C.autoSave(); }
    function updateGlobalThickBuffer(val) { State.globalThickBuffer = parseFloat(val) || 0; C.calculate(); C.autoSave(); }

    function updateGlobalSeal() {
        State.globalSealType = document.getElementById('globalSealType').value;
        State.globalSealQty = parseInt(document.getElementById('globalSealQty').value) || 0;
        updateSealInfo();
        C.calculate();
        C.autoSave();
    }

    function updateSealInfo() {
        const infoEl = document.getElementById('sealInfo');
        if (State.globalSealType === 'none' || State.globalSealQty === 0) {
            infoEl.textContent = '';
            infoEl.className = 'text-[10px] text-slate-400 mt-1 hidden';
        } else {
            const seal = SEALS[State.globalSealType];
            const totalThick = (seal.thick * State.globalSealQty).toFixed(4);
            const totalWeight = (seal.weight * State.globalSealQty).toFixed(4);
            const labels = { wafer: 'Wafer Tab', glue_dot: 'Glue Dot', line_glue: 'Line Glue' };
            infoEl.innerHTML = `<span class="text-emerald-600 font-medium">${State.globalSealQty}× ${labels[State.globalSealType]}</span>: +${totalThick}" / +${totalWeight} oz`;
            infoEl.className = 'text-[10px] text-slate-600 mt-1';
        }
    }

    function switchTab(tab) {
        const body = document.body;
        const tabBuild = document.getElementById('tabBuild');
        const tabResults = document.getElementById('tabResults');

        if (tab === 'build') {
            body.classList.remove('show-results');
            tabBuild.classList.add('active');
            tabResults.classList.remove('active');
        } else if (tab === 'results') {
            body.classList.add('show-results');
            tabBuild.classList.remove('active');
            tabResults.classList.add('active');
        }
    }

    // Update both autosave indicators (desktop and mobile)
    function showAutosaveStatusBoth(status) {
        C.showAutosaveStatus(status);
        const mobileEl = document.getElementById('autosaveIndicatorMobile');
        if (mobileEl) {
            mobileEl.className = status === 'Saving...' ? 'autosave-indicator saving' : 'autosave-indicator';
            mobileEl.innerHTML = `<span class="material-symbols-outlined text-sm">${status === 'Saving...' ? 'sync' : 'check_circle'}</span>`;
        }
    }

    C.updateGlobalBuffer = updateGlobalBuffer;
    C.updateGlobalThickBuffer = updateGlobalThickBuffer;
    C.updateGlobalSeal = updateGlobalSeal;
    C.updateSealInfo = updateSealInfo;
    C.switchTab = switchTab;
    C.showAutosaveStatusBoth = showAutosaveStatusBoth;
})();
