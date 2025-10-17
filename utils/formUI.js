'use strict';

function changeEnterToTab(form) {
    const focusables = Array.from(form.querySelectorAll('input, select, textarea'));
    focusables.forEach((el, idx) => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // Enter in Select soll Option wählen, nicht springen
                if (el.tagName === 'SELECT') return;
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