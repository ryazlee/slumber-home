import { useEffect, useState } from 'react';
import { homeScreenshots } from '../content/homeScreenshots';

const CYCLE_MS = 4200;

export default function HomeHeroPhone() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = homeScreenshots[index] ?? homeScreenshots[0];

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return undefined;

    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches || paused) return undefined;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % homeScreenshots.length);
    }, CYCLE_MS);

    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div
      className="home-hero-phone"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="home-phone"
        role="group"
        aria-roledescription="carousel"
        aria-label="App screenshots"
        aria-live="polite"
      >
        {homeScreenshots.map((shot, i) => (
          <img
            key={shot.src}
            className={i === index ? 'is-active' : undefined}
            src={shot.src}
            alt={i === index ? shot.alt : ''}
            aria-hidden={i !== index}
            width={432}
            height={914}
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'low'}
            sizes="(min-width: 960px) 360px, (min-width: 560px) 260px, 220px"
          />
        ))}
      </div>

      <p className="home-phone-caption" aria-hidden="true">
        {active.caption}
      </p>

      <div className="home-phone-dots" role="tablist" aria-label="Choose screenshot">
        {homeScreenshots.map((shot, i) => (
          <button
            key={shot.caption}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={shot.caption}
            className={`home-phone-dot${i === index ? ' is-active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
