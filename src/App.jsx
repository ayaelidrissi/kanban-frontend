import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2, Layout, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' });

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Completed' }
  ];

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const res = await axios.get(API_URL);
    setTasks(res.data);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const updated = Array.from(tasks);
    const task = updated.find(t => t._id === draggableId);
    task.status = destination.droppableId;
    setTasks(updated);
    await axios.patch(`${API_URL}/${draggableId}`, { status: destination.droppableId });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await axios.post(API_URL, newTask);
    setTasks([...tasks, res.data]);
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', status: 'todo' });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setTasks(tasks.filter(t => t._id !== id));
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-16">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20"><Layout className="text-white" /></div>
          <div>
            <h1 className="text-3xl font-black text-white">Project Flow</h1>
            <p className="text-slate-500 text-sm">Full-Stack Kanban v1.0</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl">
          <Plus size={20} /> New Task
        </button>
      </header>

      {/* BOARD */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col gap-5">
              <h2 className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em] px-2">{col.title}</h2>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`min-h-[600px] rounded-[2.5rem] p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-500/5' : 'bg-slate-900/40'}`}>
                    {tasks.filter(t => t.status === col.id).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl mb-4 border border-slate-700/50 group ${snapshot.isDragging ? 'shadow-2xl rotate-2' : ''}`}>
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-black uppercase">Task</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleDelete(task._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                                <GripVertical size={14} className="text-slate-600" />
                              </div>
                            </div>
                            <h3 className="font-bold text-white text-lg">{task.title}</h3>
                            <p className="text-sm text-slate-400 mt-2 line-clamp-2">{task.description}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20} /></button>
            <h2 className="text-3xl font-black text-white mb-8">Create Task</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <input required className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none" placeholder="Task Title" onChange={e => setNewTask({...newTask, title: e.target.value})} />
              <textarea className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none h-32" placeholder="Description" onChange={e => setNewTask({...newTask, description: e.target.value})} />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20">Add to Board</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;