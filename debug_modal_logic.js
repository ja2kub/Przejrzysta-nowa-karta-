
// ====== MODAL LOGIC ======
function showModal({ title = "", message = "", input = false, defaultValue = "", confirmText = "OK", cancelText = "Anuluj", hideCancel = false }) {
    return new Promise((resolve) => {
        if (!cModal) {
            console.error("Custom modal element not found!");
            return resolve(null);
        }

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

        // Ensure hidden class removal works
        cModal.classList.remove("hidden");
        // Also ensure aria-hidden is updated
        cModal.setAttribute("aria-hidden", "false");

        // Debug
        console.log("ShowModal called. Classes:", cModal.className);

        if (input) {
            setTimeout(() => { cModalInput.focus(); cModalInput.select(); }, 50);
        } else {
            cModalConfirm.focus();
        }
