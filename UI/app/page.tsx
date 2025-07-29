"use client"

import Link from "next/link"
import { useState } from "react"
import { useLanguage } from "./contexts/LanguageContext"

export default function HomePage() {
  const { t } = useLanguage()
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [1, 2, 3].map((i) => ({
    title: t(`howItWorks.${i}.title`),
    description: t(`howItWorks.${i}.description`),
    steps: [1, 2, 3, 4].map((j) => t(`howItWorks.${i}.step${j}`)),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <span className="text-6xl mb-4 block">🚌</span>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">{t("home.title")}</h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                {t("home.subtitle")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/cars"
                className="bg-blue-700 hover:bg-blue-800 text-white text-lg px-8 py-4 y-4 rounded-md inline-block text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
              >
                {t("home.manageFleet")}
              </Link>
              <Link
                href="/employees"
                className="bg-gray-600 hover:bg-gray-700 text-white text-lg px-8 py-4 y-4 rounded-md inline-block text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
              >
                {t("home.manageEmployees")}
              </Link>
              <Link
                href="/route-optimization"
                className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-md inline-block text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
              >
                {t("home.optimizeRoutes")}
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-600">Active Vehicles</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="text-2xl font-bold text-green-600">20</div>
                <div className="text-sm text-gray-600">Employees</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-sm text-gray-600">Route Options</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="text-2xl font-bold text-orange-600">GLOBAL</div>
                <div className="text-sm text-gray-600">Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("home.howItWorks")}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("home.howItWorksSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature Tabs */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg cursor-pointer transition-all ${
                    activeFeature === index
                      ? "bg-blue-50 border-2 border-blue-200 shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {index + 1}. {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Feature Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{features[activeFeature].title}</h3>
              <div className="space-y-4">
                {features[activeFeature].steps.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("home.powerfulFeatures")}</h2>
            <p className="text-xl text-gray-600">{t("home.featuresSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {["🚗", "👥", "🗺️", "📊", "📈", "🌍"].map((icon, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-4">{icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{t(`features.${i + 1}.title`)}</h3>
                  <p className="text-gray-600 mb-4">{t(`features.${i + 1}.description`)}</p>
                  <ul className="space-y-2">
                    {[1, 2, 3, 4, 5].map((j) => {
                      const featureKey = `features.${i + 1}.feature${j}`
                      const translated = t(featureKey)
                      return translated !== featureKey ? (
                          <li key={j} className="flex items-center text-sm text-gray-500">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {translated}
                          </li>
                      ) : null
                    })}
                  </ul>
                </div>
            ))}
          </div>
        </div>
      </div>


      {/* Getting Started */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">{t("home.readyToStart")}</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{t("home.startSubtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cars"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-md inline-block font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Start with Fleet Management
            </Link>
            <Link
              href="/employees"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 rounded-md inline-block font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Add Your Employees
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("home.faq")}</h2>
          </div>

          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(`faq.q${i}`)}</h3>
                  <p className="text-gray-600">{t(`faq.a${i}`)}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
