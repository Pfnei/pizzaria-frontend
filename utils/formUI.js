'use strict';

function changeEnterToTab(form) {
    const focusables = Array.from(form.querySelectorAll('input, select, textarea'));
    focusables.forEach((el, idx) => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (el.tagName === 'TEXTAREA') return;
                // Enter in Select shall choose an option, not jump to next
                if (el.tagName === 'SELECT') return;
                // Default would submit form
                e.preventDefault();
                let next = idx + 1;
                while (next < focusables.length) {
                    const candidate = focusables[next];
                    if (!candidate.disabled && candidate.offsetParent !== null) {
                        candidate.focus();
                        break;
                    }
                    next++;
                }
            }
        });
    });
}