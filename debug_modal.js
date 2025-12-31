
// ====== MODAL LOGIC ======
function showModal({ title = "", message = "", input = false, defaultValue = "", confirmText = "OK", cancelText = "Anuluj", hideCancel = false }) {
    return new Promise((resolve) => {
        if (!cModal) return resolve(null);

        cModalTitle.textContent = title;
        cModalMessage.textContent = message;

        if (input) {
            cModalInput.value = defaultValue;
            cModalInput.classList.remove("hidden");
        } else {
            cModalInput.classList.add("hidden");
        }

        cModalConfirm.textContent = confirmText;
        cModalCancel.textContent = cancelText;

        cModalCancel.style.display = hideCancel ? "none" : "";

        cModal.classList.remove("hidden");
        cModal.setAttribute("aria-hidden", "false");

        // IMPORTANT: CSS class .modal.hidden { display: none }
        // Removing .hidden removes display:none.
        // But if styles are broken or cached, or specificity issues exist...
        // Let + ' + s force it.
        cModal.style.display = "flex"; // Modal is flex centered

        if (input) {
            setTimeout(() => { cModalInput.focus(); cModalInput.select(); }, 50);
        } else {
            cModalConfirm.focus();
        }

        const close = (val) => {
            cleanup();
            cModal.classList.add("hidden");
            cModal.setAttribute("aria-hidden", "true");
            cModal.style.display = ""; // Reset
            resolve(val);
        };

        const onConfirm = () => {
            if (input) close(cModalInput.value);
            else close(true);
        };
        const onCancel = () => {
            close(input ? null : false);
        };
        const onKey = (e) => {
            if (e.key === "Enter") onConfirm();
            if (e.key === "Escape") onCancel();
        };

        cModalConfirm.onclick = onConfirm;
        cModalCancel.onclick = onCancel;
        cModalInput.onkeydown = onKey;

        const globalKey = (e) => {
             if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", globalKey);

        function cleanup() {
            cModalConfirm.onclick = null;
            cModalCancel.onclick = null;
            cModalInput.onkeydown = null;
            document.removeEventListener("keydown", globalKey);
        }
    });
}
