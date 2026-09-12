import { useEffect } from "react";

const DeleteWorkspaceModal = ({ workspace, isOpen, isDeleting, onClose, onConfirm }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !workspace) return null;

  return (
    <div
      className="fixed inset-0 bg-ink-overlay flex items-center justify-center p-5 z-40 animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="bg-paper border-2 border-ink-900 rounded-md w-full max-w-sm p-6 shadow-card-lg animate-pop-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-sm bg-red-100 text-red-600 flex items-center justify-center shrink-0 border-2 border-ink-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-bold text-ink-900">Delete workspace?</h3>
        </div>
        <p className="text-sm text-text-faint mb-5">
          This permanently deletes <span className="font-semibold text-ink-900">&quot;{workspace.name}&quot;</span>, along with all of
          its tasks and comments, and removes access for everyone in it. This can&apos;t be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-sm border-2 border-paper-line text-ink-900 text-sm font-semibold disabled:opacity-50 hover:border-ink-900 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors duration-200"
          >
            {isDeleting ? "Deleting..." : "Delete workspace"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteWorkspaceModal;
