import { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";

const ListTasks = ({tasks, setTasks}) => {
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
    <div className="flex gap-16">
        {statuses.map((status,index) => 
            (<Section
             key={index} 
             status = {status} 
             tasks ={tasks} 
             setTasks ={setTasks} 
             todos={todos} 
             inProgress={inProgress} 
             closed={closed}
            />))}
        </div>);

}
export default ListTasks;

const   Section =({status,tasks,setTasks,todos,inProgress,closed}) => {
 
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

const addItemToSection = (id)=>{
   setTasks(prev =>{
   
    const mTasks = prev.map(t=>{
        if(t.id == id){
            return {...t, status: status}
        }
        return t
    })
     localStorage.setItem("tasks",JSON.stringify(mTasks));
     toast("Task Status changed",{icon:"👍"});
    return mTasks;
   })
};

    return ( 
 <div ref={drop} className={`w-64 rounded-md p-2 ${isOver ?"bg-slate-200":""}`}>
  <Header text={text} bg={bg} count={tasksToMap.length}/> 
  
  {tasksToMap.length > 0 && tasksToMap.map(task => <Task key={task.id} task={task}
    tasks={tasks} setTasks={setTasks}
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


   const  Task  =({task,tasks,setTasks}) => {

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "task",
        item:{id: task.id},
        collect: (monitor) => ({
          isDragging: !!monitor.isDragging(),
        }),
      }));
      
    
console.log(isDragging);

    const handleRemove = (id) => {
        console.log(id);    
        const fTasks = tasks.filter(t => t.id !== id);
        localStorage.setItem("tasks",JSON.stringify(fTasks));
        setTasks(fTasks);
        toast("Task removed",{icon:"☠️"}) ;
    } 

    return ( 
    <div ref={drag} className={`relative p-4 mt-8 shadow-md rounded-md cursor-grab ${isDragging ? "optacity-25" : "opacit-100"}`}>
    <p>{task.name}</p>
    <button className="absolute bottom-1 right-1 text-slate-400" onClick={() => handleRemove(task.id)}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

    </button>
    </div>
    );
   };