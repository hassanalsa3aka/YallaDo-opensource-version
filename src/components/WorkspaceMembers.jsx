import { useState } from "react";

const WorkspaceMembers = ({ members, currentUserId, isOwner, onInvite, onRemoveMember }) => {
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageError = (memberId) => {
    setFailedImages((prev) => new Set(prev).add(memberId));
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const canRemove = isOwner && member.role !== "owner";
          const showFallback = failedImages.has(member.id) || !member.photoURL;
          return (
            <div key={member.id} className="flex items-center gap-1.5 bg-transparent border-2 border-line-strong rounded-full pl-1 pr-2.5 py-1">
              <div className="w-6 h-6 rounded-full bg-paper text-ink-900 overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0">
                {!showFallback ? (
                  <img 
                    src={member.photoURL} 
                    alt={member.displayName || "Member"} 
                    className="w-full h-full object-cover" 
                    onError={() => handleImageError(member.id)}
                  />
                ) : (
                  (member.displayName || "?").slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="text-xs text-text">{isSelf ? "You" : member.displayName || "Member"}</span>
              {canRemove && (
                <button
                  onClick={() => onRemoveMember(member)}
                  aria-label={`Remove ${member.displayName || "member"} from workspace`}
                  className="text-text-faint hover:text-accent-fg text-sm leading-none"
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>
      <span className="text-xs font-mono text-text-muted">
        {members.length} {members.length === 1 ? "person" : "people"} with access
      </span>
      <button
        onClick={onInvite}
        className="w-full sm:w-auto sm:ml-auto bg-accent hover:bg-accent-dim text-accent-ink rounded-sm px-4 py-2 text-sm font-semibold transition-colors duration-200"
      >
        Invite members
      </button>
    </div>
  );
};

export default WorkspaceMembers;
