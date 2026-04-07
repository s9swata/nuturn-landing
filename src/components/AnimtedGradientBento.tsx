"use client"

import React from "react"
import AnimatedGradient from "@/components/fancy/background/animated-gradient-with-svg"

const gradientColors = ["#FF0000", "#FF4500", "#FF9900"]

interface BentoCardProps {
    title: string
    subtitle?: string
    description?: string
    buttonText?: string
    className?: string
}

const BentoCard: React.FC<BentoCardProps> = ({
    title,
    subtitle,
    description,
    buttonText,
    className = "",
}) => (
    <div className={`relative overflow-hidden rounded-3xl p-8 flex flex-col justify-between min-h-[300px] ${className}`}>
        <span className="absolute inset-0 z-0 pointer-events-none bg-[#ff592f]">
            <AnimatedGradient colors={gradientColors} speed={15} blur="heavy" />
        </span>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
                <div className="text-white text-2xl md:text-3xl font-expanded-bold tracking-tight mb-2 uppercase leading-none">
                    {title}
                </div>
                {subtitle && (
                    <div className="text-white/70 text-xs font-roc tracking-[0.3em] uppercase">
                        {subtitle}
                    </div>
                )}
            </div>
            <div>
                {description && (
                    <div className="text-white text-sm font-roc leading-relaxed opacity-90 mb-4">{description}</div>
                )}
                {buttonText && (
                    <button className="px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-[10px] font-expanded-medium tracking-[0.3em] uppercase transition-all hover:bg-white hover:text-orange-600 cursor-pointer">
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    </div>
)

export const WhatWeOffer: React.FC = () => {
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

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Large card - spans 8 columns */}
                <div className="md:col-span-8">
                    <BentoCard
                        title="Web Development"
                        subtitle="Modern Frameworks"
                        description="High-performance, cinematic web experiences built with Next.js and GSAP."
                        buttonText="Learn More"
                    />
                </div>

                {/* Small card - spans 4 columns */}
                <div className="md:col-span-4">
                    <BentoCard
                        title="Mobile Apps"
                        subtitle="iOS & Android"
                        description="Native-feeling cross-platform applications."
                        buttonText="Explore"
                    />
                </div>

                {/* Small card - spans 4 columns */}
                <div className="md:col-span-4">
                    <BentoCard
                        title="Ecommerce"
                        subtitle="Shopify & Custom"
                        description="Conversion-optimized digital storefronts."
                    />
                </div>

                {/* Large card - spans 8 columns */}
                <div className="md:col-span-8">
                    <BentoCard
                        title="Backend & APIs"
                        subtitle="Scalable Systems"
                        description="Robust architecture designed to handle complex data and high traffic."
                        buttonText="Discover"
                    />
                </div>

                {/* Full width card */}
                <div className="md:col-span-12">
                    <BentoCard
                        title="Custom AI Chatbots & Automations"
                        subtitle="Intelligent Systems"
                        description="Leverage LLMs to automate customer interaction and streamline your business operations with intelligent, connected logic."
                        buttonText="Get Started"
                        className="min-h-[350px]"
                    />
                </div>
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
