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
      className={`w-full md:w-[280px] flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 fixed md:relative z-20 
            transition-all duration-300 ease-in-out 
            h-full
            ${sidebarOpen ? "left-0" : "-left-full md:left-0"}`}
    >
      <div className="p-2.5 border-b mt-14 md:mt-0 bg-secondary">
        <div className="flex justify-between items-center mb-2">
          <Button
            variant="outline"
            className="flex cursor-pointer items-center justify-center text-gray-800 hover:text-white hover:bg-white/20 border-white/30 dark:text-white rounded-full transition-all duration-200 px-4"
            onClick={handleLogout}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al dashboard
          </Button>
        </div>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <Input
            placeholder="Buscar"
            className="pl-10 pr-4 py-2 rounded-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>
      <div className="px-4 py-2 space-y-4 bg-gray-50 dark:bg-gray-900">
        <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
          Agregar nuevo número
        </h2>
        <div className="relative">
          <Input
            placeholder="Número"
            type="tel"
            className="pl-10 pr-4 py-2 rounded-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNumber()}
          />
          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="relative">
          <Input
            placeholder="Nombre"
            type="text"
            required
            className="pl-10 pr-4 py-2 rounded-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              e.key === "Enter" && addNumber()
            }
          />
          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <Button
          className="w-full my-6 bg-gradient-to-r from-[#411E8A] to-[#050044] hover:from-[#050044] hover:to-[#411E8A] text-white rounded-full transition-all duration-200"
          onClick={addNumber}
        >
          +Conectar Nuevo Número
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {whatsappNumbers.map((number) => (
          <div
            key={number.id}
            className={cn(
              "group p-4 cursor-pointer transition-colors rounded-2xl",
              selectedNumber?.id === number.id
                ? "bg-gradient-to-r from-[#411E8A]/20 to-[#050044]/20 dark:from-[#411E8A]/30 dark:to-[#050044]/30 border-l-4 border-[#411E8A] dark:border-blue-400"
                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
            onClick={() => setSelectedNumber(number)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3
                  className={cn(
                    "font-medium",
                    selectedNumber?.id === number.id
                      ? "text-[#411E8A] dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-100"
                  )}
                >
                  {number.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {number.number}
                </p>
              </div>
              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  removeNumber(number.id.toString());
                }}
                className="p-2 bg-transparent border-none shadow-none rounded hidden group-hover:block hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400"
              >
                <Trash />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-inner">
        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
        <div className="flex items-center">
          <MessagesCard />
        </div>
      </div>
    </div>
  );
}
