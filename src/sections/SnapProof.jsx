import React from 'react';
import SectionIntro from '@/sections/SectionIntro';
import { useSiteContent } from '@/lib/use-site-content';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from '@/components/ui/animated-modal';
import AnimatedContent from '@/components/AnimatedContent';
import { useSnapTransition } from '@/hooks/use-snap-transition';
import SectionCursor from '@/components/SectionCursor';
import { ArrowUpRight } from 'lucide-react';

/**
 * These are working methods, not invented client case studies. Real project
 * names, screenshots and outcomes only belong here once they are supplied.
 */
const PROJECTS = [
  {
    category: 'Page systems',
    title: 'A page is designed across every screen, not just the desktop.',
    src: '/assets/website-build-system.png',
    alt: 'A responsive website system represented by desktop, tablet and mobile layouts',
    body: [
      'We shape the offer, the content hierarchy and the next action as one system before visual polish arrives.',
      'The build is tested across the screens and moments where a visitor has to decide whether to keep going.',
    ],
  },
  {
    category: 'Strategy artifacts',
    title: 'The structure is decided before the pixels are polished.',
    src: '/assets/work-strategy-workbench.png',
    alt: 'Website wireframes and planning materials on a strategy workbench',
    body: [
      'Wireframes turn vague requests into a sequence a visitor can follow without being pushed through a maze.',
      'Every block has a job: clarify the offer, answer a doubt, show evidence or make the next action easier.',
    ],
  },
  {
    category: 'Demand alignment',
    title: 'Search, ads and landing pages are one customer journey.',
    src: '/assets/google-ads-calibration.png',
    alt: 'A campaign calibration dial with measurement cards and budget markers',
    body: [
      'The terms a person searches, the promise they see and the page they land on must make sense together.',
      'Measurement is used to find the useful signals and decide what to improve next — not to decorate a report.',
    ],
  },
];

export default function SnapProof() {
  const { home } = useSiteContent();
  const motionRef = useSnapTransition();

  return (
    <section id="proof" data-snap="proof" className="relative z-10 w-full overflow-clip bg-paper text-ink">
      {/* Mouse-reactive iridescent wash — the abstract world giving way to
          something tangible, so the field is calmer than the earlier snaps. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 40% at 12% 8%, rgba(27,75,224,0.13) 0%, rgba(255,255,255,0) 64%), radial-gradient(ellipse 50% 44% at 90% 54%, rgba(124,58,237,0.11) 0%, rgba(255,255,255,0) 66%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0, #000 11rem, #000 calc(100% - 11rem), transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0, #000 11rem, #000 calc(100% - 11rem), transparent 100%)',
        }}
      />

      {/* Colour accent only. This used to carry a 72%-white veil across the
          whole section, which flattened the wash behind it into near-blank
          paper; the seams are handled by a mask on the layer above instead. */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 84% 16%, rgba(255,138,91,0.1) 0%, rgba(255,255,255,0) 66%)',
        }}
      />

      <div ref={motionRef} className="relative z-10 pb-24">
        <SectionIntro
          headline={home.proofHeadline}
          body={home.proofBody}
        />

        {/* Each case study opens rather than being dumped on the page. The
            full write-up used to sit in a second grid underneath the cards,
            which meant reading the same three titles twice. */}
        <div className="mx-auto mt-12 w-full max-w-[1600px] px-6 sm:mt-16 sm:px-8 md:px-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {PROJECTS.map((project, i) => (
              <AnimatedContent
                key={project.title}
                distance={32}
                direction="vertical"
                delay={i * 0.12}
                duration={0.9}
                ease="power3.out"
              >
                <Modal>
                  <ModalTrigger className="group block w-full overflow-hidden rounded-2xl border border-line bg-paper !p-0 text-left shadow-[0_10px_40px_rgba(11,11,18,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(11,11,18,0.12)]">
                    <span className="relative block aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={project.src}
                        alt={project.alt}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                    </span>

                    <span className="block px-6 py-6">
                      <span className="mb-3 block text-[0.75rem] font-semibold tracking-tight text-cobalt">
                        {project.category}
                      </span>
                      <span className="mb-4 block text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-ink">
                        {project.title}
                      </span>
                      <span className="inline-flex items-center gap-2 text-[0.82rem] font-medium text-ink-soft transition-colors group-hover:text-ink">
                        Explore the method
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </span>
                  </ModalTrigger>

                  <ModalBody className="md:max-w-2xl">
                    <ModalContent className="!p-0">
                      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
                        <img src={project.src} alt={project.alt} className="h-full w-full object-cover" />
                      </div>

                      <div className="flex flex-col overflow-y-auto p-8 md:p-10">
                        <span className="mb-4 block text-[0.8rem] font-semibold tracking-tight text-cobalt">
                          {project.category}
                        </span>
                        <h3 className="mb-6 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
                          {project.title}
                        </h3>
                        {project.body.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="mb-4 text-[0.98rem] leading-relaxed text-ink-soft last:mb-0"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </ModalContent>

                    <ModalFooter className="!bg-porcelain">
                      <a
                        href="#start"
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.85rem] font-medium text-white transition-transform duration-200 active:scale-[0.98]"
                      >
                        Start a project like this
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </ModalFooter>
                  </ModalBody>
                </Modal>
              </AnimatedContent>
            ))}
          </div>
        </div>

        <AnimatedContent
          distance={30}
          direction="vertical"
          delay={0.2}
          duration={0.9}
          ease="power3.out"
          className="mx-auto mt-16 w-full max-w-[1600px] px-6 sm:mt-20 sm:px-8 md:px-16"
        >
          <a
            href="#start"
            className="group flex flex-col items-start gap-5 border-t border-line pt-8 text-ink transition-colors hover:text-cobalt sm:flex-row sm:items-center sm:justify-between sm:gap-8"
          >
            <span className="text-[clamp(1.15rem,4.6vw,1.7rem)] font-semibold tracking-[-0.025em]">
              Want the full case study, including the parts that didn't work?
            </span>
            <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 sm:h-6 sm:w-6" />
          </a>
        </AnimatedContent>
      </div>
      <SectionCursor sectionId="proof" variant="orbit" color="#1b4be0" />
    </section>
  );
}
