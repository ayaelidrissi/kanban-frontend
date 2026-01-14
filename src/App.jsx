import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2, Layout, X, Filter } from 'lucide-react';

const API_URL = 'http://localhost:3001/api/tasks';

const catColors = {
  Bug: 'bg-red-500/20 text-red-400 border-red-500/50',
  Feature: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  Design: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  General: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', category: 'General' });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const res = await axios.get(API_URL);
    setTasks(res.data);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { destination, draggableId } = result;
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
    setNewTask({ title: '', description: '', status: 'todo', category: 'General' });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setTasks(tasks.filter(t => t._id !== id));
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <header className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6 mb-16">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20"><Layout className="text-white" /></div>
          <div>
            <h1 className="text-3xl font-black text-white">Project Flow</h1>
            <p className="text-slate-500 text-sm font-medium">Categorized Kanban Board</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
          <Filter size={18} className="ml-2 text-slate-500" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-white font-bold text-sm outline-none pr-4 cursor-pointer"
          >
            {['All', 'Feature', 'Bug', 'Design', 'General'].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
          </select>
          <div className="w-[1px] h-6 bg-slate-800 mx-2"></div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
            <Plus size={18} /> New
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {['todo', 'in-progress', 'done'].map(colId => (
            <div key={colId} className="flex flex-col gap-5">
              <h2 className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em] px-2">{colId.replace('-', ' ')}</h2>
              <Droppable droppableId={colId}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`min-h-[600px] rounded-[2.5rem] p-3 transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-indigo-500/10' : 'bg-slate-900/40'}`}>
                    {tasks
                      .filter(t => t.status === colId && (filter === 'All' || t.category === filter))
                      .map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl mb-4 border border-slate-700/50 group hover:border-indigo-500/50 transition-all ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-1' : ''}`}>
                              <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] px-2 py-1 rounded-lg border font-black uppercase tracking-wider ${catColors[task.category]}`}>
                                  {task.category}
                                </span>
                                <button onClick={() => handleDelete(task._id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                              </div>
                              <h3 className="font-bold text-white text-lg leading-tight">{task.title}</h3>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>
            <h2 className="text-3xl font-black text-white mb-8">Create Task</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <input required className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all" placeholder="Task Title" onChange={e => setNewTask({...newTask, title: e.target.value})} />
              <select className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none cursor-pointer" onChange={e => setNewTask({...newTask, category: e.target.value})}>
                <option value="General">General Category</option>
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Design">Design</option>
              </select>
              <textarea className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none h-32 resize-none" placeholder="Description" onChange={e => setNewTask({...newTask, description: e.target.value})} />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all">Add to Board</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;