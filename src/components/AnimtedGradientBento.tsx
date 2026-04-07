"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import AnimatedGradient from "@/components/fancy/background/animated-gradient-with-svg"

interface BentoCardProps {
    title: string
    subtitle?: string
    description?: string
    buttonText?: string
    align?: "left" | "center"
}

const gradientColors = ["#FF0000", "#FF4500", "#FF9900"]

const BentoCard: React.FC<BentoCardProps> = ({
    title,
    subtitle,
    description,
    buttonText,
    align = "left",
}) => (
    <div className="relative overflow-hidden rounded-3xl min-h-[400px] w-[450px] flex flex-col justify-between p-10 font-medium shrink-0 shadow-2xl shadow-orange-500/10">
        <span className="absolute inset-0 z-0 pointer-events-none bg-[#ff592f]">
            <AnimatedGradient colors={gradientColors} speed={15} blur="heavy" />
        </span>
        <div
            className={`relative z-10 flex-1 ${align === "center" ? "items-center text-center" : "items-start text-left"} flex flex-col justify-between w-full h-full`}
        >
            <div>
                <div className="text-white text-3xl font-expanded-bold tracking-tight mb-2">
                    {title}
                </div>
                {subtitle && (
                    <div className="text-white/70 text-sm font-roc tracking-[0.2em] uppercase">
                        {subtitle}
                    </div>
                )}
            </div>
            {description && (
                <div className="text-white text-base font-roc mt-auto mb-6 text-pretty leading-relaxed opacity-90">{description}</div>
            )}
            {buttonText && (
                <button className="mt-4 px-8 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-[10px] font-expanded-medium tracking-[0.3em] uppercase transition-all hover:bg-white hover:text-orange-600 cursor-pointer">
                    {buttonText}
                </button>
            )}
        </div>
    </div>
)

export const WhatWeOffer: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    // Map vertical scroll (0 to 1) to horizontal movement (0 to -1800px)
    // We use a spring for smoother motion
    const xRange = useTransform(scrollYProgress, [0.2, 0.8], [0, -1800])
    const x = useSpring(xRange, { stiffness: 100, damping: 30, restDelta: 0.001 })

    const services = [
        { title: "Web Development", subtitle: "Modern Frameworks", description: "High-performance, cinematic web experiences built with Next.js and GSAP." },
        { title: "Mobile Apps", subtitle: "iOS & Android", description: "Native-feeling cross-platform applications that don't compromise on design." },
        { title: "Ecommerce", subtitle: "Shopify & Custom", description: "Conversion-optimized digital storefronts for luxury and boutique brands." },
        { title: "Backend & APIs", subtitle: "Scalable Systems", description: "Robust architecture designed to handle complex data and high traffic." },
        { title: "Custom AI Chatbots", subtitle: "Intelligent UX", description: "Leverage LLMs to automate customer interaction and internal workflows." },
        { title: "Automations", subtitle: "Efficiency First", description: "Streamline your business operations with intelligent, connected logic." },
    ]

    return (
        <section ref={sectionRef} className="w-full py-32 bg-white overflow-hidden">
            <div className="px-8 md:px-20 mb-16">
                <h2 className="text-[10px] font-expanded-medium uppercase tracking-[0.5em] text-black/20 mb-4">
                    Capabilities
                </h2>
                <h3 className="text-6xl md:text-8xl font-expanded-bold tracking-tighter text-black uppercase leading-[0.9]">
                    What We <br /> <span className="text-black/10">Offer</span>
                </h3>
            </div>

            <div className="relative">
                <motion.div 
                    style={{ x }}
                    className="flex gap-8 px-8 md:px-20 w-max"
                >
                    {services.map((service, index) => (
                        <BentoCard 
                            key={index}
                            title={service.title}
                            subtitle={service.subtitle}
                            description={service.description}
                            buttonText="Learn More"
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

const AnimatedGradientBento: React.FC = () => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-background px-20 sm:px-8 py-8 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 w-full max-w-lg">
                <div className="sm:col-span-8 h-32 sm:h-48">
                    <BentoCard
                        title="Animated Bento"
                        subtitle="#001"
                        description="Using only SVG circles and blur"
                    />
                </div>
                <div className="h-32 sm:h-48 sm:col-span-4">
                    <BentoCard title="Gradients" buttonText="Explore More" />
                </div>
            </div>
        </div>
    )
}

export default AnimatedGradientBento
