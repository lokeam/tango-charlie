"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  AnimatePresence,
  motion,
} from "motion/react";

// Components
import { Container } from "@/components/container";
import { ChartToggle } from '@/components/chart-toggle';

// Icons
import LogoIcon from "@/components/ui/icons/LogoIcon";
import CloseIcon from "@/components/ui/icons/CloseIcon";
import MenuIcon from "@/components/ui/icons/MenuIcon";
import GithubIcon from "@/components/ui/icons/GithubIcon";


const navMenuItems = [
  // {
  //   title: "Three.js Demos",
  //   href: "/demos/threejs"
  // },
  {
    title: "Charts",
    href: "/demos/chart"
  }
];

// Mobile Navigation
const MobileNav = ({ items }: { items: { title: string; href: string }[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-between p-2 md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <LogoIcon className="size-6"/>
      </Link>

      {/*  */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="shadow-aceternity flex size-6 flex-col items-center justify-center rounded-md"
        aria-label="Toggle menu"
      >
        <MenuIcon className="size-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-60 h-full w-full bg-neutral-900 shadow-lg"
          >
            <div className="absolute right-4 bottom-4">
              <ChartToggle />
            </div>

            <div className="flex items-center justify-between p-2">
              <LogoIcon className="size-6"/>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="shadow-aceternity flex size-6 flex-col items-center justify-center rounded-md"
                aria-label="Toggle menu"
              >
                <CloseIcon className="size-4 shrink-0 text-gray-600" />
              </button>
            </div>
            <div className="divide-divide border-divide mt-6 flex flex-col divide-y border-t">
              {items.map((item, index) => (
                <Link
                  href={item.href}
                  key={item.title}
                  className="px-4 py-2 font-medium text-gray-300 transition duration-200 hover:text-white dark:text-gray-300 dark:hover:text-neutral-300"
                  onClick={() => setIsOpen(false)}
                >
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    {item.title}
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

};


// Desktop Navigation
const DesktopNav = ({
  items,
}: {
  items: { title: string; href: string }[];
}) => {
  return (
    <div className="hidden items-center justify-between px-4 py-4 md:flex">
      {/* Site Logo */}
      <Link href="/" className="flex items-center gap-2">
        <LogoIcon className="size-10"/>
      </Link>

      <div className="flex items-center gap-10">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-2">
            <Link
              className="flex items-center gap-2 font-medium text-gray-300 transition duration-200 hover:text-white dark:text-gray-300 dark:hover:text-neutral-300"
              href={item.href}
              key={item.title}
            >
              <ChartToggle />
              {item.title}
            </Link>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Link href="https://github.com/lokeam/tango-charlie" target="_blank">
          <GithubIcon className="size-6" />
        </Link>
      </div>
    </div>
  );
};

// Main Navigation
export const NavBar = () => {
  return (
    <Container as="nav" className="">
      <DesktopNav items={navMenuItems} />
      <MobileNav items={navMenuItems} />
    </Container>
  );
}
