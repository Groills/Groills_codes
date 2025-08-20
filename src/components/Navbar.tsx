"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";

export function GlobalNavbar() {
  const { data: session } = useSession();

  const navName1 = session?.user ? "Dashboard" : "Benefits"
  const navName2 = session?.user ? "My Profile" : "Specifications"
  const navName3 = session?.user ? "Upload New" : "How it works"
  const navItems = [
    {
      name: navName1,
      link: navName1 === "Dashboard" ? "/dashboard" : "#Benefits",
    },
    {
      name: navName2,
      link: navName2 === "Specifications" ? "#Specifications" : "/user/videos",
    },
    {
      name: navName3,
      link: navName3 === "How it works"? "#How-it-works": "/upload-video",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleLogout = () => {
    signOut();
    toast.success("Logged out successfully");
  };
  return (
    <div className="fixed w-full top-0 left-0 z-50 bg-black backdrop-blur-sm">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="secondary" href="#Contact-Us">
              Contact Us
            </NavbarButton>
            {session ? (
              <NavbarButton
                className="py-1 text-lg font-semibold text-white transition-all duration-300 transform bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                variant="primary"
                onClick={handleLogout}
              >
                Logout
              </NavbarButton>
            ) : (
              <NavbarButton
                variant="primary"
                href="/sign-in"
                className="py-1 text-lg font-semibold text-white transition-all duration-300 transform bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
              >
                SignIn
              </NavbarButton>
            )}
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
                href="#Contact-Us"
              >
                Contact Us
              </NavbarButton>
              {session ? (
                <NavbarButton
                  onClick={handleLogout}
                  variant="primary"
                  className="w-full"
                >
                  Logout
                </NavbarButton>
              ) : (
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full"
                  href="/sign-in"
                >
                  SignIn
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
