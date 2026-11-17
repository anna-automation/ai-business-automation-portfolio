import { PillButton } from './parts.jsx'

/**
 * Hero: vlevo tvrzení ve třech řádcích a jedna akce, vpravo portrét v neonovém
 * prstenci. Portrét je absolutně položený, aby mohl přetéct pod další sekci —
 * přesně jako na předloze, kde karty překrývají jeho spodní okraj.
 */
export default function LandingHero() {
  return (
    <section className="relative">
      {/* --- portrét ---
          Rozměr vychází z předlohy, kde obličej zabírá 13,7 % šířky stránky
          a neonový prstenec 41 %. Tahle fotka má bližší záběr, takže obojí
          najednou sedět nemůže — 46 % šířky je zvolený kompromis.
          Běží ve stejné mřížce jako zbytek stránky (82rem + stejné okraje),
          proto lícuje s kartami i patičkou a na širokých displejích nevyčuhuje.
          Neořezává se; do pozadí se vlévá maskou, ne ořezem. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div className="relative w-full max-w-[82rem] px-5 sm:px-8">
          {/* záře, ze které fotka vystupuje */}
          <div className="lp-ring absolute right-[2%] top-[4%] aspect-square w-[64%] rounded-full bg-[radial-gradient(circle,rgb(255_20_102/0.3)_0%,rgb(124_58_237/0.14)_44%,transparent_68%)] blur-[22px] sm:w-[52%] sm:top-[5%] lg:w-[42%] lg:top-[6%]" />

          {/* Odsazení shora je pevné, ne v procentech: drží fotku pod hlavičkou,
              která má taky pevnou výšku. Šířku na velkých displejích zastropí
              `min()`, aby fotka nerostla do nekonečna. */}
          <img
            src="/media/portret.webp"
            alt=""
            fetchpriority="high"
            style={{ width: 'var(--lp-portrait-w)', marginTop: 'var(--lp-portrait-top)' }}
            className="lp-portrait-mask relative ml-auto mr-0 block opacity-70 [--lp-portrait-top:4.5rem] [--lp-portrait-w:76%] sm:mr-[2%] sm:opacity-100 sm:[--lp-portrait-top:5rem] sm:[--lp-portrait-w:60%] lg:mr-[4%] lg:[--lp-portrait-top:5.75rem] lg:[--lp-portrait-w:min(46%,34rem)]"
          />
        </div>
      </div>

      {/* Pás pod hlavičkou. Fotka začíná až za ním, tohle je pojistka pro případ,
          že by se někdy posunula nebo se změnila výška hlavičky — odkazy v ní
          musí zůstat čitelné za všech okolností. Leží nad fotkou, pod textem. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28 bg-[linear-gradient(to_bottom,#07060f_0%,rgb(7_6_15/0.92)_46%,transparent_100%)]"
      />

      {/* Závoj pod textem. Na úzkých displejích fotka leží přímo pod nadpisem,
          takže tam musí být hustší — jinak se bílá do obličeje ztratí. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,#07060f_24%,rgb(7_6_15/0.7)_56%,rgb(7_6_15/0.2)_86%)] [mask-image:linear-gradient(to_bottom,#000_72%,transparent_100%)] sm:bg-[linear-gradient(100deg,#07060f_16%,rgb(7_6_15/0.3)_42%,transparent_66%)] lg:bg-[linear-gradient(100deg,#07060f_12%,rgb(7_6_15/0.18)_32%,transparent_52%)]"
      />

      {/* --- text --- */}
      <div className="relative z-10 mx-auto w-full max-w-[82rem] px-5 pb-20 pt-36 sm:px-8 sm:pt-44 lg:pb-24 lg:pt-52">
        <div className="max-w-[34rem] lg:max-w-[38rem]">
          <h1 className="text-[var(--lp-ink)] drop-shadow-[0_2px_24px_rgb(7_6_15/0.9)]">
            <span className="block text-[clamp(2.9rem,7vw,5.6rem)]">Přestaňte</span>
            <span className="block text-[clamp(2.9rem,7vw,5.6rem)]">dělat rutinu</span>
            <span className="mt-3 block text-[clamp(1.75rem,4.1vw,3.3rem)]">
              Nechte to <span className="text-[var(--lp-pink)]">makat samo</span>
            </span>
          </h1>

          {/* Jeden řádek: text-nowrap drží větu pohromadě, velikost se tomu přizpůsobí. */}
          <p className="mt-7 whitespace-nowrap text-[clamp(0.95rem,1.45vw,1.3rem)] leading-[1.45] text-white/80">
            Automatizace šetří čas, peníze a nervy.
          </p>

          <PillButton to="/ukazky" size="lg" className="mt-9">
            Prohlédnout ukázky
          </PillButton>
        </div>
      </div>
    </section>
  )
}
