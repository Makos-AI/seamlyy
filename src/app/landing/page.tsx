'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import './landing.css';

const GATE_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80',
    action: 'draw',
    verb: 'get',
  },
  {
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1920&q=80',
    action: 'paint',
    verb: 'feel',
  },
  {
    image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1920&q=80',
    action: 'sculpt',
    verb: 'see',
  },
];

const STAGE_CARDS = [
  { num: '01', title: 'The First Mark', feeling: 'Courage', img: 'https://images.unsplash.com/photo-1596548438137-d51ea5c83ca5?w=600&q=80' },
  { num: '02', title: 'The Rough Shape', feeling: 'Searching', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80' },
  { num: '03', title: 'The Layering', feeling: 'Commitment', img: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80' },
  { num: '04', title: 'The Doubt', feeling: '"Is this even good?"', img: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80' },
  { num: '05', title: 'The Refinement', feeling: 'Precision', img: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=600&q=80' },
  { num: '06', title: 'The Last Stroke', feeling: 'Release', img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80' },
];

const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80', title: 'Echoes of Form' },
  { src: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=600&q=80', title: 'Spirit & Clay' },
  { src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80', title: 'The Bold Eye' },
  { src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', title: 'Abstract Horizons' },
  { src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80', title: 'Sunlit Canvas' },
  { src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80', title: 'Neon Pulse' },
];

export default function LandingPage() {
  const [gateOpen, setGateOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Gate background & text rotation
  useEffect(() => {
    if (gateOpen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % GATE_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [gateOpen]);

  // Scroll-driven fade-in observer
  const setupObserver = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add('animate--visible');
            // Add specific visible modifiers
            if (el.classList.contains('spark__line')) el.classList.add('spark__line--visible');
            if (el.classList.contains('weight__line')) el.classList.add('weight__line--visible');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!gateOpen) return;
    // Small delay so exhibition is rendered before observing
    const timer = setTimeout(setupObserver, 100);
    return () => clearTimeout(timer);
  }, [gateOpen, setupObserver]);

  const handleApprove = () => {
    setGateOpen(true);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="landing-root">
      {/* =============================================
          LAYER 1: THE GATE 
          ============================================= */}
      <div className={`gate ${gateOpen ? 'gate--hidden' : ''}`}>
        {/* Rotating backgrounds */}
        <div className="gate__bg">
          {GATE_SLIDES.map((slide, i) => (
            <img
              key={i}
              src={slide.image}
              alt=""
              className={`gate__bg-img ${i === currentSlide ? 'gate__bg-img--active' : ''}`}
            />
          ))}
        </div>
        <div className="gate__overlay" />
        <div className="gate__grain" />

        {/* Manifesto */}
        <div className="gate__content">
          <div className="gate__manifesto-wrap">
            {GATE_SLIDES.map((slide, i) => (
              <h1
                key={i}
                className={`gate__manifesto ${i === currentSlide ? 'gate__manifesto--active' : ''}`}
              >
                You can <em className="gate__word--italic">{slide.action}</em>?{' '}
                We <em className="gate__word--italic">{slide.verb}</em> you.
              </h1>
            ))}
          </div>

          <div className="gate__invite">
            <p className="gate__invite-text">Let us take you to a space made for you.</p>
            <button className="gate__btn" onClick={handleApprove}>
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* =============================================
          LAYER 2: THE EXHIBITION
          ============================================= */}
      <div className={`exhibition ${gateOpen ? 'exhibition--visible' : ''}`}>

        {/* --- SECTION 1: THE SPARK --- */}
        <section className="section section--spark">
          <div
            className="spark__visual"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80)' }}
          />
          <div className="section__inner">
            <h2 className="section__title" data-animate>
              It starts with a feeling.
              <span className="section__title-echo">feeling.</span>
            </h2>
            <div className="spark__text">
              <p className="spark__line" data-animate>A color you saw on the way home.</p>
              <p className="spark__line" data-animate>A face you can&apos;t forget.</p>
              <p className="spark__line" data-animate>A feeling that won&apos;t leave you alone.</p>
              <p className="spark__line" data-animate>
                Before the brush touches canvas — before the pencil finds paper — there&apos;s a moment.
              </p>
              <p className="spark__line spark__line--final" data-animate>And you know.</p>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: THE PROCESS --- */}
        <section className="section section--process">
          <div className="section__inner">
            <h2 className="section__title" data-animate>
              Made by hand.
              <span className="section__title-echo">hand.</span>
            </h2>
            <div className="process__timeline">
              {STAGE_CARDS.map((card, i) => (
                <div className="stage" key={i} data-animate>
                  <div
                    className="stage__image"
                    style={{ backgroundImage: `url(${card.img})` }}
                  />
                  <div className="stage__overlay">
                    <span className="stage__number">{card.num}</span>
                    <h3 className="stage__title">{card.title}</h3>
                    <p className="stage__feeling">{card.feeling}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECTION 3: THE WEIGHT --- */}
        <section className="section section--weight">
          <div className="section__inner section__inner--split">
            <div className="weight__lines">
              <h2 className="section__title" data-animate>
                What it means to be an artist.
                <span className="section__title-echo">artist.</span>
              </h2>
              <p className="weight__line" data-animate>The hours no one sees.</p>
              <p className="weight__line" data-animate>The versions no one knows about.</p>
              <p className="weight__line" data-animate>The work that pays in meaning before it pays in money.</p>
              <p className="weight__line" data-animate>You chose this. Not because it was easy.</p>
              <p className="weight__line" data-animate>Because you couldn&apos;t not.</p>
              <p className="weight__line" data-animate>The world needs what you make. Even when it forgets to say so.</p>
            </div>
            <div className="weight__portrait-wrap" data-animate>
              <img
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80"
                alt="Artist at work"
                className="weight__portrait"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* --- SECTION 4: YOUR DAILY COMPANION --- */}
        <section className="section section--companion">
          <div className="section__inner">
            <h2 className="section__title" data-animate>
              Part of your day.
              <span className="section__title-echo">day.</span>
            </h2>
            <p className="companion__text" data-animate>
              You&apos;ve done the hardest part. You made the art.<br />
              Now let us take it from here.
            </p>
            <div className="companion__flow" data-animate>
              <span className="companion__step">Wake up.</span>
              <span className="companion__step">Create.</span>
              <span className="companion__step">Share.</span>
              <span className="companion__step">Someone across the world falls in love with it.</span>
              <span className="companion__step companion__step--last">You get paid before your coffee gets cold.</span>
            </div>
          </div>
        </section>

        {/* --- SECTION 5: THREE SHIELDS --- */}
        <section className="section section--shields">
          <div className="section__inner">
            <h2 className="section__title" data-animate>
              Protected by design.
              <span className="section__title-echo">design.</span>
            </h2>
            <div className="shields__stack">
              <div className="shield" data-animate>
                <div className="shield__icon">🛡️</div>
                <h3 className="shield__name">Your Mark</h3>
                <p className="shield__desc">
                  Every piece carries your invisible signature. A mark only we can see, embedded in every pixel.
                </p>
              </div>
              <div className="shield" data-animate>
                <div className="shield__icon">🛡️</div>
                <h3 className="shield__name">Your Identity</h3>
                <p className="shield__desc">
                  We verify it&apos;s really you, every time. Your creative fingerprint, locked and authenticated.
                </p>
              </div>
              <div className="shield" data-animate>
                <div className="shield__icon">🛡️</div>
                <h3 className="shield__name">Your Wall</h3>
                <p className="shield__desc">
                  No one can copy, screenshot, or steal what&apos;s yours. Your art stays yours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 6: THE GALLERIES --- */}
        <section className="section section--galleries">
          <div className="section__inner">
            <h2 className="section__title" data-animate>
              Your own exhibition.
              <span className="section__title-echo">exhibition.</span>
            </h2>
            <p className="companion__text" data-animate>
              Curate your own exhibition. Set your own price. Open the doors whenever you&apos;re ready.
            </p>
            <div className="gallery-grid">
              {GALLERY_IMAGES.map((item, i) => (
                <div className="gallery-card" key={i} data-animate>
                  <img
                    src={item.src}
                    alt={item.title}
                    className="gallery-card__image"
                    loading="lazy"
                  />
                  <div className="gallery-card__overlay">
                    <span>{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECTION 7: DAVID CARSON --- */}
        <section className="section section--carson">
          <div className="carson__noise" />
          {/* Gold stripe cutting across */}
          <div className="carson__stripe" style={{ top: '25%', left: '-5%' }} />
          <div className="carson__stripe carson__stripe--blue" style={{ top: '65%', left: '-5%' }} />

          {/* Text fragments — deliberately chaotic */}
          <span className="carson__fragment carson__fragment--serif carson__fragment--bold" style={{ top: '8%', left: '5%', fontSize: 'clamp(5rem, 12vw, 10rem)', color: '#fff' }}>
            ART
          </span>
          <span className="carson__fragment carson__fragment--sans" style={{ top: '20%', right: '10%', fontSize: '1.2rem', transform: 'rotate(-3deg)', opacity: 0.7 }}>
            doesn&apos;t follow rules
          </span>
          <span className="carson__fragment carson__fragment--sans carson__fragment--bold" style={{ top: '35%', left: '30%', fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '0.1em' }}>
            NEITHER
          </span>
          <span className="carson__fragment carson__fragment--serif carson__fragment--italic carson__fragment--light" style={{ top: '38%', right: '15%', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            do we.
          </span>
          <span className="carson__fragment carson__fragment--sans carson__fragment--bold" style={{ top: '10%', right: '5%', fontSize: 'clamp(8rem, 20vw, 16rem)', opacity: 0.04, lineHeight: 1 }}>
            CREATE
          </span>
          <span className="carson__fragment carson__fragment--sans" style={{ bottom: '30%', left: '8%', fontSize: '1.5rem', transform: 'rotate(90deg)', transformOrigin: 'left bottom' }}>
            break
          </span>
          <span className="carson__fragment carson__fragment--sans carson__fragment--bold" style={{ bottom: '20%', right: '20%', fontSize: '2rem', textDecoration: 'underline', textDecorationColor: '#D9A441' }}>
            EVERY
          </span>
          <span className="carson__fragment carson__fragment--serif carson__fragment--italic" style={{ bottom: '12%', left: '25%', fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'rgba(255,255,255,0.6)' }}>
            boundary
          </span>

          {/* Quotes scattered */}
          <p className="carson__quote" style={{ top: '50%', left: '5%', fontSize: 'clamp(0.9rem, 2vw, 1.3rem)', maxWidth: '35%', transform: 'rotate(-2deg)', opacity: 0.6 }}>
            &ldquo;Every child is an artist. The problem is how to remain an artist once we grow up.&rdquo;
            <span className="carson__quote-author">— Picasso</span>
          </p>
          <p className="carson__quote" style={{ top: '15%', right: '3%', fontSize: 'clamp(0.85rem, 1.8vw, 1.1rem)', maxWidth: '30%', transform: 'rotate(4deg)', opacity: 0.5 }}>
            &ldquo;I don&apos;t paint dreams or nightmares, I paint my own reality.&rdquo;
            <span className="carson__quote-author">— Frida Kahlo</span>
          </p>
          <p className="carson__quote" style={{ bottom: '8%', right: '10%', fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', maxWidth: '28%', transform: 'rotate(-5deg)', opacity: 0.4 }}>
            &ldquo;Art is not what you see, but what you make others see.&rdquo;
            <span className="carson__quote-author">— Edgar Degas</span>
          </p>

          {/* Images scattered and overlapping */}
          <img
            src="https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=400&q=80"
            alt=""
            className="carson__image"
            style={{ top: '40%', left: '55%', width: '25%', transform: 'rotate(5deg)' }}
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=400&q=80"
            alt=""
            className="carson__image carson__torn"
            style={{ top: '55%', left: '10%', width: '22%', transform: 'rotate(-8deg)', filter: 'grayscale(100%)' }}
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&q=80"
            alt=""
            className="carson__image"
            style={{ top: '5%', left: '45%', width: '18%', transform: 'rotate(12deg)' }}
            loading="lazy"
          />
        </section>

        {/* --- SECTION 8: THE CLOSE --- */}
        <section className="section section--close">
          <div className="close__inner" data-animate>
            <h2 className="close__brand">Seamlyy</h2>
            <p className="close__message">Art deserves better. So do you.</p>
            <Link href="/explore" className="close__btn">
              Get <em>Seamlyy</em>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
