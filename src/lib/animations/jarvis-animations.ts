import { Dispatch, SetStateAction } from 'react';

// Tipos para las animaciones
export interface CellParticle {
  id: string;
  top: number;
  delay: number;
  direction: 'in' | 'out';
}

export interface IconTransitionState {
  active: boolean;
  direction: 'to-chat' | 'to-button';
  style: Record<string, unknown>;
}

// Función para generar partículas de anticipación
export const generateAnticipationParticles = (
  container: HTMLElement, 
  position: {left: number, top: number}, 
  count: number
): void => {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const anticipationParticle = document.createElement('div');
      anticipationParticle.className = 'anticipation-particle';
      
      // Si es el body, usar posición fija, si no, usar posición absoluta
      const isBody = container === document.body;
      anticipationParticle.style.position = isBody ? 'fixed' : 'absolute';
      
      if (isBody) {
        // Para el body, usar las coordenadas directamente
        anticipationParticle.style.left = `${position.left}px`;
        anticipationParticle.style.top = `${position.top}px`;
      } else {
        // Para otros contenedores, usar posición relativa al contenedor
        anticipationParticle.style.left = '50%';
        anticipationParticle.style.top = '50%';
      }
      
      anticipationParticle.style.width = '4px';
      anticipationParticle.style.height = '4px';
      anticipationParticle.style.backgroundColor = 'rgba(245, 158, 11, 0.9)';
      anticipationParticle.style.borderRadius = '50%';
      anticipationParticle.style.zIndex = '1099';
      anticipationParticle.style.transform = 'translate(-50%, -50%)';
      
      container.appendChild(anticipationParticle);
      
      // Animación de explosión
      setTimeout(() => {
        anticipationParticle.style.transition = 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
        
        // Dirección aleatoria
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30;
        anticipationParticle.style.transform = 
          `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(${Math.random() * 0.5 + 0.5})`;
        anticipationParticle.style.opacity = '0';
        
        setTimeout(() => {
          if (container.contains(anticipationParticle)) {
            container.removeChild(anticipationParticle);
          }
        }, 500);
      }, 10);
    }, i * 30); // Espaciado temporal entre partículas
  }
};

// Función para crear partículas celulares
export const createCellParticles = (
  direction: 'in' | 'out', 
  setIsAnimating: Dispatch<SetStateAction<boolean>>, 
  setShowHeaderIcon: Dispatch<SetStateAction<boolean>>, 
  setCellParticles: Dispatch<SetStateAction<CellParticle[]>>
): void => {
  // Generar entre 10 y 15 partículas
  const particleCount = Math.floor(Math.random() * 6) + 10;
  const particles: CellParticle[] = [];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      id: `particle-${i}-${Date.now()}`,
      top: Math.random() * 100, // Posición vertical aleatoria
      delay: Math.random() * 0.5, // Retraso aleatorio
      direction
    });
  }
  
  // Activar animación y establecer partículas
  setIsAnimating(true);
  setCellParticles(particles);
  
  // Limpiar animación después de completarse
  setTimeout(() => {
    setIsAnimating(false);
    setCellParticles([]);
  }, 2000); // Duración de la animación
};

// Función para crear un rastro de partículas
export const createPathParticle = (
  currentX: number, 
  currentY: number
): void => {
  const pathParticle = document.createElement('div');
  pathParticle.className = 'path-particle';
  pathParticle.style.position = 'fixed';
  pathParticle.style.width = '3px';
  pathParticle.style.height = '3px';
  pathParticle.style.left = `${currentX}px`;
  pathParticle.style.top = `${currentY}px`;
  pathParticle.style.backgroundColor = 'rgba(245, 158, 11, 0.9)';
  pathParticle.style.borderRadius = '50%';
  pathParticle.style.zIndex = '1099';
  document.body.appendChild(pathParticle);
  
  setTimeout(() => {
    pathParticle.style.transition = 'all 0.4s ease-out';
    pathParticle.style.opacity = '0';
    pathParticle.style.transform = 'scale(2) translate(0, 0)';
    
    setTimeout(() => {
      if (document.body.contains(pathParticle)) {
        document.body.removeChild(pathParticle);
      }
    }, 400);
  }, 10);
};

// Función para crear una partícula del rastro del icono
export const createTrailParticle = (
  direction: 'to-chat' | 'to-button',
  currentIconState: React.CSSProperties
): void => {
  const particle = document.createElement('div');
  particle.className = 'icon-trail-particle';
  particle.style.position = 'fixed';
  particle.style.width = '5px';
  particle.style.height = '5px';
  particle.style.borderRadius = '50%';
  particle.style.backgroundColor = 'rgba(245, 158, 11, 0.7)';
  particle.style.zIndex = '1099';
  particle.style.pointerEvents = 'none';
  
  // Posición aleatoria cerca del icono
  const left = parseFloat(String(currentIconState.left ?? '0')) + (Math.random() * 10 - 5);
  const top = parseFloat(String(currentIconState.top ?? '0')) + (Math.random() * 10 - 5);
  
  particle.style.left = `${left}px`;
  particle.style.top = `${top}px`;
  
  document.body.appendChild(particle);
  
  // Animar y eliminar la partícula
  setTimeout(() => {
    particle.style.transition = 'all 0.8s ease-out';
    particle.style.opacity = '0';
    particle.style.transform = direction === 'to-chat' 
      ? 'scale(0.3) translate(20px, -5px)' 
      : 'scale(0.3) translate(-20px, 5px)';
    
    setTimeout(() => {
      if (document.body.contains(particle)) {
        document.body.removeChild(particle);
      }
    }, 800);
  }, 10);
};

