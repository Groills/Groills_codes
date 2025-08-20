"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [text, setText] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(text);
  };

  const clearSearch = () => {
    setText("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <SearchIcon className="h-5 w-5 cursor-pointer" />
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="block w-full py-3 pl-10 pr-10 text-sm bg-white/90 dark:bg-gray-800/90 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200"
          placeholder="Search videos..."
          aria-label="Search"
        />

        {text && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm font-medium shadow-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Search
            </motion.button>
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
