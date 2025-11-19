import { Download, Copy } from "lucide-react";
import { Button } from "./ui/button";
import { usePipelinesStore } from "../domain/stores/pipelines-store";

export const Toolbar: React.FC = () => {
  const { backup, restore } = usePipelinesStore();

  return (
    <>
      <Button onClick={backup} variant="outline" title="Backup">
        <Copy size={20} />
      </Button>
      <Button onClick={restore} variant="outline" title="Restore">
        <Download size={20} />
      </Button>
    </>
  );
};
