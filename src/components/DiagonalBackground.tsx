import React from "react";

interface DiagonalBackgroundProps {
  className?: string;
}

export const DiagonalBackground: React.FC<DiagonalBackgroundProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* Fondo secundario para toda la SVG */}
        <rect width="100" height="100" fill="currentColor" />

        {/* Diagonal que se adapta al tema */}
        <polygon
          points="0,0 180,0 0,90"
          className="fill-background dark:fill-muted"
        />
      </svg>
    </div>
  );
};

export default DiagonalBackground;
