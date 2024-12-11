import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoggedOutLandingPage() {

  console.log("hit")
  return (
    <div className="bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 min-h-screen flex items-center justify-center p-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4"
        >
          <Image
            src="/assets/images/company-logo.png"
            alt="Company Logo"
            width={200}
            height={200}
            className="mx-auto"
          />
        </motion.div>
        <h2 className="text-6xl font-extrabold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-gray-700">
            Welcome to
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 via-indigo-600 to-blue-600">
            Company-GPT
          </span>
        </h2>
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-700 text-white rounded-full text-lg font-semibold shadow-lg hover:bg-blue-800 transition-colors"
            >
              Login
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}