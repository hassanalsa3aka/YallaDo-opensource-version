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
         <form onSubmit={handleSubmit} className="mx-auto my-8 flex flex-col sm:flex-row gap-4 w-full max-w-md px-4 sm:px-0">
        <input type="text" className="border-2 border-slate-400 bg-slate-100 rounded-md h-12 flex-1 px-3"
       value={task.name}
       onChange={(e) => setTask({...task, name: e.target.value})}/>
        
        <button className="bg-cyan-500 rounded-md px-4 h-12 text-white">
            Create
            </button>
    </form>
    );

}
export default CreateTask;