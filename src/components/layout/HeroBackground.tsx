export function HeroBackground() {
  return (
    <div className="hero-bg absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Фото: козаки, пшеница, флаг, закатное небо */}
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] hover:scale-110"
        style={{ backgroundImage: "url(/images/hero-cossacks-bg.jpg)" }}
      />

      {/* Тёплый свет заката */}
      <div className="hero-sun absolute -right-10 top-0 h-96 w-96 rounded-full bg-gradient-radial from-amber-300/30 via-orange-400/10 to-transparent blur-3xl" />
      <div className="hero-sun-rays absolute right-0 top-0 h-full w-2/3 opacity-40" />

      {/* Развевающийся флаг — правый верх */}
      <svg
        className="hero-flag-pole absolute right-6 top-12 h-28 w-20 opacity-90 md:right-12 md:top-16 md:h-36 md:w-28"
        viewBox="0 0 120 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="8" y="0" width="5" height="160" fill="#5c3d1e" rx="1" />
        <circle cx="10" cy="4" r="6" fill="#ffd700" opacity="0.8" />
        <g className="hero-flag-cloth">
          <rect x="13" y="8" width="105" height="52" fill="#0057b7" rx="1" />
          <rect x="13" y="60" width="105" height="52" fill="#ffd700" rx="1" />
        </g>
      </svg>
    </div>
  );
}
