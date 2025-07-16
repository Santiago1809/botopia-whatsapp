"use client";

import { cn } from "@/lib/utils";
import { WhatsappNumber } from "@/types/gobal";
import { ArrowLeft, Phone, Search, Trash, User } from "lucide-react";
import MessagesCard from "./MessageCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ThemeToggle } from "./ThemeToggle";

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
      className={`w-full md:w-[280px] flex flex-col bg-card text-card-foreground dark:bg-sidebar fixed md:relative z-20 
            transition-all duration-300 ease-in-out 
            h-full
            ${sidebarOpen ? "left-0" : "-left-full md:left-0"}`}
    >
      <div className="p-2.5 border-b mt-14 md:mt-0 bg-gradient-to-r from-primary to-secondary dark:from-secondary dark:to-primary">
        <div className="flex justify-between items-center mb-2">
          <ThemeToggle />
          <Button
            variant="outline"
            className="w-full ml-2 flex cursor-pointer items-center justify-center text-primary dark:text-white hover:text-white hover:bg-tertiary/10 border-primary dark:border-white rounded-full transition-all duration-200"
            onClick={handleLogout}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Button>
        </div>
      </div>
      <div className="p-4 bg-card dark:bg-sidebar">
        <div className="relative">
          <Input
            placeholder="Buscar"
            className="pl-10 pr-4 py-2 rounded-full bg-muted dark:bg-muted border-none"
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="px-4 py-2 space-y-4">
        <h2 className="font-bold text-lg mb-4 text-foreground">
          Agregar nuevo número
        </h2>
        <div className="relative">
          <Input
            placeholder="Número"
            type="tel"
            className="pl-10 pr-4 py-2 rounded-full bg-muted dark:bg-muted border-none"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNumber()}
          />
          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        <div className="relative">
          <Input
            placeholder="Nombre"
            type="text"
            required
            className="pl-10 pr-4 py-2 rounded-full bg-muted dark:bg-muted border-none"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && addNumber()
            }
          />
          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        <Button
          className="w-full my-6 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white rounded-full transition-all duration-200"
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
                ? "bg-primary/10 dark:bg-primary/20 border-l-4 border-secondary border-b"
                : "bg-muted dark:bg-muted"
            )}
            onClick={() => setSelectedNumber(number)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3
                  className={cn(
                    "font-medium",
                    selectedNumber?.id === number.id
                      ? "text-primary dark:text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {number.name}
                </h3>
                <p className="text-sm text-muted-foreground">{number.number}</p>
              </div>
              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  removeNumber(number.id.toString());
                }}
                className="p-2 bg-transparent border-none shadow-none rounded hidden group-hover:block hover:bg-destructive/10 text-destructive"
              >
                <Trash />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border bg-card dark:bg-sidebar">
        <MessagesCard />
      </div>
    </div>
  );
}
