import { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import api from '../utils/api';
import toast from 'react-hot-toast';
import CardComponent from './CardComponent';
import { Plus, Trash2 } from 'lucide-react';

export default function ListComponent({ list, board, setBoard, onOpenCard, isOwner, currentUser }) {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({ id: list._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0.5 } : {})
  };

  const createCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      const { data } = await api.post('/cards', {
        listId: list._id,
        title: newCardTitle.trim()
      });
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.map(l =>
          l._id === list._id
            ? { ...l, cards: [...(l.cards || []), data] }
            : l
        )
      }));
      setNewCardTitle('');
      setAddingCard(false);
    } catch (error) {
      toast.error('Failed to create card');
    }
  };

  const deleteList = async () => {
    if (!confirm('Delete this list and all its cards?')) return;
    try {
      await api.delete(`/lists/${list._id}`);
      setBoard(prev => ({
        ...prev,
        lists: prev.lists.filter(l => l._id !== list._id)
      }));
      toast.success('List deleted');
    } catch (error) {
      toast.error('Failed to delete list');
    }
  };

  const saveListTitle = async (e) => {
    const title = e.target.value || list.title;
    if (title !== list.title) {
      try {
        await api.put(`/lists/${list._id}`, { title });
        setBoard(prev => ({
          ...prev,
          lists: prev.lists.map(l => l._id === list._id ? { ...l, title } : l)
        }));
      } catch (error) {
        toast.error('Failed to update list');
      }
    }
    setEditingTitle(false);
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    onOpenCard({ ...e.card, listId: list._id });
  };

  const moveCard = async (cardId, direction) => {
    const cards = list.cards || [];
    const index = cards.findIndex(c => c._id === cardId);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= cards.length) return;

    const newPositions = [...cards];
    [newPositions[index], newPositions[newIndex]] = [newPositions[newIndex], newPositions[index]];

    setBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l =>
        l._id === list._id ? { ...l, cards: newPositions } : l
      )
    }));

    try {
      await api.put(`/cards/${cardId}/move`, {
        newListId: list._id,
        position: newIndex
      });
    } catch (error) {
      toast.error('Failed to move card');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-72 bg-gray-100 rounded-xl flex flex-col flex-shrink-0 cursor-grab active:cursor-grabbing"
    >
      <div className="p-3 flex items-center justify-between group">
        {editingTitle ? (
          <input
            type="text"
            defaultValue={list.title}
            autoFocus
            onBlur={saveListTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className="w-full font-bold text-sm bg-white rounded px-2 py-1 outline-none"
          />
        ) : (
          <h3 className="font-bold text-gray-700 text-sm cursor-pointer" onClick={() => setEditingTitle(true)}>
            {list.title}
          </h3>
        )}
        {isOwner && (
          <button onClick={deleteList} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2 min-h-[10px]">
        {(list.cards || []).map((card, index) => (
          <div
            key={card._id}
            onClick={(e) => {
              e.stopPropagation();
              onOpenCard({ ...card, listId: list._id });
            }}
          >
            <div className="flex items-start gap-1">
              <div className="flex-1">
                <CardComponent card={card} onOpen={() => onOpenCard({ ...card, listId: list._id })} />
              </div>
            </div>
            <div className="flex gap-1 mt-1 justify-end opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={(e) => { e.stopPropagation(); moveCard(card._id, 'up'); }}
                disabled={index === 0}
                className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); moveCard(card._id, 'down'); }}
                disabled={index === (list.cards || []).length - 1}
                className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3">
        {addingCard ? (
          <form onSubmit={createCard}>
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="w-full bg-white rounded-lg p-3 text-sm outline-none mb-2 resize-none h-20"
              autoFocus
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-700 transition">
                Add Card
              </button>
              <button onClick={() => setAddingCard(false)} className="text-gray-400 hover:text-gray-600 px-2">
                ✕
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            className="w-full text-gray-500 hover:bg-gray-200 rounded-lg py-2 text-sm flex items-center justify-center gap-1 transition"
          >
            <Plus className="h-4 w-4" />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
