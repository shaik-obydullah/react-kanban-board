import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { X, Trash2, Calendar, CheckSquare, Plus, Tag } from 'lucide-react';

const labelColors = {
  red: { bg: 'bg-red-100', dot: 'bg-red-500', text: 'text-red-700' },
  orange: { bg: 'bg-orange-100', dot: 'bg-orange-500', text: 'text-orange-700' },
  yellow: { bg: 'bg-yellow-100', dot: 'bg-yellow-400', text: 'text-yellow-700' },
  green: { bg: 'bg-green-100', dot: 'bg-green-500', text: 'text-green-700' },
  blue: { bg: 'bg-blue-100', dot: 'bg-blue-500', text: 'text-blue-700' },
  purple: { bg: 'bg-purple-100', dot: 'bg-purple-500', text: 'text-purple-700' },
  pink: { bg: 'bg-pink-100', dot: 'bg-pink-500', text: 'text-pink-700' },
  gray: { bg: 'bg-gray-100', dot: 'bg-gray-500', text: 'text-gray-700' }
};

export default function CardModal({ card, board, setBoard, onClose, isOwner, currentUser }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [checklist, setChecklist] = useState(card.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [dueDate, setDueDate] = useState(card.dueDate || '');

  const updateCard = async (data) => {
    try {
      const res = await api.put(`/cards/${card._id}`, data);
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l => ({
          ...l,
          cards: (l.cards || []).map(c => c._id === card._id ? res.data : c)
        }))
      }));
    } catch (error) {
      toast.error('Failed to update card');
    }
  };

  const toggleLabel = async (label) => {
    const labels = card.labels || [];
    const newLabels = labels.includes(label)
      ? labels.filter(l => l !== label)
      : [...labels, label];
    await updateCard({ labels: newLabels });
    card.labels = newLabels;
  };

  const toggleChecklistItem = async (index) => {
    const newChecklist = checklist.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    setChecklist(newChecklist);
    await updateCard({ checklist: newChecklist });
  };

  const addChecklistItem = async (e) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    const newChecklist = [...checklist, { text: newChecklistItem.trim(), checked: false }];
    setChecklist(newChecklist);
    setNewChecklistItem('');
    await updateCard({ checklist: newChecklist });
  };

  const deleteCard = async () => {
    if (!confirm('Delete this card?')) return;
    try {
      await api.delete(`/cards/${card._id}`);
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l => ({
          ...l,
          cards: (l.cards || []).filter(c => c._id !== card._id)
        }))
      }));
      toast.success('Card deleted');
      onClose();
    } catch (error) {
      toast.error('Failed to delete card');
    }
  };

  const checklistDone = checklist.filter(i => i.checked).length;
  const allMembers = board.members ? [board.owner, ...(board.members || [])].filter(Boolean) : [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title !== card.title && updateCard({ title })}
              className="text-xl font-bold text-gray-900 w-full outline-none border-b border-transparent focus:border-primary-500"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(card.labels || []).map((label) => (
              <span key={label} className={`${labelColors[label].bg} ${labelColors[label].text} px-2 py-1 rounded-full text-xs font-medium`}>
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => description !== (card.description || '') && updateCard({ description })}
                  placeholder="Add a more detailed description..."
                  className="w-full bg-gray-50 border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-y min-h-[100px]"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Checklist ({checklistDone}/{checklist.length})
                </h3>
                <div className="space-y-2">
                  {checklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecklistItem(index)}
                        className="rounded"
                      />
                      <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : ''}`}>
                        {item.text}
                      </span>
                      <button
                        onClick={async () => {
                          const newChecklist = checklist.filter((_, i) => i !== index);
                          setChecklist(newChecklist);
                          await updateCard({ checklist: newChecklist });
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <form onSubmit={addChecklistItem} className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add checklist item..."
                      className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 text-sm outline-none"
                    />
                    <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 rounded-lg">
                      <Plus className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Labels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(labelColors).map(([color, styles]) => (
                    <button
                      key={color}
                      onClick={() => toggleLabel(color)}
                      className={`w-8 h-8 ${styles.dot} rounded-lg hover:scale-110 transition ${
                        (card.labels || []).includes(color) ? 'ring-2 ring-offset-2 ring-gray-400' : 'opacity-60'
                      }`}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Due Date
                </h3>
                <input
                  type="datetime-local"
                  value={dueDate ? new Date(dueDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (e.target.value) updateCard({ dueDate: new Date(e.target.value) });
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                />
              </div>

              {allMembers.length > 1 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Members</h3>
                  <div className="space-y-2">
                    {allMembers.map((member) => (
                      <div key={member._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700">{member.name}</span>
                        </div>
                        <button
                          onClick={async () => {
                            const members = (card.members || []);
                            const isMember = members.some(m => m._id === member._id);
                            const newMembers = isMember
                              ? members.filter(m => m._id !== member._id)
                              : [...members, { _id: member._id, name: member.name, email: member.email }];
                            await updateCard({ members: newMembers });
                            card.members = newMembers;
                          }}
                          className={`text-xs px-2 py-1 rounded-lg transition ${
                            (card.members || []).some(m => m._id === member._id)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {(card.members || []).some(m => m._id === member._id) ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isOwner && (
                <button
                  onClick={deleteCard}
                  className="w-full bg-red-50 text-red-600 hover:bg-red-100 rounded-lg py-2 text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Card
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
