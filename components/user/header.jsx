"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "@/components/auth/UserLoginModal";
import { NAV_LINKS } from "@/constants/index";

export default function Header({ type = "user" }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const copyEmailTimeout = useRef(null);
  const copyPhoneTimeout = useRef(null);
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const { user, logout } = useAuth(type);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    window.location.reload();
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    window.location.reload();
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText("+91 9898033224");
    setCopiedPhone(true);
    if (copyPhoneTimeout.current) clearTimeout(copyPhoneTimeout.current);
    copyPhoneTimeout.current = setTimeout(() => setCopiedPhone(false), 500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("support@yatrabiz.in");
    setCopiedEmail(true);
    if (copyEmailTimeout.current) clearTimeout(copyEmailTimeout.current);
    copyEmailTimeout.current = setTimeout(() => setCopiedEmail(false), 500);
  };

  return (
    <>
      {pathname === "/" && (
        <div className="w-full flex items-center justify-between px-6 py-1 bg-background text-gray-200 text-sm">
          <button
            onClick={handleCopyEmail}
            className="group text-gray-300 transition-colors underline-offset-2 bg-transparent border-none cursor-pointer focus:outline-none"
            title="Click to copy email address"
            style={{ textDecoration: "none" }}
          >
            <span className="inline-flex items-center border-b-2 border-transparent group-hover:border-white transition-colors">
              <EnvelopeIcon className="h-4 w-4 mr-1" />
              support@yatrabiz.in
              {copiedEmail && (
                <span className="text-xs text-gray-400 ml-2">Copied!</span>
              )}
            </span>
          </button>

          <div className="flex items-center gap-2">
            {copiedPhone && (
              <span className="text-xs text-gray-400 ml-1">Copied!</span>
            )}
            {showWhatsapp ? (
              <FaWhatsapp
                className="w-5 h-4 text-green-300 cursor-pointer"
                onClick={() => setShowWhatsapp(false)}
                title="Show phone number"
              />
            ) : (
              <PhoneIcon
                className="w-4 h-4 text-gray-300 cursor-pointer"
                onClick={() => setShowWhatsapp(true)}
                title="Show WhatsApp link"
              />
            )}

            {showWhatsapp ? (
              <a
                href={process.env.NEXT_PUBLIC_CONTACT_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 hover:text-green-500 transition-colors hover:underline"
                title="Chat on WhatsApp"
              >
                +91 9898033224
              </a>
            ) : (
              <button
                onClick={handleCopyPhone}
                className="text-gray-300 hover:text-white bg-transparent border-none cursor-pointer transition-colors hover:underline"
                title="Click to copy phone number"
              >
                +91 9898033224
              </button>
            )}
          </div>
        </div>
      )}

      {pathname === "/" && <div className="w-full border-t border-gray-300" />}

      <header className="relative w-full flex items-center justify-between px-6 py-3 bg-background h-16">
        <div className="flex items-center gap-2 flex-shrink-0 -ml-14 -mt-5">
          <Link href="/">
            <Image
              src="/Logo7.png"
              alt="YatraBiz Logo"
              width={192}
              height={64}
              className="object-contain h-10 w-28 md:h-14 md:w-40 lg:h-16 lg:w-48"
              priority
            />
          </Link>
        </div>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-white absolute left-1/2 -translate-x-1/2 flex-shrink-0">
          {user &&
            NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative focus:outline-none transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full ${
                    isActive ? "after:w-full" : "after:w-0"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
        </nav>

        <button
          className="sm:hidden flex items-center justify-center p-2 rounded-md text-white focus:outline-none"
          aria-label="Open navigation menu"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? (
            <XMarkIcon className="h-7 w-7" />
          ) : (
            <Bars3Icon className="h-7 w-7" />
          )}
        </button>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" title={user.name || user.email}>
                <span className="text-white text-sm cursor-pointer">
                  Welcome, {user.name || user.email}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-white transition-colors bg-transparent logout-hover"
                aria-label="Logout"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-8 w-8 text-inherit" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-white text-blue-900 hover:bg-blue-50 transition-colors"
              aria-label="Login"
            >
              <UserIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {mobileNavOpen && user && (
        <nav className="sm:hidden absolute top-16 left-0 w-full bg-background z-50 shadow-md animate-fade-in">
          <ul className="flex flex-col items-center gap-4 py-4">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-2 text-white text-base rounded transition-colors ${
                      isActive ? "bg-blue-900/80" : "hover:bg-blue-900/40"
                    }`}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
