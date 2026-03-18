// app/state.js
// Shared application state for MailSpec

(function() {
    window.MailSpec = window.MailSpec || {};

    window.MailSpec.State = {
        components: [],
        nextId: 1,
        globalBuffer: 5,
        globalThickBuffer: 5,
        globalSealType: 'none',
        globalSealQty: 0,
        stockSearchTerm: '',
        lastBomData: []
    };

    window.MailSpec.STORAGE_KEY_CURRENT = 'mailspec_current_assembly';
    window.MailSpec.STORAGE_KEY_CONFIGS = 'mailspec_saved_configs';
})();
