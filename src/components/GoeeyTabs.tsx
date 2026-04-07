import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import GooeySvgFilter from "@/components/fancy/filter/gooey-svg-filter"

const TAB_CONTENT = [
  {
    title: "Web Development",
    description: "High-performance, cinematic web experiences built with Next.js, React, and modern JavaScript frameworks. We create fast, accessible, and visually stunning digital experiences.",
    features: ["Next.js & React", "GSAP Animations", "Responsive Design", "Performance Optimization"]
  },
  {
    title: "Mobile Apps",
    description: "Native-feeling cross-platform applications that don't compromise on design. Built with React Native and Flutter for seamless iOS and Android experiences.",
    features: ["React Native", "Flutter", "iOS & Android", "App Store Deployment"]
  },
  {
    title: "Ecommerce",
    description: "Conversion-optimized digital storefronts for luxury and boutique brands. Full Shopify development and custom checkout experiences that drive sales.",
    features: ["Shopify Plus", "Custom Checkout", "Payment Integration", "Inventory Management"]
  },
  {
    title: "Backend & APIs",
    description: "Robust architecture designed to handle complex data and high traffic. Scalable cloud infrastructure and RESTful API development.",
    features: ["Node.js & Python", "Cloud Infrastructure", "Database Design", "API Integration"]
  },
  {
    title: "Custom AI Chatbots",
    description: "Leverage LLMs to automate customer interaction and provide intelligent support. Custom-trained bots that understand your business.",
    features: ["GPT Integration", "Custom Training", "Multi-platform Support", "Analytics Dashboard"]
  },
  {
    title: "Automations",
    description: "Streamline your business operations with intelligent, connected logic. Workflow automation that saves time and reduces manual errors.",
    features: ["Zapier & Make", "Custom Scripts", "CRM Integration", "Data Processing"]
  },
]

export default function GooeyTabs() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section className="w-full py-32 bg-white px-8 md:px-20">
      <div className="mb-16 max-w-7xl mx-auto">
        <h2 className="text-[10px] font-expanded-medium uppercase tracking-[0.6em] text-black/20 mb-4">
          Capabilities
        </h2>
        <h3 className="text-6xl md:text-8xl font-expanded-bold tracking-tighter text-black uppercase leading-[0.9]">
          What We <br /> <span className="text-black/10">Offer</span>
        </h3>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <GooeySvgFilter id="gooey-filter" strength={15} />

        <div className="relative">
          <div
            className="absolute inset-0"
            style={{ filter: "url(#gooey-filter)" }}
          >
            <div className="flex w-full">
              {TAB_CONTENT.map((_, index) => (
                <div key={index} className="relative flex-1 h-12 md:h-16">
                  {activeTab === index && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 bg-orange-500"
                      transition={{
                        type: "spring",
                        bounce: 0.0,
                        duration: 0.4,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="w-full bg-orange-500/20 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeTab}
                  initial={{
                    opacity: 0,
                    y: 30,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: -30,
                    filter: "blur(10px)",
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className="p-8 md:p-12"
                >
                  <p className="text-lg md:text-2xl font-roc text-black/80 leading-relaxed max-w-3xl">
                    {TAB_CONTENT[activeTab].description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-8">
                    {TAB_CONTENT[activeTab].features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 rounded-full bg-white/50 text-black text-sm font-expanded-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative flex w-full">
            {TAB_CONTENT.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className="flex-1 h-12 md:h-16"
              >
                <span
                  className={`
                  w-full h-full flex items-center justify-center
                  ${activeTab === index ? "text-white font-expanded-bold uppercase tracking-tight text-sm md:text-base" : "text-black/60 font-expanded-medium uppercase tracking-tight text-xs md:text-sm"}
                `}
                >
                  {tab.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
