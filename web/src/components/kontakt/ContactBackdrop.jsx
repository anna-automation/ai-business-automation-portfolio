/**
 * Pozadí kontaktní stránky.
 *
 * Rozmístění září je odměřené z předlohy — nejsilnější růžová je v pravém
 * dolním rohu, druhá v pravém horním a třetí vlevo zhruba v polovině výšky.
 * K tomu světelný oblouk, který se otře o pravý dolní roh.
 */
export default function ContactBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* základní spád plochy */}
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#0d0718_0%,#0a0616_44%,#070412_100%)]" />

      {/* sotva znatelná technická mřížka */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.022)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.022)_1px,transparent_1px)] bg-[size:68px_68px] [mask-image:radial-gradient(90%_75%_at_50%_35%,#000,transparent)]" />

      {/* 1. nejsilnější: pravý dolní roh */}
      <div className="absolute -bottom-[26%] -right-[14%] size-[62rem] rounded-full bg-[radial-gradient(circle,rgb(255_20_102/0.5)_0%,rgb(216_0_79/0.26)_38%,transparent_68%)] blur-[30px]" />

      {/* 2. pravý horní roh */}
      <div className="absolute -right-[12%] -top-[26%] size-[40rem] rounded-full bg-[radial-gradient(circle,rgb(255_20_102/0.2)_0%,rgb(192_38_211/0.12)_44%,transparent_70%)] blur-[26px]" />

      {/* 3. vlevo zhruba v polovině výšky */}
      <div className="absolute -left-[18%] top-[38%] size-[44rem] rounded-full bg-[radial-gradient(circle,rgb(255_20_102/0.19)_0%,rgb(124_58_237/0.13)_46%,transparent_70%)] blur-[28px]" />

      {/* doplňková fialová vlevo dole, aby levý okraj neztmavl naráz */}
      <div className="absolute -left-[12%] bottom-[2%] size-[34rem] rounded-full bg-[radial-gradient(circle,rgb(124_58_237/0.22)_0%,transparent_66%)] blur-[24px]" />

      {/* teplé podsvícení za fotkou */}
      <div className="absolute bottom-[8%] left-[32%] hidden size-[30rem] rounded-full bg-[radial-gradient(circle,rgb(255_20_102/0.17)_0%,transparent_64%)] blur-[34px] lg:block" />

      {/* Světelné oblouky. Na předloze to nejsou linky, ale měkké stopy světla,
          které vybíhají z pravého dolního rohu a z pravého horního. */}
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="kt-arc-a" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ff1466" stopOpacity="0.85" />
            <stop offset="0.45" stopColor="#ff1466" stopOpacity="0.35" />
            <stop offset="1" stopColor="#c026d3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kt-arc-b" x1="1" y1="0" x2="0.2" y2="1">
            <stop offset="0" stopColor="#ff3d85" stopOpacity="0.5" />
            <stop offset="0.6" stopColor="#c026d3" stopOpacity="0.14" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M1440 1010 C 1190 980, 1030 870, 980 700"
          stroke="url(#kt-arc-a)"
          strokeWidth="26"
          strokeLinecap="round"
          opacity="0.5"
          style={{ filter: 'blur(26px)' }}
        />
        <path
          d="M1452 1000 C 1240 960, 1110 850, 1070 710"
          stroke="url(#kt-arc-a)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.75"
          style={{ filter: 'blur(3px)' }}
        />
        <path
          d="M1470 -30 C 1300 60, 1230 190, 1240 320"
          stroke="url(#kt-arc-b)"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.45"
          style={{ filter: 'blur(20px)' }}
        />
      </svg>
    </div>
  )
}
