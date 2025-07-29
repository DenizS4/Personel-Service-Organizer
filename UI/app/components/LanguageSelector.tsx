"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "../contexts/LanguageContext"

const languages = [
  { code: "en", name: "English", flag: "https://flagcdn.com/w40/us.png" },
  { code: "es", name: "Español", flag: "https://flagcdn.com/w40/es.png" },
  { code: "de", name: "Deutsch", flag: "https://flagcdn.com/w40/de.png" },
  { code: "fr", name: "Français", flag: "https://flagcdn.com/w40/fr.png" },
  { code: "tr", name: "Türkçe", flag: "https://flagcdn.com/w40/tr.png" },
]

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find((lang) => lang.code === language) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Select language"
      >
        <span className="text-lg" role="img" aria-label={currentLang.name}>
          <img src={currentLang.flag} alt={currentLang.name} className="w-5 h-4 object-cover" />
        </span>
        <span className="text-sm font-medium hidden sm:block">{currentLang.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 transition-colors ${
                language === lang.code ? "bg-blue-50 text-blue-700" : "text-gray-700"
              }`}
            >
              <span className="text-lg" role="img" aria-label={lang.name}>
                <img src={lang.flag} alt={lang.name} className="w-5 h-4 object-cover" />
              </span>
              <span className="flex-1">{lang.name}</span>
              {language === lang.code && (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
