import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.homePage}>
      <section className={styles.homeHero} aria-label="Daniel Rajakumar photography">
        <Image
          src="/photos/001 - 2026-05-18 - InterVarsitys Basilia 2026/edited.jpg"
          alt="Billiards room photographed on an iPhone"
          fill
          priority
          sizes="100vw"
          className={styles.homeHeroImage}
        />
        <div className={styles.homeHeroOverlay} />

        <div className={styles.homeHeroContent}>
          <p className={styles.homeEyebrow}>Phone Photography</p>
          <h1 className={styles.homeTitle}>Daniel Rajakumar</h1>
          <p className={styles.homeDescription}>
            A personal gallery of iPhone photos edited in Lightroom, with original
            comparisons for the shots that started on the camera roll.
          </p>
          <Link href="/photos" className={styles.homeCta}>
            View Photos
          </Link>
        </div>
      </section>
    </div>
  );
}
