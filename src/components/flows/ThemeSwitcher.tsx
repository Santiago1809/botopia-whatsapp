'use client'

import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-background text-black hover:bg-accent/50 hover:text-white 
          data-[state=open]:bg-accent/50 data-[state=open]:text-white
          dark:bg-background dark:text-white"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all 
          dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all 
          dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dark:bg-[hsl(240,3.7%,15.9%)]">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="group flex items-center cursor-pointer hover:bg-accent/50"
        >
          <Sun className="h-4 w-4 mr-2 text-black dark:text-white group-hover:text-white" />
          <span className="text-black dark:text-white group-hover:text-white">Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="group flex items-center cursor-pointer hover:bg-accent/50"
        >
          <Moon className="h-4 w-4 mr-2 text-black dark:text-white group-hover:text-white" />
          <span className="text-black dark:text-white group-hover:text-white">Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="group flex items-center cursor-pointer hover:bg-accent/50"
        >
          <Monitor className="h-4 w-4 mr-2 text-black dark:text-white group-hover:text-white" />
          <span className="text-black dark:text-white group-hover:text-white">Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}