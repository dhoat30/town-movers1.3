"use client";

import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { headerLinks } from "@/utils/headerLinks";
import HeaderArrowIcon from "../Icons/HeaderArrowIcon";
import MenuIcon from "../Icons/MenuIcon";
import styles from "./Navbar.module.scss";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(-1);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setOpenSubmenu(-1);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const updateHeaderState = () => {
      setIsScrolled(window.scrollY > 12);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  const closeNavigation = () => {
    setMobileOpen(false);
    setOpenSubmenu(-1);
  };

  return (
    <>
      <AppBar
        component="header"
        position="fixed"
        elevation={0}
        className={`${styles.appBar} ${isScrolled ? styles.appBarScrolled : ""}`}
      >
        <Container maxWidth="xl" className={styles.container}>
          <Toolbar disableGutters className={styles.toolbar}>
            <Link href="/" className={styles.logo} onClick={closeNavigation}>
              <Image
                src="/logo.png"
                width={96}
                height={56}
                alt="Town Movers"
                quality={100}
                priority
              />
            </Link>

            <button
              type="button"
              className={styles.menuButton}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-controls="primary-navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((isOpen) => !isOpen)}
            >
              {mobileOpen ? (
                <CloseRoundedIcon aria-hidden="true" />
              ) : (
                <MenuIcon />
              )}
            </button>

            <nav
              id="primary-navigation"
              aria-label="Primary navigation"
              className={`${styles.navigation} ${mobileOpen ? styles.navigationOpen : ""}`}
            >
              <ul className={styles.menuList}>
                {headerLinks.map((item, index) => {
                  const hasSubLinks = Array.isArray(item.subLinks) && item.subLinks.length > 0;
                  const isOpen = openSubmenu === index;

                  return (
                    <li
                      className={styles.menuItem}
                      key={item.id ?? item.url ?? item.label}
                      onMouseEnter={() => hasSubLinks && setOpenSubmenu(index)}
                      onMouseLeave={() => hasSubLinks && setOpenSubmenu(-1)}
                    >
                      {hasSubLinks ? (
                        <button
                          type="button"
                          className={styles.menuLink}
                          aria-expanded={isOpen}
                          aria-controls={`navigation-submenu-${index}`}
                          onClick={() => setOpenSubmenu(isOpen ? -1 : index)}
                        >
                          {item.label}
                          <HeaderArrowIcon className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`} />
                        </button>
                      ) : (
                        <Link
                          href={item.url}
                          className={styles.menuLink}
                          aria-current={pathname === item.url ? "page" : undefined}
                          onClick={closeNavigation}
                        >
                          {item.label}
                        </Link>
                      )}

                      {hasSubLinks && (
                        <ul
                          id={`navigation-submenu-${index}`}
                          className={`${styles.submenu} ${isOpen ? styles.submenuOpen : ""}`}
                          style={{
                            "--submenu-columns": item.gridTemplateColumn || "1fr",
                            "--submenu-width": item.width || "auto",
                          }}
                        >
                          {item.subLinks.map((subLink) => (
                            <li key={subLink.url ?? subLink.label}>
                              <Link
                                href={subLink.url}
                                className={styles.submenuLink}
                                onClick={closeNavigation}
                              >
                                {subLink.graphic && (
                                  <Image
                                    className={styles.submenuIcon}
                                    src={subLink.graphic}
                                    alt=""
                                    width={48}
                                    height={48}
                                  />
                                )}
                                <span className={styles.submenuLabel}>
                                  <span>{subLink.label}</span>
                                  {subLink.subtitle && <small>{subLink.subtitle}</small>}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              <Link href="/" className={styles.quoteLink} onClick={closeNavigation}>
                <Button size="large" variant="contained" className={styles.quoteButton}>
                  GET FREE QUOTE
                </Button>
              </Link>
            </nav>
          </Toolbar>
        </Container>
      </AppBar>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className={styles.backdrop}
          onClick={closeNavigation}
        />
      )}
    </>
  );
}