// Función principal de animación de transición del icono
export const animateIconTransition = (
  direction: 'to-chat' | 'to-button',
  buttonRef: React.RefObject<HTMLButtonElement>,
  panelRef: React.RefObject<HTMLDivElement>,
  setShowHeaderIcon: Dispatch<SetStateAction<boolean>>,
  setIconTransition: Dispatch<SetStateAction<IconTransitionState>>
): void => {
  const buttonElement = buttonRef.current;
  const panelElement = panelRef.current;
  
  // Verificar si los elementos existen antes de proceder
  if (!buttonElement || !panelElement) {
    console.warn('No se pueden encontrar los elementos de referencia para la animación');
    return;
  }
  
  const buttonRect = buttonElement.getBoundingClientRect();
  const panelRect = panelElement.getBoundingClientRect();
  
  // Ocultar el icono del encabezado al inicio de cualquier animación
  setShowHeaderIcon(false);
  
  // Posición inicial y final para la animación
  type Position = { left: number; top: number; size: number };
  let startPos: Position, endPos: Position;
  
  if (direction === 'to-chat') {
    // Del botón al encabezado del chat
    startPos = {
      left: buttonRect.left + buttonRect.width / 2,
      top: buttonRect.top + buttonRect.height / 2,
      size: 28 // tamaño del icono en el botón (w-7 h-7)
    };
    
    // Ubicación aproximada del icono en el encabezado
    endPos = {
      left: panelRect.left + 22, // 22px desde la izquierda del panel
      top: panelRect.top + 22,  // 22px desde la parte superior del panel 
      size: 20 // tamaño del icono más pequeño en el encabezado (w-5 h-5)
    };
  } else {
    // Del encabezado al botón
    startPos = {
      left: panelRect.left + 22,
      top: panelRect.top + 22,
      size: 20
    };
    
    endPos = {
      left: buttonRect.left + buttonRect.width / 2,
      top: buttonRect.top + buttonRect.height / 2,
      size: 28
    };
  }
  
  // Crear puntos de control para el arco de movimiento
  const distance = Math.sqrt(
    Math.pow(endPos.left - startPos.left, 2) + 
    Math.pow(endPos.top - startPos.top, 2)
  );
  
  // Generar partículas de anticipación antes de que comience la animación
  generateAnticipationParticles(direction === 'to-chat' ? buttonElement : document.body, startPos, 12);
  
  // Iniciar la animación
  setIconTransition({
    active: true,
    direction,
    style: {
      position: 'fixed',
      left: `${startPos.left}px`,
      top: `${startPos.top}px`,
      width: `${startPos.size}px`,
      height: `${startPos.size}px`,
      transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
      zIndex: 1100,
      transition: 'none', // Sin transición inicial
      opacity: 1,
      filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))'
    }
  });
  
  // Crear rastro de partículas para seguir al icono
  let latestIconStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${startPos.left}px`,
    top: `${startPos.top}px`,
    width: `${startPos.size}px`,
    height: `${startPos.size}px`,
    transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
    zIndex: 1100,
    transition: 'none',
    opacity: 1,
    filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))'
  };

  setIconTransition((prev) => {
    latestIconStyle = prev.style as React.CSSProperties;
    return prev;
  });

  // Crear partículas a un ritmo más lento durante una animación más larga
  const trailInterval = setInterval(() => {
    createTrailParticle(direction, latestIconStyle);
  }, 50); // Aumentado a 50ms para una animación más larga
  
  // Después de un pequeño retraso para FLIP animation
  requestAnimationFrame(() => {
    // Primera fase: desaparición parcial
    setIconTransition(prev => ({
      ...prev,
      style: {
        ...prev.style,
        transition: 'all 0.2s cubic-bezier(0.34, 1.82, 0.64, 1)', // Aumentado a 0.2s
        opacity: '0.8',
        transform: 'translate(-50%, -50%) scale(0.9) rotate(180deg)',
        filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.8)) blur(1px)'
      }
    }));
    
    // Animar a lo largo de un arco usando keyframes
    const startTime = Date.now();
    const duration = 600; // Aumentado a 600 ms (de 150 ms)
    const disappearDuration = 200; // Aumentado a 200 ms (de 50 ms)
    const reappearStart = 320; // Aumentado a 320 ms (de 80 ms)
    
    const animateArc = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        // Fase 1: Desaparición gradual mientras inicia el movimiento
        if (progress < disappearDuration / duration) {
          const fadeProgress = progress / (disappearDuration / duration);
          const initialMove = fadeProgress * 0.3; // 30% del movimiento total
          
          const currentX = startPos.left + (endPos.left - startPos.left) * initialMove;
          const arcY = startPos.top + (endPos.top - startPos.top) * initialMove - 
                      Math.sin(fadeProgress * Math.PI * 0.5) * distance * 0.1;
          
          setIconTransition(prev => ({
            ...prev,
            style: {
              ...prev.style,
                transition: 'transform 0.25s ease, opacity 0.25s ease',
              left: `${currentX}px`,
              top: `${arcY}px`,
              opacity: `${1 - fadeProgress * 0.95}`, // Casi invisible al 95%
              transform: `translate(-50%, -50%) scale(${0.8 - fadeProgress * 0.3}) rotate(${180 + fadeProgress * 120}deg)`,
              filter: `drop-shadow(0 0 ${10 + fadeProgress * 5}px rgba(245, 158, 11, ${0.8 - fadeProgress * 0.6})) blur(${1 + fadeProgress * 2}px)`
            }
          }));
        } 
        // Fase 2: Movimiento invisible
        else if (progress < reappearStart / duration) {
          const moveProgress = (progress - disappearDuration / duration) / ((reappearStart - disappearDuration) / duration);
          const totalMove = 0.3 + moveProgress * 0.6; // 30% a 90% del movimiento
          
          const currentX = startPos.left + (endPos.left - startPos.left) * totalMove;
          const arcY = startPos.top + (endPos.top - startPos.top) * totalMove - 
                      Math.sin(moveProgress * Math.PI) * distance * 0.25;
          
          // Generar partículas en el camino
          if (Math.random() > 0.7) {
            createPathParticle(currentX, arcY);
          }
          
          setIconTransition(prev => ({
            ...prev,
            style: {
              ...prev.style,
              transition: 'none',
              left: `${currentX}px`,
              top: `${arcY}px`,
              opacity: '0.05',
            }
          }));
        } 
        // Fase 3: Reaparición gradual cerca del destino
        else {
          const reappearProgress = (progress - reappearStart / duration) / (1 - reappearStart / duration);
          const totalMove = 0.9 + reappearProgress * 0.1; // 90% a 100% del movimiento
          
          const currentX = startPos.left + (endPos.left - startPos.left) * totalMove;
          const arcY = startPos.top + (endPos.top - startPos.top) * totalMove - 
                      Math.sin((1 - reappearProgress) * Math.PI * 0.5) * distance * 0.05;
          
          setIconTransition(prev => ({
            ...prev,
            style: {
              ...prev.style,
              transition: 'opacity 0.3s ease-in, transform 0.3s ease-out',
              left: `${currentX}px`,
              top: `${arcY}px`,
              opacity: `${0.05 + reappearProgress * 0.95}`,
              width: `${startPos.size + (endPos.size - startPos.size) * totalMove}px`,
              height: `${startPos.size + (endPos.size - startPos.size) * totalMove}px`,
              transform: `translate(-50%, -50%) scale(${0.5 + reappearProgress * 0.5}) rotate(${360 + reappearProgress * 360}deg)`,
              filter: `drop-shadow(0 0 ${15 - reappearProgress * 10}px rgba(245, 158, 11, ${0.2 + reappearProgress * 0.6})) blur(${3 - reappearProgress * 3}px)`
            }
          }));
        }
        
        requestAnimationFrame(animateArc);
      }
    };
    
    animateArc();
    
    // Generar partículas de recepción en el destino
    setTimeout(() => {
      generateAnticipationParticles(direction === 'to-button' ? buttonElement : document.body, endPos, 8);
    }, reappearStart);
    
    // Limpieza
    setTimeout(() => {
      clearInterval(trailInterval);
      
      // Finalizar con una transición suave a la posición final exacta
      setIconTransition(prev => ({
        ...prev,
        style: {
          ...prev.style,
          transition: 'all 0.2s ease-out', // Aumentado a 0.2s
          left: `${endPos.left}px`,
          top: `${endPos.top}px`,
          width: `${endPos.size}px`,
          height: `${endPos.size}px`,
          transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
          opacity: '1',
          filter: 'none'
        }
      }));
      
      // Finalizar la animación después de completarse
      setTimeout(() => {
        setIconTransition(prev => ({ ...prev, active: false }));
        
        if (direction === 'to-chat') {
          setShowHeaderIcon(true);
          
          // Último ajuste para mostrar el icono en el encabezado
          setTimeout(() => {
            setShowHeaderIcon(true);
            // Forzar re-render con cambio de estado
            setIconTransition(prev => ({...prev}));
          }, 200); // Aumentado a 200 ms
        }
      }, 200); // Aumentado a 200 ms
    }, duration);
  });
};