import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Layout, 
  Users,
  FileText,
} from "lucide-react";

export function FlowSidebar() {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r bg-background">
      {/* Header con botón de regreso */}
      <div className="h-[88px] flex items-center px-6">
        <Button 
          variant="outline"
          className="flex items-center space-x-4 h-12 px-4 border-2 hover:bg-accent hover:text-white group w-full"
          asChild
        >
          <Link href="/services/">
            <ArrowLeft className="h-10 w-10 group-hover:text-white transition-colors" /> {/* Aumentado de h-8 w-8 a h-10 w-10 */}
            <span className="font-semibold text-2xl group-hover:text-white transition-colors">Regresar</span>
          </Link>
        </Button>
      </div>

      {/* Secciones del sidebar */}
      <div className="p-4 space-y-2">
        {/* Título de la sección */}
        <div className="text-sm font-medium text-muted-foreground mb-4 px-3">
          PRINCIPAL
        </div>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-12 px-3 hover:text-white group"
          asChild
        >
          <Link href="/services/flows/templates" className="flex items-center space-x-3">
            <FileText className="h-6 w-6" />
            <div className="flex flex-col items-start">
              <span className="font-medium group-hover:text-white">Plantillas</span>
              <span className="text-xs text-muted-foreground group-hover:text-white/70">Flujos predefinidos</span>
            </div>
          </Link>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-12 px-3 hover:text-white group"
          asChild
        >
          <Link href="/services/flows/principal" className="flex items-center space-x-3">
            <Layout className="h-6 w-6" />
            <div className="flex flex-col items-start">
              <span className="font-medium group-hover:text-white">Mis Flujos</span>
              <span className="text-xs text-muted-foreground group-hover:text-white/70">Flujos personalizados</span>
            </div>
          </Link>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start h-12 px-3 hover:text-white group"
          asChild
        >
          <Link href="/services/flows/community" className="flex items-center space-x-3">
            <Users className="h-6 w-6" />
            <div className="flex flex-col items-start">
              <span className="font-medium group-hover:text-white">Comunidad</span>
              <span className="text-xs text-muted-foreground group-hover:text-white/70">Flujos compartidos</span>
            </div>
          </Link>
        </Button>
      </div>

      {/* Sección de configuración */}
      <div className="p-4 space-y-2">
        <div className="text-sm font-medium text-muted-foreground mb-4 px-3">
          CONFIGURACIÓN
        </div>
        {/* Aquí puedes agregar más opciones de configuración si lo necesitas */}
      </div>
    </div>
  );
}