import { useState, useCallback, memo, KeyboardEvent, useEffect, useRef } from 'react';
import { X, Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Interfaces
interface Keyword {
  id: string;
  text: string;
}

interface KeywordsModalProps {
  isVisible: boolean;
  keywords: Keyword[];
  onKeywordsChange: (keywords: Keyword[]) => void;
}

interface KeywordBadgeProps {
  keyword: Keyword;
  onRemove: (id: string) => void;
}

// Componente para mostrar una palabra clave individual como badge
const KeywordBadge = memo(({ keyword, onRemove }: KeywordBadgeProps) => (
  <Badge 
    variant="outline" 
    className="flex items-center gap-1 bg-green-50 text-green-800 border-green-200 py-1 px-2"
  >
    <span>{keyword.text}</span>
    <button 
      className="text-green-600 hover:text-green-800 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
      onClick={() => onRemove(keyword.id)}
      aria-label={`Eliminar ${keyword.text}`}
    >
      <X size={14} />
    </button>
  </Badge>
));
KeywordBadge.displayName = 'KeywordBadge';

// Componente principal para el modal de palabras clave
function KeywordsModalComponent({ isVisible, keywords, onKeywordsChange }: KeywordsModalProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus en el input cuando se abre el modal
  useEffect(() => {
    if (isDialogOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDialogOpen]);

  // Agregar nueva palabra clave
  const handleAddKeyword = useCallback(() => {
    if (newKeyword.trim()) {
      const newKeywordItem = {
        id: Date.now().toString(),
        text: newKeyword.trim()
      };
      onKeywordsChange([...keywords, newKeywordItem]);
      setNewKeyword('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [newKeyword, keywords, onKeywordsChange]);

  // Agregar palabra clave al presionar Enter
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  }, [handleAddKeyword]);

  // Eliminar palabra clave
  const handleRemoveKeyword = useCallback((id: string) => {
    onKeywordsChange(keywords.filter(keyword => keyword.id !== id));
  }, [keywords, onKeywordsChange]);

  // Controlar cambio de estado del diálogo
  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
  }, []);

  // Si no debe ser visible, no renderizamos nada
  if (!isVisible) return null;

  return (
    <div className="mt-2 flex justify-center">
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white dark:bg-[rgba(0,0,0,0.3)] border-gray-500 dark:border-gray-600 border-[1px] hover:bg-green-50 dark:hover:bg-[rgba(0,0,0,0.4)] flex items-center justify-center gap-2 mx-auto w-[330px] backdrop-blur-sm"
          >
            <MessageSquare size={16} className="text-black dark:text-white" />
            <span className="text-sm font-normal text-black dark:text-white">Configurar palabras clave</span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-center">Palabras Clave</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="text-sm text-white-600 mb-4">
              El bot responderá cuando reciba mensajes que contengan estas palabras clave
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-grow">
                <input
                  ref={inputRef}
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe una palabra clave"
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm h-10 focus:outline-none focus:ring-1 focus:ring-green-500"
                  maxLength={50}
                />
              </div>
              <Button 
                type="button"
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim()}
                className="bg-green-600 hover:bg-green-700 text-white h-10 px-3"
              >
                <Plus size={18} />
              </Button>
            </div>
            
            <div className={cn(
              "p-4 border rounded-md min-h-[120px] max-h-[200px] overflow-y-auto",
              keywords.length === 0 ? "flex items-center justify-center" : "flex flex-wrap gap-2"
            )}>
              {keywords.length > 0 ? (
                keywords.map((keyword) => (
                  <KeywordBadge 
                    key={keyword.id} 
                    keyword={keyword} 
                    onRemove={handleRemoveKeyword} 
                  />
                ))
              ) : (
                <p className="text-sm text-white-500 text-center">
                  No hay palabras clave. Agrega algunas para activar el bot.
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between gap-4 mt-4">
            <p className="text-xs text-gray-500">
              {keywords.length} {keywords.length === 1 ? 'palabra clave' : 'palabras clave'}
            </p>
            <Button 
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Exportar componente memoizado
export const KeywordsModal = memo(KeywordsModalComponent);

// Exportar componente directamente
export default KeywordsModal;