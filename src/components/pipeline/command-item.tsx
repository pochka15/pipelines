import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Draggable } from "@hello-pangea/dnd";
import { GripVertical, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import type { FC } from "react";

export type CommandItemData = {
  id: string;
  description?: string;
  value: string;
};

export const CommandItem: FC<{
  item: CommandItemData;
  index: number;
  onUpdate: (id: string, item: Partial<CommandItemData>) => void;
  onRemove: (id: string) => void;
  onAddBefore: (id: string) => void;
  onAddAfter: (id: string) => void;
}> = ({ item, index, onUpdate, onRemove, onAddBefore, onAddAfter }) => {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="group border rounded-lg p-4 bg-white hover:bg-gray-50"
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              {...provided.dragHandleProps}
              className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} />
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddBefore(item.id)}
                className="h-6 w-6 p-0"
              >
                <ChevronUp size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(item.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddAfter(item.id)}
                className="h-6 w-6 p-0"
              >
                <ChevronDown size={12} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Description (optional)"
              value={item.description || ""}
              onChange={(e) => onUpdate(item.id, { description: e.target.value })}
              className="text-sm"
            />
            <Textarea
              placeholder="Command"
              value={item.value}
              onChange={(e) => onUpdate(item.id, { value: e.target.value })}
              className="text-sm font-mono"
              rows={2}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};
