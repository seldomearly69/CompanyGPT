"use client";

import Link from "next/link";
import { UserAuthForm } from "@/components/user-auth-form";
import { motion } from "framer-motion";
import { Suspense } from "react";

export const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.02 * i },
  }),
};

export const child = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 150,
    },
  },
  hidden: {
    opacity: 0,
    x: 10,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 150,
    },
  },
};

export const fastChild = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 250,
    },
  },
  hidden: {
    opacity: 0,
    x: 10,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 250,
    },
  },
};

export default function LoginPage() {

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 px-4 md:px-0">
      <div className="flex-grow flex items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[340px] sm:max-w-[500px] md:max-w-[600px] space-y-6 sm:space-y-8"
          >
            <div className="flex flex-col space-y-4 sm:space-y-6 text-center">
              <Link href="/" className="mx-auto">
                <motion.img
                  whileHover={{ scale: 1.03 }}
                  src="/assets/images/company-logo.png"
                  alt="Company Logo"
                  width={140}
                  height={140}
                  className="cursor-pointer p-0 m-0"
                />
              </Link>
              <motion.h1
                variants={container}
                initial="hidden"
                animate="visible"
                className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-light"
              >
                {Array.from("Welcome back").map((letter, index) => (
                  <motion.span key={index} variants={child}>
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </motion.h1>
              <motion.p
                variants={container}
                initial="hidden"
                animate="visible"
                className="text-md sm:text-lg md:text-xl text-muted-foreground"
              >
                {Array.from("Enter your email to sign in to your account").map(
                  (letter, index) => (
                    <motion.span key={index} variants={fastChild}>
                      {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                  )
                )}
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="scale-100 sm:scale-105"
            >
              <UserAuthForm />
            </motion.div>
          </motion.div>
        </Suspense>
      </div>
    </div>
  );
}