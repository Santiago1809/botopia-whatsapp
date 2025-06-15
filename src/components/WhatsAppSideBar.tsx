import { cn } from "@/lib/utils";
import { WhatsappNumber } from "@/types/gobal";
import { ArrowLeft, Phone, Search, Trash, User } from "lucide-react";
import MessagesCard from "./MessageCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface WhatsAppSideBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  whatsappNumbers: WhatsappNumber[];
  setWhatsappNumbers: (numbers: WhatsappNumber[]) => void;
  selectedNumber: WhatsappNumber | null;
  setSelectedNumber: (number: WhatsappNumber | null) => void;
  newNumber: string;
  setNewNumber: (number: string) => void;
  newName: string;
  setNewName: (name: string) => void;
  addNumber: () => void;
  removeNumber: (id: string) => void;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
}

export default function WhatsAppSideBar({
  sidebarOpen,
  whatsappNumbers,
  selectedNumber,
  setSelectedNumber,
  newNumber,
  setNewNumber,
  newName,
  setNewName,
  addNumber,
  removeNumber,
  handleSearch,
  handleLogout,
}: WhatsAppSideBarProps) {
  return (
    <div
      className={`w-full md:w-[280px] flex flex-col bg-white fixed md:relative z-20 
            transition-all duration-300 ease-in-out 
            h-full
            ${sidebarOpen ? "left-0" : "-left-full md:left-0"}`}
    >
      <div className="p-3.5 border-b mt-14 md:mt-0 bg-gradient-to-r from-[#411E8A] to-[#050044]">
        <Button
          variant="outline"
          className="w-full flex cursor-pointer items-center justify-center gap-2 text-[#411E8A] hover:text-white hover:bg-tertiary/10 border-[#411E8A] rounded-full transition-all duration-200"
          onClick={handleLogout}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Button>
      </div>
      <div className="p-4 bg-white">
        <div className="relative">
          <Input
            placeholder="Buscar"
            className="pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none"
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
        </div>
      </div>
      <div className="px-4 py-2 space-y-4">
        <h2 className="font-bold text-lg mb-4">Agregar nuevo número</h2>
        <div className="relative">
          <Input
            placeholder="Número"
            type="tel"
            className="pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNumber()}
          />
          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
        </div>
        <div className="relative">
          <Input
            placeholder="Nombre"
            type="text"
            required
            className="pl-10 pr-4 py-2 rounded-full bg-gray-100 border-none"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && addNumber()
            }
          />
          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
        </div>
        <Button
          className="w-full my-6 bg-gradient-to-r from-[#411E8A] to-[#050044] hover:from-[#050044] hover:to-[#411E8A] text-white rounded-full transition-all duration-200"
          onClick={addNumber}
        >
          +Conectar Nuevo Número
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {whatsappNumbers.map((number) => (
          <div
            key={number.id}
            className={cn(
              "group p-4 cursor-pointer transition-colors rounded-2xl",
              selectedNumber?.id === number.id
                ? "bg-purple-50 border-l-4 border-secondary border-b"
                : "bg-gray-100"
            )}
            onClick={() => setSelectedNumber(number)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3
                  className={cn(
                    "font-medium",
                    selectedNumber?.id === number.id
                      ? "text-secondary"
                      : "text-gray-700"
                  )}
                >
                  {number.name}
                </h3>
                <p className="text-sm text-gray-500">{number.number}</p>
              </div>
              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  removeNumber(number.id.toString());
                }}
                className="p-2 bg-transparent border-none shadow-none rounded hidden group-hover:block hover:bg-red-50 text-red-500"
              >
                <Trash />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t bg-white">
        <MessagesCard />
      </div>
    </div>
  );
}
