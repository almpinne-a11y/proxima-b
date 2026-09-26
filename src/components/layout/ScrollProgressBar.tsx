import { ScrollProgress } from '@/components/ui/scroll-progress'

export function ScrollProgressBar() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]">
      <ScrollProgress className="absolute h-[2px] bg-gradient-to-r from-glow to-dwarf" />
    </div>
  )
}
