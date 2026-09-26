'use client';

import React, { useEffect, useRef, useState } from 'react';
import useMeasure from 'react-use-measure';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { cn } from '@/lib/utils';
import useClickOutside from '@/hooks/useClickOutside';

// Motion Primitives — ToolbarExpandable.
// Adaptation : la démo d'origine avait des onglets figés (User, Messages…) ;
// les onglets sont désormais passés en props, et le style suit la palette du site.

const transition = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.25,
} as const;

export type ToolbarExpandableItem = {
  id: number;
  label: string;
  title: React.ReactNode;
  content: React.ReactNode;
};

export type ToolbarExpandableProps = {
  items: ToolbarExpandableItem[];
  className?: string;
  /** Largeur minimale du panneau ouvert (px). */
  minPanelWidth?: number;
  /** Adaptation : sens d'ouverture (vers le haut par défaut, vers le bas en haut d'écran). */
  direction?: 'up' | 'down';
};

export default function ToolbarExpandable({
  items,
  className,
  minPanelWidth = 0,
  direction = 'up',
}: ToolbarExpandableProps) {
  const [active, setActive] = useState<number | null>(null);
  const [contentRef, { height: heightContent }] = useMeasure();
  const [menuRef, { width: widthContainer }] = useMeasure();
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [maxWidth, setMaxWidth] = useState(0);

  useClickOutside(ref, () => {
    setIsOpen(false);
    setActive(null);
  });

  useEffect(() => {
    if (!widthContainer || maxWidth > 0) return;

    setMaxWidth(Math.max(widthContainer, minPanelWidth));
  }, [widthContainer, maxWidth, minPanelWidth]);

  return (
    <MotionConfig transition={transition}>
      <div className={className} ref={ref}>
        <div
          className={cn(
            'flex h-full w-full rounded-xl border border-line bg-deep/85 backdrop-blur-md',
            direction === 'down' ? 'flex-col-reverse' : 'flex-col'
          )}
        >
          <div className='overflow-hidden'>
            <AnimatePresence initial={false} mode='sync'>
              {isOpen ? (
                <motion.div
                  key='content'
                  initial={{ height: 0 }}
                  animate={{ height: heightContent || 0 }}
                  exit={{ height: 0 }}
                  style={{
                    width: maxWidth,
                  }}
                >
                  <div ref={contentRef} className='p-2'>
                    {items.map((item) => {
                      const isSelected = active === item.id;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isSelected ? 1 : 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <div
                            id={`toolbar-panel-${item.id}`}
                            role='region'
                            aria-label={item.label}
                            className={cn(
                              'px-2 pt-2 text-sm text-text',
                              isSelected ? 'block' : 'hidden'
                            )}
                          >
                            {item.content}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <div className='flex justify-end space-x-2 p-2' ref={menuRef}>
            {items.map((item) => (
              <button
                key={item.id}
                aria-label={item.label}
                aria-expanded={active === item.id}
                aria-controls={`toolbar-panel-${item.id}`}
                className={cn(
                  'relative flex h-9 w-9 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-text active:scale-[0.98]',
                  active === item.id ? 'bg-white/8 text-glow' : ''
                )}
                type='button'
                onClick={() => {
                  if (!isOpen) setIsOpen(true);
                  if (active === item.id) {
                    setIsOpen(false);
                    setActive(null);
                    return;
                  }

                  setActive(item.id);
                }}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
