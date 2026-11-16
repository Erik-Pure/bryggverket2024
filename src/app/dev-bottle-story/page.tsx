"use client";

/**
 * Temporary scroll stage preview for the spirit bottle. Remove after review.
 */
import BeerStage from "../components/beer/BeerStage";
import styles from "../components/beer/beer.module.scss";

export default function DevBottleStoryPage() {
  return (
    <article
      className={styles.beer}
      style={
        {
          "--beer-bg": "#d9c4a0",
          "--beer-ink": "#101011",
          "--beer-ink-soft": "rgba(16,16,17,0.78)",
          "--beer-ink-faint": "rgba(16,16,17,0.56)",
          "--beer-line": "rgba(16,16,17,0.22)",
          "--card-bg": "#101011",
          "--card-ink": "#ffffff",
          "--card-ink-soft": "rgba(255,255,255,0.68)",
          "--card-line": "rgba(255,255,255,0.16)",
          "--title-measure": 10,
        } as React.CSSProperties
      }
    >
      <div className={styles.track} data-beer-track>
        <BeerStage
          canType="bottle"
          canSize="bottle"
          canColor="clear"
          labelUrl="/images/dev-baverhojt-label.jpg"
          labelAspect={1.85}
          labelFront={0.45}
          bg="#d9c4a0"
          glow="#efe2c6"
          ink="#101011"
          isDark={false}
          fontFamily="inherit"
        />
        <div className={styles.chapters}>
          <section className={styles.hero} data-chapter="hero">
            <div className={styles.heroInner}>
              <div className={styles.heroText} data-hero-copy>
                <p className={styles.tag}>Spritdryck</p>
                <h1 className={styles.title}>Bäverhojt</h1>
                <ul className={styles.heroMeta}>
                  <li>Sprit</li>
                  <li>32 % vol</li>
                  <li>50 cl</li>
                </ul>
              </div>
            </div>
          </section>
          <section className={styles.chapter} data-chapter="story">
            <div className={styles.inner}>
              <div className={`${styles.column} ${styles.columnStart}`}>
                <p className={styles.kicker}>
                  <span className={styles.kickerIndex}>01</span>
                  <span className={styles.kickerRule} />
                  Beskrivning
                </p>
                <div className={styles.prose}>
                  <p>
                    En klar glasflaska i samma form som Bäverhojt — utan
                    etikett, så du kan se glaset, korken och proportionerna.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className={styles.chapter} data-chapter="facts">
            <div className={styles.inner}>
              <div className={`${styles.column} ${styles.columnEnd}`}>
                <p className={styles.kicker}>
                  <span className={styles.kickerIndex}>02</span>
                  <span className={styles.kickerRule} />
                  Siffrorna
                </p>
                <div className={styles.figure}>
                  <p className={styles.figureValue}>
                    32
                    <span className={styles.figureUnit}>%</span>
                  </p>
                  <p className={styles.figureLabel}>Alkoholhalt, volym</p>
                </div>
              </div>
            </div>
          </section>
          <section
            className={`${styles.chapter} ${styles.summary}`}
            data-chapter="summary"
          >
            <div className={styles.inner}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Bäverhojt</h2>
                <p>50 cl glasflaska · Sprit</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
