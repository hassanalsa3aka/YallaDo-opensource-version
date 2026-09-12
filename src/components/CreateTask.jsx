import { useState } from "react";
import toast from "react-hot-toast";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const CreateTask = ({tasks, setTasks, user, workspaceId}) => {
   const [task,setTask] =  useState({
    name:"",
    status:"todo",
   })
   
   const handleSubmit = async (e) =>{
     e.preventDefault();
   
    if (task.name.length <3 ) return toast.error("A TASK MOST HAVE MORE THAN 3 CHARACTERS");
    if (task.name.length >100 ) return toast.error("A TASK MOST HAVE LESS THAN 100 CHARACTERS");
    
    try {
      await addDoc(collection(db, "tasks"), {
        ...task,
        userId: user.uid,
        workspaceId,
        createdAt: new Date()
      });
      toast.success("TASK CREATED");
      setTask({
        name:"",
        status:"todo",
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to create task");
    }
};

   
   return (
         <form onSubmit={handleSubmit} className="mx-auto mb-10 flex flex-col sm:flex-row gap-3 w-full max-w-md px-4 sm:px-0">
        <input type="text" placeholder="Add a task..."
       className="border-2 border-line-strong bg-ink-raised text-text placeholder:text-text-muted rounded-sm h-12 flex-1 px-4 font-sans focus:border-accent transition-colors duration-200"
       value={task.name}
       onChange={(e) => setTask({...task, name: e.target.value})}/>

        <button className="bg-accent hover:bg-accent-dim text-accent-ink rounded-sm px-5 h-12 font-semibold border-2 border-accent shadow-card transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0 active:shadow-none">
            Create
            </button>
    </form>
    );

}
export default CreateTask;