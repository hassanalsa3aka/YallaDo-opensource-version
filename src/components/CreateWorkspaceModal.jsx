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
      className="fixed inset-0 bg-slate-700/40 flex items-center justify-center p-5 z-20"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Create workspace</h3>
        <p className="text-sm text-slate-500 mb-4">
          Give your team a place to track shared tasks. Invite people once it&apos;s created.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="workspace-name" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
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
            className="w-full border border-slate-300 bg-slate-50 rounded-md px-3 py-2 text-sm text-slate-800"
          />
          <p className="text-xs text-slate-400 mt-1.5">At least 2 characters.</p>
          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canCreate}
              className="px-4 py-2 rounded-md bg-cyan-600 text-white text-sm font-semibold disabled:opacity-50"
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
