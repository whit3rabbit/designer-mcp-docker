'use client';

import * as React from 'react';
import { useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';

interface Card3DContextValue {
  isHovered: boolean;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
  reducedMotion: boolean;
}

const Card3DContext = React.createContext<Card3DContextValue | undefined>(undefined);

export function useCard3D() {
  const ctx = React.useContext(Card3DContext);
  if (!ctx) {
    throw new Error('useCard3D must be used within a CardContainer');
  }
  return ctx;
}

export interface CardContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  containerClassName?: string;
  tiltStrength?: number;
}

export function CardContainer({
  children,
  className,
  containerClassName,
  tiltStrength = 12,
  ...rest
}: CardContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const reducedMotion = Boolean(useReducedMotion());

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const rotateY = x * tiltStrength;
    const rotateX = -y * tiltStrength;
    containerRef.current.style.transform = `rotateY(${rotateY.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg)`;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (containerRef.current) {
      containerRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
  };

  return (
    <Card3DContext.Provider value={{ isHovered, setIsHovered, reducedMotion }}>
      <div
        className={clsx('flex items-center justify-center', containerClassName)}
        style={{ perspective: reducedMotion ? undefined : '1000px' }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={clsx(
            'relative flex items-center justify-center transition-transform duration-200 ease-out',
            className,
          )}
          style={{
            transformStyle: reducedMotion ? undefined : 'preserve-3d',
          }}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Card3DContext.Provider>
  );
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardBody({ children, className, style, ...rest }: CardBodyProps) {
  const { reducedMotion } = useCard3D();
  return (
    <div
      className={clsx('h-full w-full border p-6', className)}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--color-text)',
        transformStyle: reducedMotion ? undefined : 'preserve-3d',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface CardItemProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
}

export function CardItem({
  as: Component = 'div',
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  style,
  ...rest
}: CardItemProps) {
  const { isHovered, reducedMotion } = useCard3D();

  const transform =
    !reducedMotion && isHovered
      ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
      : 'translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

  return (
    <Component
      className={clsx('w-fit transition-transform duration-200 ease-out', className)}
      style={{
        transform: reducedMotion ? undefined : transform,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
