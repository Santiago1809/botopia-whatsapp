'use client'

import { useState, useRef, useEffect } from "react"
import { Sun, Moon, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeSwitcher() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Determine if we're currently in dark mode
  const isDarkMode = resolvedTheme === 'dark'

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón principal - blanco en modo claro, gris en modo oscuro */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-black hover:bg-gray-100 dark:bg-[#4a4a4f] dark:text-white dark:hover:bg-[#5a5a60] p-2 rounded-md transition-colors"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </button>

      {/* Dropdown menu - con animación de izquierda a derecha */}
      <div
        className={`absolute right-full top-[-10px] mr-2 bg-[hsl(var(--sidebar))] border rounded-lg shadow-md transition-all duration-200 origin-right w-36 z-50 ${
          isOpen
            ? "opacity-100 scale-x-100 translate-x-0"
            : "opacity-0 scale-x-0 -translate-x-4 pointer-events-none"
        }`}
      >
        <div className="p-1 space-y-1">
          <button
            onClick={() => {
              setTheme("light")
              setIsOpen(false)
            }}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors
              ${theme === 'light' 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : isDarkMode
                  ? 'bg-transparent text-white hover:bg-white/10' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
          >
            <Sun className="h-4 w-4 mr-2" />
            <span>Claro</span>
          </button>

          <button
            onClick={() => {
              setTheme("dark")
              setIsOpen(false)
            }}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors
              ${theme === 'dark' 
                ? 'bg-[#4a4a4f] text-white hover:bg-primary/90' 
                : isDarkMode
                  ? 'bg-transparent text-white hover:bg-white/10' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
          >
            <Moon className="h-4 w-4 mr-2" />
            <span>Oscuro</span>
          </button>

          <button
            onClick={() => {
              setTheme("system")
              setIsOpen(false)
            }}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors
              ${theme === 'system' 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : isDarkMode
                  ? 'bg-transparent text-white hover:bg-white/10' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
          >
            <Laptop className="h-4 w-4 mr-2" />
            <span>Sistema</span>
          </button>
        </div>
      </div>
    </div>
  )
}