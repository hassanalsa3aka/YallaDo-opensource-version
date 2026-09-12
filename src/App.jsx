import { useState, useEffect } from "react";
import CreateTask from "./components/CreateTask";
import ListTasks from "./components/ListTasks";
import toast, { Toaster } from "react-hot-toast";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useAuth from "./useAuth";
import CreateWorkspaceModal from "./components/CreateWorkspaceModal";
import DeleteWorkspaceModal from "./components/DeleteWorkspaceModal";
import LandingPage from "./components/LandingPage";
import InviteWelcomeModal from "./components/InviteWelcomeModal";
import WorkspaceMembers from "./components/WorkspaceMembers";
import TaskDetailPanel from "./components/TaskDetailPanel";
import { db } from "./firebase";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import googleLogo from "./assets/google.png";
import Logo from "./components/Logo";
import ThemeToggle from "./components/ThemeToggle";

const getStoredTheme = () => {
  try {
    return localStorage.getItem("theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

function App() {
  const [theme, setTheme] = useState(getStoredTheme);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("my");
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [workspacesLoading, setWorkspacesLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [pendingInviteWorkspaceId, setPendingInviteWorkspaceId] = useState(null);
  const [isInviteModalDismissed, setIsInviteModalDismissed] = useState(false);
  const { user, authLoading, loginWithGoogle, logout } = useAuth();

  const inviteToken = new URLSearchParams(window.location.search).get("invite");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Private browsing / storage disabled — theme just won't persist across reloads.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setWorkspacesLoading(true);
      return;
    }

    const q = query(collection(db, "workspaces"), where("memberIds", "array-contains", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workspaceList = snapshot.docs.map((workspaceDoc) => ({
        id: workspaceDoc.id,
        ...workspaceDoc.data(),
      }));
      setWorkspaces(workspaceList);
      setWorkspacesLoading(false);
      const personalWorkspace = workspaceList.find((workspace) => workspace.ownerId === user.uid && workspace.isPersonal);
      if (personalWorkspace && activeTab === "my") setSelectedWorkspace(personalWorkspace);
    }, (error) => {
      console.error("Workspace error:", error);
      toast.error("Failed to fetch workspaces. Check permissions.");
      setWorkspacesLoading(false);
    });

    return () => unsubscribe();
  }, [user, activeTab]);

  const personalWorkspace = workspaces.find((workspace) => workspace.ownerId === user?.uid && workspace.isPersonal);
  const teamWorkspaces = workspaces.filter((workspace) => !workspace.isPersonal);
  const activeWorkspace = activeTab === "my" ? personalWorkspace : selectedWorkspace;

  useEffect(() => {
    // Skip while an invite is about to navigate to a specific workspace —
    // otherwise this would jump to the first workspace instead.
    if (activeTab !== "team" || pendingInviteWorkspaceId) return;
    const stillExists = selectedWorkspace && teamWorkspaces.some((workspace) => workspace.id === selectedWorkspace.id);
    if (!stillExists) setSelectedWorkspace(teamWorkspaces[0] || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, workspaces, pendingInviteWorkspaceId]);

  useEffect(() => {
    if (!pendingInviteWorkspaceId) return;
    const match = workspaces.find((workspace) => workspace.id === pendingInviteWorkspaceId);
    if (match) {
      setSelectedWorkspace(match);
      setPendingInviteWorkspaceId(null);
    }
  }, [workspaces, pendingInviteWorkspaceId]);

  useEffect(() => {
    document.title = activeWorkspace?.name || "My Tasks";
  }, [activeWorkspace]);

  useEffect(() => {
    if (!user || activeTab !== "team" || !selectedWorkspace || selectedWorkspace.isPersonal) {
      setMembers([]);
      setMembersLoading(false);
      return undefined;
    }

    setMembersLoading(true);
    const q = query(collection(db, "workspaceMembers"), where("workspaceId", "==", selectedWorkspace.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map((memberDoc) => ({ id: memberDoc.id, ...memberDoc.data() })));
      setMembersLoading(false);
    }, (error) => {
      console.error("Members error:", error);
      toast.error("Failed to fetch workspace members.");
      setMembersLoading(false);
    });

    return () => unsubscribe();
    // Depend on the id/isPersonal fields, not the object, so unrelated workspace
    // updates don't retrigger this and flash the members skeleton needlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, selectedWorkspace?.id, selectedWorkspace?.isPersonal]);

  useEffect(() => {
    if (!user || !activeWorkspace) {
      setTasks([]);
      setTasksLoading(true);
      return undefined;
    }

    setTasksLoading(true);
    const q = query(collection(db, "tasks"), where("workspaceId", "==", activeWorkspace.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskList);
      setTasksLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      toast.error("Failed to fetch tasks. Check permissions.");
      setTasksLoading(false);
    });

    return () => unsubscribe();
    // Depend on the id, not the object, so unrelated workspace updates don't
    // retrigger this and flash the task-board skeleton needlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeWorkspace?.id]);

  useEffect(() => {
    if (!user) return;

    // Query Firestore directly instead of gating on the `workspaces` state —
    // that state starts empty on every load and only fills in once the
    // listener's first snapshot arrives, so gating on it raced a duplicate
    // "My Tasks" workspace into existence for returning users.
    const ensurePersonalWorkspace = async () => {
      const existing = await getDocs(
        query(
          collection(db, "workspaces"),
          where("memberIds", "array-contains", user.uid),
          where("isPersonal", "==", true)
        )
      );
      if (!existing.empty) return;

      const workspaceRef = await addDoc(collection(db, "workspaces"), {
        name: "My Tasks",
        ownerId: user.uid,
        memberIds: [user.uid],
        isPersonal: true,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, "workspaceMembers", `${workspaceRef.id}_${user.uid}`), {
        workspaceId: workspaceRef.id,
        userId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: "owner",
        joinedAt: serverTimestamp(),
      });
    };

    ensurePersonalWorkspace().catch((error) => {
      console.error("Personal workspace error:", error);
      toast.error("Failed to create your personal workspace.");
    });
  }, [user]);

  useEffect(() => {
    if (!user || !inviteToken) return;

    const acceptInvite = async () => {
      try {
        const inviteRef = doc(db, "workspaceInvites", inviteToken);
        const inviteSnapshot = await getDoc(inviteRef);
        if (!inviteSnapshot.exists()) throw new Error("Invite not found");

        const invite = inviteSnapshot.data();
        if (invite.expiresAt?.toDate() < new Date()) throw new Error("Invite expired");

        // Check whether this person already has a membership doc (e.g. the
        // workspace owner re-opening their own invite link) so we never
        // overwrite an existing role — setDoc below would otherwise blindly
        // downgrade an owner to "member".
        const memberRef = doc(db, "workspaceMembers", `${invite.workspaceId}_${user.uid}`);
        let alreadyMember = false;
        try {
          const memberSnapshot = await getDoc(memberRef);
          alreadyMember = memberSnapshot.exists();
        } catch {
          alreadyMember = false;
        }

        await updateDoc(doc(db, "workspaces", invite.workspaceId), {
          memberIds: arrayUnion(user.uid),
          inviteToken,
        });

        if (!alreadyMember) {
          await setDoc(memberRef, {
            workspaceId: invite.workspaceId,
            userId: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: "member",
            joinedAt: serverTimestamp(),
          });
        }

        window.history.replaceState({}, document.title, window.location.pathname);
        setActiveTab("team");
        setPendingInviteWorkspaceId(invite.workspaceId);
        toast.success(alreadyMember ? "Welcome back" : "You joined the workspace");
      } catch (error) {
        console.error("Invite acceptance error:", error);
        toast.error("This workspace invite is invalid or expired.");
      }
    };

    acceptInvite();
  }, [user, inviteToken]);

  const createWorkspace = async (name) => {
    try {
      setIsCreatingWorkspace(true);
      const workspaceRef = await addDoc(collection(db, "workspaces"), {
        name,
        ownerId: user.uid,
        memberIds: [user.uid],
        isPersonal: false,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, "workspaceMembers", `${workspaceRef.id}_${user.uid}`), {
        workspaceId: workspaceRef.id,
        userId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: "owner",
        joinedAt: serverTimestamp(),
      });
      setSelectedWorkspace({ id: workspaceRef.id, name, ownerId: user.uid, isPersonal: false });
      setIsWorkspaceModalOpen(false);
      toast.success("Workspace created");
    } catch (error) {
      console.error("Workspace creation error:", error);
      toast.error("Failed to create workspace.");
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const removeMember = async (member) => {
    if (!selectedWorkspace || selectedWorkspace.ownerId !== user.uid) return;
    if (!window.confirm(`Remove ${member.displayName || "this person"} from ${selectedWorkspace.name}?`)) return;

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "workspaces", selectedWorkspace.id), {
        memberIds: arrayRemove(member.userId),
      });
      batch.delete(doc(db, "workspaceMembers", member.id));
      await batch.commit();
      toast.success(`${member.displayName || "Member"} removed from workspace`);
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error(`Failed to remove member${error.code ? ` (${error.code})` : ""}.`);
    }
  };

  const deleteWorkspace = async (workspace) => {
    if (!workspace || workspace.ownerId !== user.uid) return;

    try {
      setIsDeletingWorkspace(true);
      const [tasksSnapshot, commentsSnapshot, membersSnapshot] = await Promise.all([
        getDocs(query(collection(db, "tasks"), where("workspaceId", "==", workspace.id))),
        getDocs(query(collection(db, "taskComments"), where("workspaceId", "==", workspace.id))),
        getDocs(query(collection(db, "workspaceMembers"), where("workspaceId", "==", workspace.id))),
      ]);

      const batch = writeBatch(db);
      tasksSnapshot.forEach((taskDoc) => batch.delete(taskDoc.ref));
      commentsSnapshot.forEach((commentDoc) => batch.delete(commentDoc.ref));
      membersSnapshot.forEach((memberDoc) => batch.delete(memberDoc.ref));
      batch.delete(doc(db, "workspaces", workspace.id));
      await batch.commit();

      if (selectedWorkspace?.id === workspace.id) setSelectedWorkspace(null);
      setWorkspaceToDelete(null);
      toast.success("Workspace deleted");
    } catch (error) {
      console.error("Delete workspace error:", error);
      toast.error("Failed to delete workspace.");
    } finally {
      setIsDeletingWorkspace(false);
    }
  };

  const createInvite = async () => {
    if (!selectedWorkspace || selectedWorkspace.isPersonal) return;

    try {
      const inviteRef = await addDoc(collection(db, "workspaceInvites"), {
        workspaceId: selectedWorkspace.id,
        createdBy: user.uid,
        used: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${inviteRef.id}`;
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied. It expires in 7 days.");
    } catch (error) {
      console.error("Invite creation error:", error);
      toast.error("Failed to create invite link.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Toaster
        toastOptions={{
          className: "!bg-ink-raised !text-text !border !border-line-strong !rounded-sm !shadow-card !font-sans !text-sm",
          success: { iconTheme: { primary: "#ff5a1f", secondary: "#101012" } },
          error: { iconTheme: { primary: "#ff5a1f", secondary: "#101012" } },
        }}
      />
      <InviteWelcomeModal
        isOpen={!authLoading && !user && !!inviteToken && !isInviteModalDismissed}
        onLogin={loginWithGoogle}
        onDismiss={() => setIsInviteModalDismissed(true)}
      />
   <header className="bg-ink text-text px-4 md:px-6 py-4 flex justify-between items-center w-full border-b-2 border-line-strong sticky top-0 z-20">
        <Logo />

        {authLoading ? (
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <div className="h-9 w-32 rounded-sm bg-line animate-pulse" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-8 h-8 rounded-full border-2 border-line-strong"
            />
            <button
              onClick={logout}
              className="border-2 border-line-strong hover:border-accent hover:text-accent-fg px-3 py-2 md:px-4 rounded-sm text-text text-sm font-semibold transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button
              onClick={loginWithGoogle}
              className="bg-paper hover:bg-paper-dim text-ink-900 px-3 py-2 sm:px-4 rounded-sm flex items-center gap-2 text-sm sm:text-base font-semibold shrink-0 border-2 border-ink-900 shadow-card transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 active:shadow-none"
            >
              <img src={googleLogo} alt="" className="w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-full p-1 object-contain" />
              <span className="hidden sm:inline">Login with Google</span>
              <span className="sm:hidden">Login</span>
            </button>
          </div>
        )}
      </header>

      {authLoading ? (
        <div className="bg-ink min-h-screen w-full flex flex-col items-center p-3 gap-8 md:gap-12 pt-10 md:pt-16">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex justify-center gap-3 mb-8">
              <div className="h-11 w-24 rounded-sm bg-line animate-pulse" />
              <div className="h-11 w-28 rounded-sm bg-line animate-pulse" />
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
              {["Todo", "In Progress", "Closed"].map((label) => (
                <div key={label} className="w-full md:w-64">
                  <div className="h-12 rounded-sm bg-line animate-pulse mb-4" />
                  <div className="h-16 rounded-sm bg-line/70 animate-pulse mb-3" />
                  <div className="h-16 rounded-sm bg-line/70 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : user ? (
        <div className="bg-ink min-h-screen w-full flex flex-col items-center p-3 gap-8 md:gap-12 pt-10 md:pt-16">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex justify-center gap-1 mb-8 border-2 border-line-strong rounded-sm p-1 w-fit mx-auto">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-5 py-2.5 rounded-sm font-semibold text-sm transition-colors duration-200 ${activeTab === "my" ? "bg-accent text-accent-ink" : "text-text-muted hover:text-text"}`}
              >
                My Tasks
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`px-5 py-2.5 rounded-sm font-semibold text-sm transition-colors duration-200 ${activeTab === "team" ? "bg-accent text-accent-ink" : "text-text-muted hover:text-text"}`}
              >
                Team Tasks
              </button>
            </div>

            {activeTab === "team" && (
              <div className="pb-6 mb-8 border-b-2 border-line-strong">
                {workspacesLoading ? (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-9 w-28 rounded-sm bg-line animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {teamWorkspaces.map((workspace) => (
                      <button
                        key={workspace.id}
                        onClick={() => setSelectedWorkspace(workspace)}
                        aria-selected={selectedWorkspace?.id === workspace.id}
                        className={`rounded-sm px-4 py-2 border-2 text-sm font-semibold transition-colors duration-200 ${selectedWorkspace?.id === workspace.id ? "bg-accent text-accent-ink border-accent" : "bg-transparent border-line-strong text-text-muted hover:text-text hover:border-text-muted"}`}
                      >
                        {workspace.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsWorkspaceModalOpen(true)}
                      aria-label="Create workspace"
                      className="w-9 h-9 flex items-center justify-center rounded-sm border-2 border-dashed border-line-strong text-text-faint hover:border-accent hover:text-accent-fg text-lg leading-none transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                )}

                {!workspacesLoading && teamWorkspaces.length === 0 && (
                  <p className="text-text-muted text-sm mb-2">No workspaces yet — click + to create one.</p>
                )}

                {selectedWorkspace && !selectedWorkspace.isPersonal && (
                  membersLoading ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-7 w-20 rounded-full bg-line animate-pulse" />
                        ))}
                      </div>
                      <div className="h-3 w-24 rounded bg-line animate-pulse" />
                    </div>
                  ) : (
                    <WorkspaceMembers
                      members={members}
                      currentUserId={user.uid}
                      isOwner={selectedWorkspace.ownerId === user.uid}
                      onInvite={createInvite}
                      onRemoveMember={removeMember}
                    />
                  )
                )}

                {selectedWorkspace && !selectedWorkspace.isPersonal && selectedWorkspace.ownerId === user.uid && (
                  <button
                    onClick={() => setWorkspaceToDelete(selectedWorkspace)}
                    className="mt-4 text-xs font-mono font-semibold uppercase tracking-wide text-accent-fg/80 hover:text-accent-fg"
                  >
                    Delete workspace
                  </button>
                )}
              </div>
            )}

            <DeleteWorkspaceModal
              workspace={workspaceToDelete}
              isOpen={!!workspaceToDelete}
              isDeleting={isDeletingWorkspace}
              onClose={() => setWorkspaceToDelete(null)}
              onConfirm={() => deleteWorkspace(workspaceToDelete)}
            />

            <CreateWorkspaceModal
              isOpen={isWorkspaceModalOpen}
              isCreating={isCreatingWorkspace}
              onClose={() => setIsWorkspaceModalOpen(false)}
              onCreate={createWorkspace}
            />

            {activeWorkspace ? (
              <>
                <h1 className="text-center font-display text-3xl font-bold text-text mb-6 text-balance">{activeWorkspace.name}</h1>
                <CreateTask tasks={tasks} setTasks={setTasks} user={user} workspaceId={activeWorkspace.id} />
                {tasksLoading ? (
                  <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
                    {["Todo", "In Progress", "Closed"].map((label) => (
                      <div key={label} className="w-full md:w-64">
                        <div className="h-12 rounded-sm bg-line animate-pulse mb-4" />
                        <div className="h-16 rounded-sm bg-line/70 animate-pulse mb-3" />
                        <div className="h-16 rounded-sm bg-line/70 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ListTasks tasks={tasks} setTasks={setTasks} onOpenTask={setOpenTaskId} />
                )}
              </>
            ) : (
              <p className="text-text-muted text-center">Preparing your workspace...</p>
            )}
          </div>

          <TaskDetailPanel
            task={tasks.find((t) => t.id === openTaskId) || null}
            isOpen={!!openTaskId}
            onClose={() => setOpenTaskId(null)}
            members={members}
            currentUser={user}
            isPersonal={!!activeWorkspace?.isPersonal}
          />
        </div>
      ) : (
        <LandingPage onLogin={loginWithGoogle} />
      )}
    </DndProvider>
  );
}

export default App;
