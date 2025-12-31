
// Fix showModal to handle hiding Cancel
function showModal({ title = "", message = "", input = false, defaultValue = "", confirmText = "OK", cancelText = "Anuluj", hideCancel = false }) {
    return new Promise((resolve) => {
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

        if (hideCancel) {
            cModalCancel.style.display = "none";
        } else {
            cModalCancel.style.display = "";
        }

        cModal.classList.remove("hidden");
        cModal.setAttribute("aria-hidden", "false");

        // Ensure not hidden by classes
        cModal.style.display = "flex"; // Force flex

        if (input) {
            setTimeout(() => { cModalInput.focus(); cModalInput.select(); }, 50);
        } else {
            cModalConfirm.focus();
        }

        const close = (val) => {
            cleanup();
            cModal.classList.add("hidden");
            cModal.style.display = ""; // Reset inline
            cModal.setAttribute("aria-hidden", "true");
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

        // Global keydown for Escape if not input focused
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
