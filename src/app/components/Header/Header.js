import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoCircle}></div>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li>Dashboard</li>
          <li>Tasks</li>
          <li>Settings</li>
        </ul>
      </nav>
    </header>
  );
}