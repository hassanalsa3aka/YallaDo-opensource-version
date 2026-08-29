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
  deleteDoc,
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
import logo from "./assets/logo.png";
import googleLogo from "./assets/google.png";

function App() {
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
      await updateDoc(doc(db, "workspaces", selectedWorkspace.id), {
        memberIds: arrayRemove(member.userId),
      });
      await deleteDoc(doc(db, "workspaceMembers", member.id));
      toast.success(`${member.displayName || "Member"} removed from workspace`);
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error("Failed to remove member.");
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
      <Toaster />
      <InviteWelcomeModal
        isOpen={!authLoading && !user && !!inviteToken && !isInviteModalDismissed}
        onLogin={loginWithGoogle}
        onDismiss={() => setIsInviteModalDismissed(true)}
      />
      <header className="bg-slate-600 text-white p-4 flex justify-between items-center w-full">
        {/* Replace h1 with logo image */}
        <img src={logo} alt="To-Do App Logo" className="h-8 md:h-12" />

        {authLoading ? (
          <div className="h-9 w-32 rounded-md bg-white/20 animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-8 h-8 rounded-full"
            />
            <button
              onClick={logout}
              className="bg-red-500 px-4 py-2 rounded-md text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          // Login button with Google logo
          <button
            onClick={loginWithGoogle}
            className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-2"
          >
            <img src={googleLogo} alt="Google Logo" className="w-10 h-8" />
            Login with Google
          </button>
        )}
      </header>


      
      {authLoading ? (
        <div className="bg-slate-100 min-h-screen w-full flex flex-col items-center p-3 gap-8 md:gap-12 pt-10 md:pt-16">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex justify-center gap-3 mb-8">
              <div className="h-11 w-24 rounded-md bg-slate-200 animate-pulse" />
              <div className="h-11 w-28 rounded-md bg-slate-200 animate-pulse" />
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
              {["Todo", "In Progress", "Closed"].map((label) => (
                <div key={label} className="w-64">
                  <div className="h-12 rounded-md bg-slate-200 animate-pulse mb-4" />
                  <div className="h-16 rounded-md bg-slate-200/70 animate-pulse mb-3" />
                  <div className="h-16 rounded-md bg-slate-200/70 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : user ? (
        <div className="bg-slate-100 min-h-screen w-full flex flex-col items-center p-3 gap-8 md:gap-12 pt-10 md:pt-16">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex justify-center border-b border-slate-300 gap-2 mb-8">
              <button onClick={() => setActiveTab("my")} className={`px-5 py-3 font-semibold ${activeTab === "my" ? "border-b-4 border-cyan-500 text-cyan-700" : "text-slate-500"}`}>
                My Tasks
              </button>
              <button onClick={() => setActiveTab("team")} className={`px-5 py-3 font-semibold ${activeTab === "team" ? "border-b-4 border-cyan-500 text-cyan-700" : "text-slate-500"}`}>
                Team Tasks
              </button>
            </div>

            {activeTab === "team" && (
              <div className="pb-5 mb-8 border-b border-slate-300">
                {workspacesLoading ? (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-9 w-28 rounded-md bg-slate-200 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {teamWorkspaces.map((workspace) => (
                      <button
                        key={workspace.id}
                        onClick={() => setSelectedWorkspace(workspace)}
                        aria-selected={selectedWorkspace?.id === workspace.id}
                        className={`rounded-md px-4 py-2 border text-sm font-semibold ${selectedWorkspace?.id === workspace.id ? "bg-cyan-600 text-white border-cyan-600" : "bg-slate-50 border-slate-300 text-slate-700"}`}
                      >
                        {workspace.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsWorkspaceModalOpen(true)}
                      aria-label="Create workspace"
                      className="w-9 h-9 flex items-center justify-center rounded-md border border-dashed border-slate-400 text-slate-500 hover:border-cyan-600 hover:text-cyan-600 text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                )}

                {!workspacesLoading && teamWorkspaces.length === 0 && (
                  <p className="text-slate-500 text-sm mb-2">No workspaces yet — click + to create one.</p>
                )}

                {selectedWorkspace && !selectedWorkspace.isPersonal && (
                  membersLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-7 w-20 rounded-full bg-slate-200 animate-pulse" />
                        ))}
                      </div>
                      <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
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
                    className="mt-3 text-xs font-semibold text-red-500 hover:text-red-600"
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
                <h1 className="text-center text-2xl font-bold text-slate-700 mb-5">{activeWorkspace.name}</h1>
                <CreateTask tasks={tasks} setTasks={setTasks} user={user} workspaceId={activeWorkspace.id} />
                {tasksLoading ? (
                  <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
                    {["Todo", "In Progress", "Closed"].map((label) => (
                      <div key={label} className="w-64">
                        <div className="h-12 rounded-md bg-slate-200 animate-pulse mb-4" />
                        <div className="h-16 rounded-md bg-slate-200/70 animate-pulse mb-3" />
                        <div className="h-16 rounded-md bg-slate-200/70 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ListTasks tasks={tasks} setTasks={setTasks} onOpenTask={setOpenTaskId} />
                )}
              </>
            ) : (
              <p className="text-slate-600">Preparing your workspace...</p>
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
