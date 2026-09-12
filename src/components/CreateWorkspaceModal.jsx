import { useEffect, useRef, useState } from "react";

const CreateWorkspaceModal = ({ isOpen, isCreating, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const canCreate = trimmedName.length >= 2 && !isCreating;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canCreate) return;
    onCreate(trimmedName);
  };

  return (
    <div
      className="fixed inset-0 bg-ink-overlay flex items-center justify-center p-5 z-20 animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="bg-paper border-2 border-ink-900 rounded-md w-full max-w-sm p-6 shadow-card-lg animate-pop-in">
        <h3 className="font-display text-lg font-bold text-ink-900 mb-1">Create workspace</h3>
        <p className="text-sm text-text-faint mb-4">
          Give your team a place to track shared tasks. Invite people once it&apos;s created.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="workspace-name" className="block text-xs font-mono font-semibold uppercase tracking-wide text-text-faint mb-1.5">
            Workspace name
          </label>
          <input
            id="workspace-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Marketing Launch"
            maxLength={60}
            autoComplete="off"
            className="w-full border-2 border-paper-line bg-paper-dim rounded-sm px-3 py-2 text-sm text-ink-900 placeholder:text-text-faint focus:border-accent transition-colors duration-200"
          />
          <p className="text-xs text-text-faint mt-1.5">At least 2 characters.</p>
          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm border-2 border-paper-line text-ink-900 text-sm font-semibold hover:border-ink-900 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canCreate}
              className="px-4 py-2 rounded-sm bg-accent hover:bg-accent-dim text-accent-ink text-sm font-semibold disabled:opacity-40 transition-colors duration-200"
            >
              Create workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
