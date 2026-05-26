import Link from "next/link";
import styles from "./Footer.module.css";

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: "IG" },
  { href: "https://behance.net", label: "Behance", icon: "Be" },
  { href: "https://500px.com", label: "500px", icon: "5C" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>D</span>
          <span className={styles.logoText}>ANIEL</span>
        </div>

        <p className={styles.tagline}>
          Capturing moments that transcend time.
        </p>

        <nav className={styles.footerNav} aria-label="Footer navigation">
          <Link href="/gallery" className={styles.navLink}>Gallery</Link>
          <Link href="/about" className={styles.navLink}>About</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
        </nav>

        <div className={styles.socials} aria-label="Social media links">
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
            >
              {s.icon}
            </a>
          ))}
        </div>

        <div className={styles.copyright}>
          <span>© {new Date().getFullYear()} Daniel Rajakumar Photography</span>
          <span className={styles.dot}>·</span>
          <span>All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
}
