import { useEffect, useState } from 'react'
import { AmbientOverlays } from '@/components/layout/AmbientOverlays'
import { DockNav } from '@/components/layout/DockNav'
import { MissionPanel } from '@/components/layout/MissionPanel'
import { Navbar } from '@/components/layout/Navbar'
import { ScrollProgressBar } from '@/components/layout/ScrollProgressBar'
import { SignalLoader } from '@/components/loader/SignalLoader'
import { SvgFilters } from '@/components/media/SvgFilters'
import { useSite } from '@/lib/store'
import { hasWebGL } from '@/lib/webgl'
import { Preferences } from '@/providers/Preferences'
import { SmoothScroll } from '@/providers/SmoothScroll'
import { AVenir } from '@/sections/AVenir'
import { Distance } from '@/sections/Distance'
import { Hero } from '@/sections/Hero'
import { CssFallback } from '@/three/CssFallback'
import { Experience } from '@/three/Experience'

export default function App() {
  const webgl = useSite((s) => s.webgl)
  const setWebgl = useSite((s) => s.setWebgl)
  const [supported] = useState(hasWebGL)

  useEffect(() => {
    if (!supported) setWebgl('unsupported')
  }, [supported, setWebgl])

  const use3D = supported && webgl !== 'failed' && webgl !== 'unsupported'

  return (
    <SmoothScroll>
      <Preferences />
      <SvgFilters />
      <a
        href="#contenu"
        className="label fixed left-4 top-4 z-[90] -translate-y-24 rounded-full bg-text px-4 py-2 text-[10px] text-void focus:translate-y-0"
      >
        Aller au contenu
      </a>
      {use3D ? <Experience /> : <CssFallback />}
      <AmbientOverlays />
      <ScrollProgressBar />
      <Navbar />
      <main id="contenu">
        <Hero />
        <Distance />
        <AVenir />
      </main>
      <DockNav />
      <MissionPanel />
      <SignalLoader />
    </SmoothScroll>
  )
}
