import { Link } from 'react-router-dom';
import HomeHypnogram from '../components/HomeHypnogram';
import HomeScreenshots from '../components/HomeScreenshots';
import { StoreBadgePair } from '../components/StoreBadges';
import { useAuth } from '../context/AuthContext';
import '../styles/home.css';

const base = import.meta.env.BASE_URL;

export default function Home() {
  const { session } = useAuth();
  const isLoggedIn = Boolean(session);

  return (
    <div className="home-marketing">
      <section className="home-hero" aria-labelledby="home-headline">
        <div className="home-hero-glow" aria-hidden="true" />
        <div className="home-hero-inner content-wrap">
          <div className="home-hero-copy">
            <div className="home-brand-lockup">
              <img
                className="home-app-icon"
                src={`${base}icon-512.png`}
                alt=""
                width={72}
                height={72}
                decoding="async"
              />
              <p className="home-brand">Slumber</p>
            </div>
            <h1 id="home-headline">Sleep socially, together.</h1>
            <p className="home-lead">
              Your sleep score isn&apos;t enough. Post last night from your wearable
              and see how friends actually slept.
            </p>
            <p className="home-platforms">Free on iOS and Android</p>

            <div className="home-hero-actions">
              {isLoggedIn ? (
                <>
                  <Link to="/feed" className="home-cta home-cta--primary">
                    Open feed
                  </Link>
                  <StoreBadgePair muted />
                </>
              ) : (
                <>
                  <StoreBadgePair />
                  <p className="home-login-prompt">
                    Already have an account?{' '}
                    <Link to="/login" className="home-login-link">
                      Log in on the web
                    </Link>
                  </p>
                </>
              )}
            </div>

            <HomeHypnogram />
          </div>

          <div className="home-hero-visual">
            <div className="home-phone">
              <img
                src={`${base}screenshots/feed.png`}
                alt="Slumber feed with friends' sleep posts and hypnograms"
                width={428}
                height={926}
                decoding="async"
                fetchPriority="high"
                sizes="(min-width: 960px) 360px, (min-width: 560px) 260px, 220px"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="home-body content-wrap">
        <section className="home-steps" aria-labelledby="home-steps-title">
          <h2 id="home-steps-title">How mornings go</h2>
          <ol className="home-steps-list">
            <li>
              <span className="home-step-num">1</span>
              <div>
                <h3>Last night shows up</h3>
                <p>
                  Slumber reads Apple Health, Health Connect, or Google Health, so Watch,
                  Oura, Garmin, Whoop, Fitbit, Pixel Watch, and friends already sync.
                </p>
              </div>
            </li>
            <li>
              <span className="home-step-num">2</span>
              <div>
                <h3>Add a little context</h3>
                <p>
                  How you felt, a note, a dream, or who you slept near. Or turn on
                  auto-publish and skip it.
                </p>
              </div>
            </li>
            <li>
              <span className="home-step-num">3</span>
              <div>
                <h3>Friends see the real night</h3>
                <p>
                  Stages, bed and wake times, optional vibes. Compare side by side when you want
                  a baseline that isn&apos;t a random population average — including from a
                  friend&apos;s profile.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <HomeScreenshots />

        <section className="home-essentials" aria-labelledby="home-essentials-title">
          <h2 id="home-essentials-title">What you get</h2>
          <ul className="home-essentials-list">
            <li>
              <strong>Feed</strong>
              See friends&apos; nights as they land: hypnograms, bed and wake times,
              optional vibes, dream logs, PR badges with margins, wearables, and comments
              in one place.
            </li>
            <li>
              <strong>Compare</strong>
              Put your sleep next to theirs for a day, a week, a month, or forever —
              open Compare from their profile once you&apos;re friends. Stages, timing,
              and averages side by side instead of a random population score.
            </li>
            <li>
              <strong>Challenges &amp; clubs</strong>
              Race for most sleep logged, or spin up a club for roommates, a team,
              or whoever you actually want in one room.
            </li>
            <li>
              <strong>Privacy</strong>
              Mutual friends only by default. Keep posts private, blur dreams,
              choose which PR chips friends see, and report or block when someone
              shouldn&apos;t be there.
            </li>
          </ul>
        </section>

        <section className="home-closing" aria-labelledby="home-closing-title">
          <div className="home-closing-panel">
            {isLoggedIn ? (
              <>
                <h2 id="home-closing-title">Back to your feed</h2>
                <Link to="/feed" className="home-cta home-cta--primary home-closing-primary">
                  Open feed
                </Link>
              </>
            ) : (
              <>
                <h2 id="home-closing-title">Get Slumber</h2>
                <StoreBadgePair className="home-closing-stores" />
                <p className="home-login-prompt">
                  Already have an account?{' '}
                  <Link to="/login" className="home-login-link">
                    Log in on the web
                  </Link>
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
