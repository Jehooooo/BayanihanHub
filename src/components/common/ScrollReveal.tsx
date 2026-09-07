import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  retriggerOnScroll?: boolean;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 550,
  threshold = 0.08,
  className = '',
  style,
  retriggerOnScroll = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scrollDir, setScrollDir] = useState<'down' | 'up'>('down');
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 4) {
        setScrollDir('down');
      } else if (currentScrollY < lastScrollY.current - 4) {
        setScrollDir('up');
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (!retriggerOnScroll) {
            observer.unobserve(el);
          }
        } else if (retriggerOnScroll) {
          setIsRevealed(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -25px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, retriggerOnScroll]);

  const getTransform = () => {
    if (isRevealed) return 'translateY(0) scale(1)';
    if (direction === 'scale') return 'scale(0.96)';
    if (direction === 'fade') return 'translateY(0)';
    if (direction === 'down') return 'translateY(-24px)';
    if (direction === 'up') {
      return scrollDir === 'up' ? 'translateY(-24px)' : 'translateY(24px)';
    }
    return 'translateY(24px)';
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
