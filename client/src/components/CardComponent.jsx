import { Link } from 'react-router-dom';
import { Calendar, CheckSquare, MessageCircle } from 'lucide-react';

const labelColors = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-500'
};

export default function Card({ card, onOpen }) {
  const checklistTotal = card.checklist?.length || 0;
  const checklistDone = card.checklist?.filter(i => i.checked).length || 0;

  return (
    <div
      onClick={() => onOpen(card)}
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer border border-gray-200 transition group"
    >
      {card.labels?.length > 0 && (
        <div className="flex gap-1 mb-2">
          {card.labels.map((label) => (
            <span key={label} className={`w-8 h-2 rounded-full ${labelColors[label]}`} />
          ))}
        </div>
      )}

      <p className="font-medium text-gray-800 mb-2">{card.title}</p>

      {card.description && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{card.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-gray-400">
          {card.checklist?.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <CheckSquare className="h-4 w-4" />
              {checklistDone}/{checklistTotal}
            </span>
          )}
          {card.dueDate && (
            <span className="flex items-center gap-1 text-xs">
              <Calendar className="h-4 w-4" />
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {card.members?.length > 0 && (
          <div className="flex -space-x-2">
            {card.members.slice(0, 3).map((member) => (
              <div
                key={member._id}
                className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-medium ring-2 ring-white"
              >
                {member.name?.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
