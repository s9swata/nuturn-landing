"use client"

import React from "react"

import AnimatedGradient from "@/components/fancy/background/animated-gradient-with-svg"

import { motion } from "framer-motion"

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
    <div className="relative overflow-hidden rounded-3xl min-h-[300px] w-[350px] flex flex-col justify-between p-8 font-medium shrink-0">
        <span className="absolute inset-0 z-0 pointer-events-none bg-[#ff592f]">
            <AnimatedGradient colors={gradientColors} speed={10} blur="medium" />
        </span>
        <div
            className={`relative z-10 flex-1 ${align === "center" ? "items-center text-center" : "items-start text-left"} flex flex-col justify-between w-full h-full`}
        >
            <div>
                <div className="text-white text-2xl font-expanded-bold tracking-tight mb-1">
                    {title}
                </div>
                {subtitle && (
                    <div className="text-white/80 text-sm font-roc tracking-wider uppercase">
                        {subtitle}
                    </div>
                )}
            </div>
            {description && (
                <div className="text-white text-sm font-roc mt-auto mb-4 text-pretty leading-snug opacity-90">{description}</div>
            )}
            {buttonText && (
                <button className="mt-4 px-6 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white text-xs font-expanded-medium tracking-widest uppercase transition-all hover:bg-white hover:text-orange-600 cursor-pointer">
                    {buttonText}
                </button>
            )}
        </div>
    </div>
)

export const WhatWeOffer: React.FC = () => {
    const services = [
        { title: "Web Development", subtitle: "Modern Frameworks", description: "High-performance, cinematic web experiences built with Next.js and GSAP." },
        { title: "Mobile Apps", subtitle: "iOS & Android", description: "Native-feeling cross-platform applications that don't compromise on design." },
        { title: "Ecommerce", subtitle: "Shopify & Custom", description: "Conversion-optimized digital storefronts for luxury and boutique brands." },
        { title: "Backend & APIs", subtitle: "Scalable Systems", description: "Robust architecture designed to handle complex data and high traffic." },
        { title: "Custom AI Chatbots", subtitle: "Intelligent UX", description: "Leverage LLMs to automate customer interaction and internal workflows." },
        { title: "Automations", subtitle: "Efficiency First", description: "Streamline your business operations with intelligent, connected logic." },
    ]

    return (
        <section className="w-full py-24 bg-white overflow-hidden">
            <div className="px-8 md:px-12 mb-12">
                <h2 className="text-xs font-expanded-medium uppercase tracking-[0.3em] text-black/30 mb-4">
                    Capabilities
                </h2>
                <h3 className="text-5xl md:text-7xl font-expanded-bold tracking-tighter text-black uppercase">
                    What We Offer
                </h3>
            </div>

            <motion.div 
                className="flex gap-6 px-8 md:px-12 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ right: 0, left: -1400 }}
                whileTap={{ cursor: "grabbing" }}
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
        </section>
    )
}

const AnimatedGradientBento: React.FC = () => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-background px-20 sm:px-8 py-8 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 w-full max-w-lg">
                {/* Top left card */}
                <div className="sm:col-span-8 h-32 sm:h-48">
                    <BentoCard
                        title="Animated Bento"
                        subtitle="#001"
                        description="Using only SVG circles and blur"
                    />
                </div>
                {/* Top right card */}
                <div className="h-32 sm:h-48 sm:col-span-4">
                    <BentoCard title="Gradients" buttonText="Explore More" />
                </div>
            </div>
        </div>
    )
}

export default AnimatedGradientBento
