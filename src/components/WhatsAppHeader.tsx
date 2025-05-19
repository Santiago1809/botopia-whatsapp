import { Agent, WhatsappNumber } from "@/types/gobal";
import { Menu as MenuIcon, User } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import WhatsAppAgentSelector from "./WhatsAppAgentSelector";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar } from "./ui/avatar";
import { DialogTitle } from "@radix-ui/react-dialog";

interface WhatsAppHeaderProps {
  setSidebarOpen: (open: boolean) => void;
  selectedNumber: WhatsappNumber | null;
  toggleAi: (numberId: string | number, newVal: boolean) => void;
  toggleGroups: (numberId: string | number, newVal: boolean) => void;
  toggleUnknownAi: (numberId: string | number, newVal: boolean) => void;
  setSelectedNumber: (number: WhatsappNumber | null) => void;
  currentAgent: Agent | null;
  setCurrentAgent: (agent: Agent | null) => void;
}

export default function WhatsAppHeader({
  setSidebarOpen,
  selectedNumber,
  toggleAi,
  toggleGroups,
  toggleUnknownAi,
  setSelectedNumber,
  currentAgent,
  setCurrentAgent,
}: WhatsAppHeaderProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-white border-b">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full"
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        {currentAgent && (
          <div className="flex items-center gap-2">
            <Avatar>
              <User />
            </Avatar>
            <span className="text-sm font-semibold">{currentAgent.title}</span>
            <span className="text-xs text-gray-500 line-clamp-2">
              {currentAgent.prompt}
            </span>
          </div>
        )}
        {selectedNumber && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-secondary text-white">
                  {currentAgent ? currentAgent.title : "Seleccionar Agente"}
                </Button>
              </DialogTrigger>
              <DialogContent className="min-w-3xl">
                <DialogTitle>Seleccionar agente</DialogTitle>
                <WhatsAppAgentSelector
                  setSelectedNumber={setSelectedNumber}
                  currentAgent={currentAgent}
                  selectedNumber={selectedNumber}
                  setCurrentAgent={setCurrentAgent}
                />
              </DialogContent>
            </Dialog>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 p-1 rounded-full">
                <Switch
                  id={`ai-${selectedNumber.id}`}
                  checked={Boolean(selectedNumber?.aiEnabled)}
                  className="data-[state=checked]:bg-secondary data-[state=unchecked]:bg-gray-400"
                  onCheckedChange={(checked) => {
                    toggleAi(selectedNumber.number, checked);
                  }}
                />
                <span className="text-xs sm:text-sm font-semibold">IA</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 p-1 rounded-full">
                <Switch
                  id={`groups-${selectedNumber.id}`}
                  checked={Boolean(selectedNumber?.responseGroups)}
                  className="data-[state=checked]:bg-secondary data-[state=unchecked]:bg-gray-400"
                  onCheckedChange={(check) =>
                    toggleGroups(selectedNumber.number, check)
                  }
                />
                <span className="text-xs sm:text-sm font-semibold">Grupos</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 p-1 rounded-full">
                <Switch
                  id={`unknown-${selectedNumber.id}`}
                  checked={Boolean(selectedNumber?.aiUnknownEnabled)}
                  className="data-[state=checked]:bg-secondary data-[state=unchecked]:bg-gray-400"
                  onCheckedChange={(check) =>
                    toggleUnknownAi(selectedNumber.number, check)
                  }
                />
                <span className="text-xs sm:text-sm font-semibold">No agregados</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
