const WorkspaceMembers = ({ members, currentUserId, isOwner, onInvite, onRemoveMember }) => {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const canRemove = isOwner && member.role !== "owner";
          return (
            <div key={member.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full pl-1 pr-2 py-1">
              <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                {member.photoURL ? (
                  <img src={member.photoURL} alt={member.displayName || "Member"} className="w-full h-full object-cover" />
                ) : (
                  (member.displayName || "?").slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="text-xs text-slate-700">{isSelf ? "You" : member.displayName || "Member"}</span>
              {canRemove && (
                <button
                  onClick={() => onRemoveMember(member)}
                  aria-label={`Remove ${member.displayName || "member"} from workspace`}
                  className="text-slate-400 hover:text-red-500 text-sm leading-none"
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>
      <span className="text-xs text-slate-500">
        {members.length} {members.length === 1 ? "person" : "people"} with access
      </span>
      <button onClick={onInvite} className="ml-auto bg-slate-700 text-white rounded-md px-4 py-2 text-sm font-semibold">
        Invite members
      </button>
    </div>
  );
};

export default WorkspaceMembers;
