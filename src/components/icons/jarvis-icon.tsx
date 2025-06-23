import { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function JarvisIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("jarvis-icon", props.className)}
      {...props}
    >
      {/* Núcleo central con efecto brillante */}
      <circle className="jarvis-core" cx="12" cy="12" r="3" />
      
      {/* Orbe interior - representa la conciencia de JARVIS */}
      <circle className="jarvis-inner-orb" cx="12" cy="12" r="5" strokeDasharray="2,2" />
      
      {/* Capas de esferas que representan datos y memoria */}
      <circle className="jarvis-memory-layer" cx="12" cy="12" r="7" strokeDasharray="1,3" />
      <circle className="jarvis-data-layer" cx="12" cy="12" r="9" strokeDasharray="8,2,1,2" />
      
      {/* Anillos orbitales con rotación opuesta */}
      <ellipse className="jarvis-orbit-x" cx="12" cy="12" rx="11" ry="8" />
      <ellipse className="jarvis-orbit-y" cx="12" cy="12" rx="8" ry="11" />
      
      {/* Estructura triangular del sistema neuronal */}
      <path className="jarvis-neural-structure" d="M12,4 L5,16 L19,16 Z" strokeDasharray="1,1" />
      
      {/* Red de conexiones entrecruzadas */}
      <path className="jarvis-connections" d="M5,8 L19,8 M5,16 L19,16 M4,12 L20,12" strokeDasharray="1,2" />
      
      {/* Partículas nodales */}
      <circle className="jarvis-node node-1" cx="12" cy="5" r="0.7" />
      <circle className="jarvis-node node-2" cx="19" cy="12" r="0.7" />
      <circle className="jarvis-node node-3" cx="12" cy="19" r="0.7" />
      <circle className="jarvis-node node-4" cx="5" cy="12" r="0.7" />
      
      {/* Pulsos de energía */}
      <circle className="jarvis-pulse" cx="12" cy="12" r="11" strokeDasharray="1,10" />
      
      {/* Fragmentos dispersos (como cuando JARVIS está siendo atacado) */}
      <path className="jarvis-fragment frag-1" d="M12,2 L13,5" />
      <path className="jarvis-fragment frag-2" d="M22,12 L19,13" />
      <path className="jarvis-fragment frag-3" d="M12,22 L11,19" />
      <path className="jarvis-fragment frag-4" d="M2,12 L5,11" />
    </svg>
  );
}