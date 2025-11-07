import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Command } from "@/domain/stores/pipelines-store";
import type { FancyWindow } from "@/lib/window";
import type { FC } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { useShortcuts } from "@/lib/hooks/use-shortcuts";
import { useState } from "react";

const trimCommand = (cmd: string) => {
  const maxSize = 60;
  return cmd.length > maxSize ? cmd.slice(0, maxSize - 1).trimEnd() + "…" : cmd;
};

export const CommandsList: FC<{
  commands: Command[];
  window: FancyWindow;
  copied: Set<number>;
  isEditing: boolean;
  onButtonClick: (i: number, event: React.MouseEvent) => void;
  onStartEditing?: () => void;
  onCancelEditing?: () => void;
  onReorder?: (result: DropResult) => void;
  onFinishEditing?: (index: number, value: string) => void;
}> = ({
  isEditing,
  commands,
  window,
  copied,
  onButtonClick,
  onReorder,
  onStartEditing,
  onCancelEditing,
  onFinishEditing,
}) => {
  const [editValue, setEditValue] = useState("");

  const handleDragEnd = (result: DropResult) => {
    if (onReorder) {
      onReorder(result);
    }
  };

  const enterSubstituteMode = () => {
    if (onStartEditing && commands[window.cursor]) {
      setEditValue(commands[window.cursor].value);
      onStartEditing();
    }
  };

  const exitSubstituteMode = () => {
    if (onCancelEditing) {
      onCancelEditing();
      setEditValue("");
    }
  };

  const saveEdit = () => {
    if (onFinishEditing) {
      onFinishEditing(window.cursor, editValue);
    }
    exitSubstituteMode();
  };

  useShortcuts(
    {
      s: enterSubstituteMode,
    },
    { enabled: !isEditing }
  );

  useShortcuts(
    {
      escape: exitSubstituteMode,
      enter: saveEdit,
    },
    { enabled: isEditing }
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="commands">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col gap-2"
          >
            {commands.map((command, index) => (
              <Draggable
                key={index}
                draggableId={`command-${index}`}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    key={index}
                    className="flex flex-col gap-1"
                  >
                    <p className="text-sm text-muted-foreground empty:hidden w-fit">
                      {command.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        {...provided.dragHandleProps}
                        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical size={16} />
                      </div>
                      {isEditing && index === window.cursor ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 font-mono"
                          autoFocus
                        />
                      ) : (
                        <Button
                          variant="outline"
                          onClick={(event) => onButtonClick(index, event)}
                          className={cn(
                            "border-2 justify-start flex-1",
                            window?.inBounds(index) && "border-pink-600",
                            copied.has(index) && "border-green-500"
                          )}
                        >
                          {trimCommand(command.value)}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
