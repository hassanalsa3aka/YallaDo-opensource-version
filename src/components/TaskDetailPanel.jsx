import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { db } from "../firebase";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

const STATUS_OPTIONS = [
  { value: "todo", label: "Todo" },
  { value: "inProgress", label: "In Progress" },
  { value: "closed", label: "Closed" },
];

const initials = (name) => (name || "?").trim().slice(0, 2).toUpperCase();

const formatTimestamp = (timestamp) => {
  if (!timestamp?.toDate) return "";
  return timestamp.toDate().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TaskDetailPanel = ({ task, isOpen, onClose, members, currentUser, isPersonal }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const commentsEndRef = useRef(null);
  const assigneeMenuRef = useRef(null);

  const handleImageError = (imageId) => {
    setFailedImages((prev) => new Set(prev).add(imageId));
  };

  useEffect(() => {
    setTitle(task?.name || "");
    setDescription(task?.description || "");
    setDueDate(task?.dueDate || "");
    // Only resync when switching tasks — resyncing on every field change would
    // overwrite text the user is still typing when the doc updates elsewhere.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !task) {
      setComments([]);
      return undefined;
    }

    setCommentsLoading(true);
    const q = query(
      collection(db, "taskComments"),
      where("taskId", "==", task.id),
      where("workspaceId", "==", task.workspaceId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentList = snapshot.docs.map((commentDoc) => ({ id: commentDoc.id, ...commentDoc.data() }));
      commentList.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setComments(commentList);
      setCommentsLoading(false);
    }, (error) => {
      console.error("Comments error:", error);
      toast.error("Failed to fetch comments.");
      setCommentsLoading(false);
    });

    return () => unsubscribe();
    // Depend on the id/workspaceId primitives, not the object, so unrelated
    // task field updates don't retrigger this and flash the comments skeleton.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task?.id, task?.workspaceId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [comments.length]);

  useEffect(() => {
    if (!isAssigneeMenuOpen) return undefined;
    const handleClickOutside = (event) => {
      if (assigneeMenuRef.current && !assigneeMenuRef.current.contains(event.target)) {
        setIsAssigneeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAssigneeMenuOpen]);

  useEffect(() => {
    setIsAssigneeMenuOpen(false);
  }, [task?.id]);

  if (!isOpen || !task) return null;

  const saveTitle = async () => {
    const trimmed = title.trim();
    if (trimmed === task.name) return;
    if (trimmed.length < 3) {
      setTitle(task.name);
      return toast.error("A task must have more than 3 characters.");
    }
    try {
      await updateDoc(doc(db, "tasks", task.id), { name: trimmed });
      toast.success("Title updated");
    } catch (error) {
      console.error("Title update error:", error);
      toast.error("Failed to update title.");
    }
  };

  const saveDescription = async () => {
    if (description === (task.description || "")) return;
    try {
      await updateDoc(doc(db, "tasks", task.id), { description });
      toast.success("Description updated");
    } catch (error) {
      console.error("Description update error:", error);
      toast.error("Failed to update description.");
    }
  };

  const updateStatus = async (status) => {
    try {
      await updateDoc(doc(db, "tasks", task.id), { status });
      toast("Task status changed", { icon: "👍" });
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status.");
    }
  };

  const assigneeIds = task.assigneeIds || [];

  const addAssignee = async (userId) => {
    setIsAssigneeMenuOpen(false);
    if (assigneeIds.includes(userId)) return;
    try {
      await updateDoc(doc(db, "tasks", task.id), { assigneeIds: [...assigneeIds, userId] });
      toast.success("Assignee added");
    } catch (error) {
      console.error("Assignee update error:", error);
      toast.error("Failed to update assignees.");
    }
  };

  const removeAssignee = async (userId) => {
    try {
      await updateDoc(doc(db, "tasks", task.id), { assigneeIds: assigneeIds.filter((id) => id !== userId) });
      toast.success("Assignee removed");
    } catch (error) {
      console.error("Assignee update error:", error);
      toast.error("Failed to update assignees.");
    }
  };

  const updateDueDate = async (value) => {
    setDueDate(value);
    try {
      await updateDoc(doc(db, "tasks", task.id), { dueDate: value || null });
      toast.success("Due date updated");
    } catch (error) {
      console.error("Due date update error:", error);
      toast.error("Failed to update due date.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "tasks", task.id));
      toast("Task removed", { icon: "☠️" });
      onClose();
    } catch (error) {
      console.error("Error removing task:", error);
      toast.error("Failed to remove task");
    }
  };

  const sendComment = async (event) => {
    event.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    try {
      await addDoc(collection(db, "taskComments"), {
        taskId: task.id,
        workspaceId: task.workspaceId,
        userId: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        text: trimmed,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (error) {
      console.error("Comment error:", error);
      toast.error("Failed to send message.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink-overlay z-30 animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-y-0 right-0 w-full sm:w-[92vw] md:w-[46rem] max-w-full bg-paper border-l-2 border-ink-900 shadow-panel flex flex-col animate-slide-in-right">
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={saveTitle}
            className="font-display text-xl font-bold text-ink-900 w-full border-none bg-transparent focus:outline-none focus-visible:shadow-focus rounded-sm px-1 -ml-1"
          />
          <button onClick={onClose} aria-label="Close" className="text-ink-900/40 hover:text-ink-900 text-2xl leading-none px-1 shrink-0">
            &times;
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden mt-4">
          <div className="flex-1 md:overflow-y-auto px-5 sm:px-6 pb-6 space-y-5">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wide text-text-faint mb-1.5">Status</label>
                <select
                  value={task.status}
                  onChange={(event) => updateStatus(event.target.value)}
                  className="border-2 border-paper-line rounded-sm px-3 py-1.5 text-sm text-ink-900 bg-paper-dim focus:border-accent transition-colors duration-200"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wide text-text-faint mb-1.5">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => updateDueDate(event.target.value)}
                  className="border-2 border-paper-line rounded-sm px-3 py-1.5 text-sm text-ink-900 bg-paper-dim focus:border-accent transition-colors duration-200"
                />
              </div>
            </div>

            {!isPersonal && (
              <div className="relative" ref={assigneeMenuRef}>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wide text-text-faint mb-1.5">Assignees</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {assigneeIds.map((userId) => {
                    const member = members.find((m) => m.userId === userId);
                    const name = userId === currentUser.uid ? "You" : member?.displayName || "Member";
                    return (
                      <div key={userId} className="relative group">
                        <div
                          title={name}
                          className="w-8 h-8 rounded-full bg-ink-900 text-paper text-[10px] font-bold flex items-center justify-center overflow-hidden border-2 border-paper"
                        >
                          {member?.photoURL && !failedImages.has(`assignee-${userId}`) ? (
                            <img 
                              src={member.photoURL} 
                              alt={name} 
                              className="w-full h-full object-cover" 
                              onError={() => handleImageError(`assignee-${userId}`)}
                            />
                          ) : (
                            initials(name)
                          )}
                        </div>
                        <button
                          onClick={() => removeAssignee(userId)}
                          aria-label={`Remove ${name} from task`}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setIsAssigneeMenuOpen((open) => !open)}
                    aria-label="Add assignee"
                    className="w-8 h-8 rounded-full border-2 border-dashed border-ink-900/30 text-ink-900/50 hover:border-accent hover:text-accent-dim flex items-center justify-center text-base leading-none transition-colors duration-200"
                  >
                    +
                  </button>
                </div>

                {isAssigneeMenuOpen && (
                  <div className="absolute z-10 mt-1 w-52 bg-paper border-2 border-ink-900 rounded-sm shadow-card-lg py-1">
                    {members.filter((member) => !assigneeIds.includes(member.userId)).length === 0 && (
                      <p className="text-xs text-text-faint px-3 py-1.5">Everyone is already assigned.</p>
                    )}
                    {members
                      .filter((member) => !assigneeIds.includes(member.userId))
                      .map((member) => (
                        <button
                          key={member.userId}
                          onClick={() => addAssignee(member.userId)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-ink-900 hover:bg-accent-soft text-left transition-colors duration-200"
                        >
                          <div className="w-6 h-6 rounded-full bg-ink-900 text-paper text-[10px] font-bold flex items-center justify-center overflow-hidden shrink-0">
                            {member.photoURL && !failedImages.has(`member-${member.userId}`) ? (
                              <img 
                                src={member.photoURL} 
                                alt={member.displayName || "Member"} 
                                className="w-full h-full object-cover" 
                                onError={() => handleImageError(`member-${member.userId}`)}
                              />
                            ) : (
                              initials(member.userId === currentUser.uid ? "You" : member.displayName)
                            )}
                          </div>
                          {member.userId === currentUser.uid ? "You" : member.displayName || "Member"}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-wide text-text-faint mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onBlur={saveDescription}
                rows={6}
                placeholder="Add more detail about this task..."
                className="w-full border-2 border-paper-line rounded-sm px-3 py-2 text-sm text-ink-900 bg-paper-dim placeholder:text-text-faint resize-none focus:border-accent transition-colors duration-200"
              />
            </div>

            <button onClick={handleDelete} className="text-sm font-semibold text-red-700 hover:text-red-800">
              Delete task
            </button>
          </div>

          <div className="w-full md:w-72 border-t-2 md:border-t-0 md:border-l-2 border-paper-line flex flex-col shrink-0">
            <div className="px-4 py-3 border-b-2 border-paper-line">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wide text-text-faint">Comments</h4>
            </div>
            <div className="flex-1 md:overflow-y-auto px-4 py-3 space-y-3 min-h-[160px]">
              {commentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-paper-line animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5 pt-0.5">
                        <div className="h-2.5 w-20 rounded bg-paper-line animate-pulse" />
                        <div className="h-3 w-full rounded bg-paper-line/70 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {comments.length === 0 && <p className="text-xs text-text-faint">No comments yet.</p>}
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-ink-900 text-paper text-[10px] font-bold flex items-center justify-center overflow-hidden shrink-0">
                        {comment.photoURL && !failedImages.has(`comment-${comment.id}`) ? (
                          <img 
                            src={comment.photoURL} 
                            alt={comment.displayName || "Member"} 
                            className="w-full h-full object-cover" 
                            onError={() => handleImageError(`comment-${comment.id}`)}
                          />
                        ) : (
                          initials(comment.displayName)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-ink-900">
                            {comment.userId === currentUser.uid ? "You" : comment.displayName || "Member"}
                          </span>
                          <span className="text-[10px] font-mono text-text-faint">{formatTimestamp(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-ink-900 break-words">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div ref={commentsEndRef} />
            </div>
            <form onSubmit={sendComment} className="flex gap-2 p-3 border-t-2 border-paper-line">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Message the team..."
                className="flex-1 border-2 border-paper-line rounded-sm px-3 py-1.5 text-sm bg-paper-dim placeholder:text-text-faint focus:border-accent transition-colors duration-200"
              />
              <button type="submit" className="bg-accent hover:bg-accent-dim text-accent-ink rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors duration-200">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPanel;
