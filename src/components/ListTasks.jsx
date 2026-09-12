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
 let dot = "bg-stone";
 let edge = "border-l-stone";
 let tasksToMap = todos;

 if(status === "inProgress"){
    text = "In Progress";
    dot = "bg-accent";
    edge = "border-l-accent";
    tasksToMap = inProgress;
 }
 if(status === "closed"){
    text = "Closed";
    dot = "bg-jade";
    edge = "border-l-jade";
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
 <div ref={drop} className={`w-full md:w-64 rounded-sm p-2 border-2 transition-colors duration-200 ${isOver ? "border-accent bg-accent-soft" : "border-transparent"}`}>
  <Header text={text} dot={dot} count={tasksToMap.length}/>

  {tasksToMap.length === 0 && (
    <div className="mt-4 border-2 border-dashed border-line rounded-sm py-6 text-center text-xs font-mono text-text-muted">
      No tasks yet
    </div>
  )}

  {tasksToMap.length > 0 && tasksToMap.map(task => <Task key={task.id} task={task}
    tasks={tasks} setTasks={setTasks} onOpenTask={onOpenTask} edge={edge}
  />) }

 </div>
 );
};


const  Header =({text,dot,count}) => {
    return (
    <div className="flex items-center justify-between h-11 px-1 border-b-2 border-line-strong uppercase text-xs font-mono font-semibold tracking-wide text-text-muted">
    <span className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {text}
    </span>
    <span className="bg-transparent border border-line-strong text-text-muted w-6 h-6 rounded-full flex items-center justify-center text-[11px]">{count}</span>
    </div>
    );
   };


   const  Task  =({task,tasks,setTasks,onOpenTask,edge}) => {

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
      className={`group relative bg-paper border-2 border-ink-900 ${edge} border-l-[6px] p-4 pr-16 mt-4 rounded-sm shadow-card cursor-pointer transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover ${isDragging ? "opacity-30" : "opacity-100"}`}
    >
    <p className="font-medium text-ink-900 leading-snug break-words">{task.name}</p>
    <button
      className="absolute bottom-2.5 right-9 text-ink-900/40 hover:text-accent-dim sm:opacity-0 sm:group-hover:opacity-100 opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
      aria-label="Edit task"
      onClick={(event) => { event.stopPropagation(); onOpenTask?.(task.id); }}
    >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
</svg>
    </button>
    <button
      className="absolute bottom-2.5 right-2.5 text-ink-900/40 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
      aria-label="Delete task"
      onClick={(event) => { event.stopPropagation(); handleRemove(task.id); }}
    >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

    </button>
    </div>
    );
   };