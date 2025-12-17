"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBackgroundStore, BackgroundType } from "@/store/backgroundStore";

interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className="relative text-white/80 hover:text-white transition-colors duration-300 text-sm uppercase tracking-wider font-medium group"
  >
    {label}
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full" />
  </Link>
);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { backgroundType, setBackgroundType } = useBackgroundStore();

  const navLinks: NavLinkProps[] = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/configurator", label: "3D Configurator" },
    { href: "/web3", label: "Web3" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  const backgroundOptions: { type: BackgroundType; label: string; icon: string }[] = [
    { type: "particles", label: "Particles", icon: "✨" },
    { type: "waves", label: "Waves", icon: "🌊" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md border-b border-white/10" />
      
      <nav className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Portfolio
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </div>

          {/* Background Switcher - Desktop (only on home page) */}
          {isHomePage && (
            <div className="hidden md:flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                {backgroundOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setBackgroundType(option.type)}
                    className={`px-2 py-1 rounded-full text-xs transition-all duration-300 ${
                      backgroundType === option.type
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-white/60 hover:text-white/80"
                    }`}
                    title={option.label}
                    aria-label={`Switch to ${option.label} background`}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/contact"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
            >
              Let&apos;s Talk
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col items-center justify-center w-6 h-6">
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-1" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-white my-1 transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-lg border-b border-white/10 transition-all duration-300 overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} onClick={closeMenu} />
            ))}
            
            {/* Background Switcher - Mobile (only on home page) */}
            {isHomePage && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Background</p>
                <div className="flex items-center space-x-2">
                  {backgroundOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => {
                        setBackgroundType(option.type);
                        closeMenu();
                      }}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                        backgroundType === option.type
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "text-white/60 hover:text-white/80 border border-white/10"
                      }`}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/contact"
              onClick={closeMenu}
              className="mt-4 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-full text-center hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              Let&apos;s Talk
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
