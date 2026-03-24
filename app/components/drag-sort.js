// app/components/drag-sort.js
// Drag-to-reorder for component cards in the build panel

(function() {
    window.MailSpec = window.MailSpec || {};
    window.MailSpec.Components = window.MailSpec.Components || {};

    const State = window.MailSpec.State;
    const C = window.MailSpec.Components;

    let draggedId = null;
    let touchClone = null;
    let touchStartY = 0;
    let touchCurrentTarget = null;

    // --- HTML5 Drag and Drop (desktop) ---

    function onDragStart(e) {
        const card = e.target.closest('.component-card');
        if (!card) return;

        // Don't drag when interacting with inputs, selects, buttons
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'select' || tag === 'button' || tag === 'textarea' || e.target.closest('button')) {
            e.preventDefault();
            return;
        }

        // Only allow drag from header area
        const header = card.querySelector('.drag-header');
        if (!header || !header.contains(e.target)) {
            e.preventDefault();
            return;
        }

        draggedId = parseInt(card.dataset.componentId);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedId);
    }

    function onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const card = e.target.closest('.component-card');
        if (!card || parseInt(card.dataset.componentId) === draggedId) return;

        clearDropIndicators();
        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
            card.classList.add('drag-over-top');
        } else {
            card.classList.add('drag-over-bottom');
        }
    }

    function onDrop(e) {
        e.preventDefault();
        const targetCard = e.target.closest('.component-card');
        if (!targetCard || draggedId == null) return;

        const targetId = parseInt(targetCard.dataset.componentId);
        if (targetId === draggedId) return;

        const rect = targetCard.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const insertBefore = e.clientY < midY;

        reorderComponents(draggedId, targetId, insertBefore);
    }

    function onDragEnd() {
        clearDropIndicators();
        const cards = document.querySelectorAll('.component-card');
        cards.forEach(c => c.classList.remove('dragging'));
        draggedId = null;
    }

    // --- Touch support (mobile) ---

    function onTouchStart(e) {
        const handle = e.target.closest('.drag-handle');
        if (!handle) return;

        const card = handle.closest('.component-card');
        if (!card) return;

        draggedId = parseInt(card.dataset.componentId);
        touchStartY = e.touches[0].clientY;

        // Create visual clone
        touchClone = card.cloneNode(true);
        touchClone.style.position = 'fixed';
        touchClone.style.zIndex = '9999';
        touchClone.style.width = card.offsetWidth + 'px';
        touchClone.style.opacity = '0.85';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.transform = 'rotate(1deg) scale(1.02)';
        touchClone.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        const rect = card.getBoundingClientRect();
        touchClone.style.left = rect.left + 'px';
        touchClone.style.top = rect.top + 'px';
        document.body.appendChild(touchClone);

        card.classList.add('dragging');
    }

    function onTouchMove(e) {
        if (draggedId == null || !touchClone) return;
        e.preventDefault();

        const touch = e.touches[0];
        const dy = touch.clientY - touchStartY;
        const origCard = document.querySelector(`.component-card[data-component-id="${draggedId}"]`);
        if (origCard) {
            const origRect = origCard.getBoundingClientRect();
            touchClone.style.top = (origRect.top + dy) + 'px';
        }

        clearDropIndicators();
        const target = getCardAtPoint(touch.clientX, touch.clientY);
        touchCurrentTarget = target;
        if (target && parseInt(target.dataset.componentId) !== draggedId) {
            const rect = target.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (touch.clientY < midY) {
                target.classList.add('drag-over-top');
            } else {
                target.classList.add('drag-over-bottom');
            }
        }
    }

    function onTouchEnd() {
        if (draggedId == null) return;

        if (touchCurrentTarget) {
            const targetId = parseInt(touchCurrentTarget.dataset.componentId);
            if (targetId !== draggedId) {
                const rect = touchCurrentTarget.getBoundingClientRect();
                const cloneRect = touchClone ? touchClone.getBoundingClientRect() : rect;
                const cloneMid = cloneRect.top + cloneRect.height / 2;
                const insertBefore = cloneMid < rect.top + rect.height / 2;
                reorderComponents(draggedId, targetId, insertBefore);
            }
        }

        cleanupTouch();
    }

    function cleanupTouch() {
        clearDropIndicators();
        const cards = document.querySelectorAll('.component-card');
        cards.forEach(c => c.classList.remove('dragging'));
        if (touchClone && touchClone.parentNode) {
            touchClone.parentNode.removeChild(touchClone);
        }
        touchClone = null;
        draggedId = null;
        touchCurrentTarget = null;
    }

    function getCardAtPoint(x, y) {
        // Hide clone temporarily to hit-test underlying elements
        if (touchClone) touchClone.style.display = 'none';
        const el = document.elementFromPoint(x, y);
        if (touchClone) touchClone.style.display = '';
        return el ? el.closest('.component-card') : null;
    }

    // --- Shared helpers ---

    function clearDropIndicators() {
        document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
            el.classList.remove('drag-over-top', 'drag-over-bottom');
        });
    }

    function reorderComponents(fromId, toId, insertBefore) {
        const fromIdx = State.components.findIndex(c => c.id === fromId);
        const toIdx = State.components.findIndex(c => c.id === toId);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

        const [moved] = State.components.splice(fromIdx, 1);
        let newIdx = State.components.findIndex(c => c.id === toId);
        if (!insertBefore) newIdx++;
        State.components.splice(newIdx, 0, moved);

        C.renderComponents();
        C.calculate();
        C.autoSave();
    }

    // --- Initialize event listeners ---

    function initDragSort() {
        const list = document.getElementById('componentList');
        if (!list) return;

        // Desktop drag events (delegated)
        list.addEventListener('dragstart', onDragStart);
        list.addEventListener('dragover', onDragOver);
        list.addEventListener('drop', onDrop);
        list.addEventListener('dragend', onDragEnd);

        // Mobile touch events (delegated)
        list.addEventListener('touchstart', onTouchStart, { passive: true });
        list.addEventListener('touchmove', onTouchMove, { passive: false });
        list.addEventListener('touchend', onTouchEnd);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDragSort);
    } else {
        initDragSort();
    }

    C.initDragSort = initDragSort;
})();
