import { motion } from "framer-motion";
import Link from "next/link";

export default function Breadcrumb({ items }) {
  return (
    <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, idx) => (
          <motion.li
            key={item.href || item.label}
            className="flex items-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
          >
            {idx !== 0 && <span className="mx-1">&rarr;</span>}
            {idx < items.length - 1 ? (
              <Link href={item.href} className="hover:underline text-blue-600">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-gray-700">{item.label}</span>
            )}
          </motion.li>
        ))}
      </ol>
    </nav>
  );
} 