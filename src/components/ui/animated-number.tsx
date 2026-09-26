'use client';
import { cn } from '@/lib/utils';
import { motion, type SpringOptions, useSpring, useTransform } from 'motion/react';
import { useEffect, useMemo } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: React.ElementType;
  format?: (value: number) => string;
};

const defaultFormat = (value: number) =>
  Math.round(value).toLocaleString('fr-FR');

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span',
  format = defaultFormat,
}: AnimatedNumberProps) {
  // Adaptation : composant motion mémorisé (sinon recréé, donc remonté, à chaque rendu).
  const MotionComponent = useMemo(() => motion.create(as as keyof React.JSX.IntrinsicElements), [as]);

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) => format(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <MotionComponent className={cn('tabular-nums', className)}>
      {display}
    </MotionComponent>
  );
}
