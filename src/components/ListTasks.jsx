import { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

const ListTasks = ({tasks, setTasks, onOpenTask}) => {
   const [todos, setTodos] = useState([]);
   const [inProgress, setInprogress] = useState([]);
   const [closed, setClosed] = useState([]);

   useEffect(()  => {
    const fTodo = tasks.filter((task) => task.status == "todo");
    const fInprogress = tasks.filter((task) => task.status == "inProgress");
    const fClosed = tasks.filter((task) => task.status == "closed");

    
    setTodos(fTodo);
    setInprogress(fInprogress);
    setClosed(fClosed);

   },[tasks]);

   const statuses = ["todo","inProgress","closed"]
   
    return (
    <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
        {statuses.map((status,index) =>
            (<Section
             key={index}
             status = {status}
             tasks ={tasks}
             setTasks ={setTasks}
             todos={todos}
             inProgress={inProgress}
             closed={closed}
             onOpenTask={onOpenTask}
            />))}
        </div>);

}
export default ListTasks;

const   Section =({status,tasks,setTasks,todos,inProgress,closed,onOpenTask}) => {
 
    const [{ isOver }, drop] = useDrop(() => ({
        accept: "task",
        drop: (item) => addItemToSection(item.id),
        collect: (monitor) => ({
          isOver: !!monitor.isOver(),
        }),
      }));
 
 
 
 
    let text = "Todo";
 let bg = "bg-slate-500";
 let tasksToMap = todos;
 
 if(status === "inProgress"){
    text = "In Progress";
    bg = "bg-purple-500";
    tasksToMap = inProgress;
 }
 if(status === "closed"){
    text = "Closed";
    bg = "bg-green-500";
    tasksToMap = closed;
 }

const addItemToSection = async (id)=>{
   try {
     const taskDoc = doc(db, "tasks", id);
     await updateDoc(taskDoc, { status: status });
     toast("Task Status changed",{icon:"👍"});
   } catch (error) {
     console.error("Error updating task status:", error);
     toast.error("Failed to update status");
   }
};

    return ( 
 <div ref={drop} className={`w-64 rounded-md p-2 ${isOver ?"bg-slate-200":""}`}>
  <Header text={text} bg={bg} count={tasksToMap.length}/> 
  
  {tasksToMap.length > 0 && tasksToMap.map(task => <Task key={task.id} task={task}
    tasks={tasks} setTasks={setTasks} onOpenTask={onOpenTask}
  />) }

 </div>
 );
};


const  Header =({text,bg,count}) => {
    return ( 
    <div className={`${bg} flex items-center h-12 pl-4 rounded-md uppercase text-sm text-white`}>
    {text}
    <div className="ml-2 bg-white w-5 h-5 text-black rounded-full flex items-center justify-center">{count}</div>
    </div>
    );
   };


   const  Task  =({task,tasks,setTasks,onOpenTask}) => {

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "task",
        item:{id: task.id},
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(),
        }),
      }));

    const handleRemove = async (id) => {
        try {
          await deleteDoc(doc(db, "tasks", id));
          toast("Task removed",{icon:"☠️"}) ;
        } catch (error) {
          console.error("Error removing task:", error);
          toast.error("Failed to remove task");
        }
    }

    return (
    <div
      ref={drag}
      onClick={() => onOpenTask?.(task.id)}
      className={`relative p-4 pr-14 mt-8 shadow-md rounded-md cursor-pointer ${isDragging ? "optacity-25" : "opacit-100"}`}
    >
    <p>{task.name}</p>
    <button
      className="absolute bottom-1 right-8 text-slate-400 hover:text-cyan-600"
      aria-label="Edit task"
      onClick={(event) => { event.stopPropagation(); onOpenTask?.(task.id); }}
    >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
</svg>
    </button>
    <button
      className="absolute bottom-1 right-1 text-slate-400 hover:text-red-500"
      aria-label="Delete task"
      onClick={(event) => { event.stopPropagation(); handleRemove(task.id); }}
    >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

    </button>
    </div>
    );
   };