import { useState, useEffect } from "react";
import CreateTask from "./components/CreateTask";
import ListTasks from "./components/ListTasks";
import { Toaster } from "react-hot-toast";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useAuth from "./useAuth";

function App() {
  const [tasks, setTasks] = useState([]);
  const { user, loginWithGoogle, logout } = useAuth();

  useEffect(() => {
    setTasks(JSON.parse(localStorage.getItem("tasks")) || []);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <Toaster />
      <header className="bg-slate-600 text-white p-4 flex justify-between items-center w-full">
        {/* Replace h1 with logo image */}
        <img src="./src/assets/logo.png" alt="To-Do App Logo" className="h-12" />

        {user ? (
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
            className="bg-green-500 px-4 py-2 rounded-md text-white flex items-center gap-2"
          >
            <img src="./src/assets/google.png" alt="Google Logo" className="w-5 h-5" />
            Login with Google
          </button>
        )}
      </header>


      
      {user ? (
        <div className="bg-slate-100 w-screen h-screen flex flex-col items-center p-3 gap-16 pt-32">
          <CreateTask tasks={tasks} setTasks={setTasks} />
          <ListTasks tasks={tasks} setTasks={setTasks} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <h2>Please log in to manage your tasks.</h2>
        </div>
      )}
    </DndProvider>
  );
}

export default App;
