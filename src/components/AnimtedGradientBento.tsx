"use client"

import React, { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import AnimatedGradient from "@/components/fancy/background/animated-gradient-with-svg"
import { useLenis } from "lenis/react"

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
    <div className="relative overflow-hidden rounded-3xl min-h-[450px] w-[500px] flex flex-col justify-between p-12 font-medium shrink-0 shadow-2xl shadow-orange-500/10">
        <span className="absolute inset-0 z-0 pointer-events-none bg-[#ff592f]">
            <AnimatedGradient colors={gradientColors} speed={15} blur="heavy" />
        </span>
        <div
            className={`relative z-10 flex-1 ${align === "center" ? "items-center text-center" : "items-start text-left"} flex flex-col justify-between w-full h-full`}
        >
            <div>
                <div className="text-white text-4xl font-expanded-bold tracking-tight mb-3 uppercase leading-none">
                    {title}
                </div>
                {subtitle && (
                    <div className="text-white/70 text-sm font-roc tracking-[0.3em] uppercase">
                        {subtitle}
                    </div>
                )}
            </div>
            {description && (
                <div className="text-white text-lg font-roc mt-auto mb-8 text-pretty leading-relaxed opacity-90">{description}</div>
            )}
            {buttonText && (
                <button className="mt-4 px-10 py-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-[10px] font-expanded-medium tracking-[0.4em] uppercase transition-all hover:bg-white hover:text-orange-600 cursor-pointer">
                    {buttonText}
                </button>
            )}
        </div>
    </div>
)

export const WhatWeOffer: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const lenis = useLenis()
    
    // Total horizontal scroll distance
    const [maxScroll, setMaxScroll] = useState(0)
    // Current horizontal scroll position
    const [xPos, setXPos] = useState(0)

    useEffect(() => {
        if (!containerRef.current) return
        // Calculate max scroll based on content width minus viewport width
        const updateMaxScroll = () => {
            const width = containerRef.current?.scrollWidth || 0
            setMaxScroll(width - window.innerWidth + 160) // Adding padding offset
        }
        updateMaxScroll()
        window.addEventListener("resize", updateMaxScroll)
        return () => window.removeEventListener("resize", updateMaxScroll)
    }, [])

    useEffect(() => {
        const section = sectionRef.current
        if (!section || !lenis) return

        const handleWheel = (e: WheelEvent) => {
            // Check if mouse is within the section bounds
            const rect = section.getBoundingClientRect()
            const isInside = (
                e.clientX >= rect.left && 
                e.clientX <= rect.right && 
                e.clientY >= rect.top && 
                e.clientY <= rect.bottom
            )

            if (!isInside) return

            // Calculate new X position
            const delta = e.deltaY || e.deltaX
            const nextX = Math.max(0, Math.min(maxScroll, xPos + delta))

            // Logic for locking/unlocking Y scroll
            const isAtStart = xPos === 0 && delta < 0
            const isAtEnd = xPos === maxScroll && delta > 0

            if (!isAtStart && !isAtEnd) {
                // Prevent vertical scroll and move horizontally
                e.preventDefault()
                setXPos(nextX)
                lenis.stop() // Lock main scroll
            } else {
                lenis.start() // Release main scroll
            }
        }

        // Add non-passive listener to allow preventDefault
        window.addEventListener("wheel", handleWheel, { passive: false })
        return () => {
            window.removeEventListener("wheel", handleWheel)
            lenis.start() // Ensure scroll is released on unmount
        }
    }, [lenis, xPos, maxScroll])

    // Smooth movement for the horizontal container
    const x = useSpring(xPos * -1, { stiffness: 150, damping: 40, restDelta: 0.001 })

    const services = [
        { title: "Web Development", subtitle: "Modern Frameworks", description: "High-performance, cinematic web experiences built with Next.js and GSAP." },
        { title: "Mobile Apps", subtitle: "iOS & Android", description: "Native-feeling cross-platform applications that don't compromise on design." },
        { title: "Ecommerce", subtitle: "Shopify & Custom", description: "Conversion-optimized digital storefronts for luxury and boutique brands." },
        { title: "Backend & APIs", subtitle: "Scalable Systems", description: "Robust architecture designed to handle complex data and high traffic." },
        { title: "Custom AI Chatbots", subtitle: "Intelligent UX", description: "Leverage LLMs to automate customer interaction and internal workflows." },
        { title: "Automations", subtitle: "Efficiency First", description: "Streamline your business operations with intelligent, connected logic." },
    ]

    return (
        <section ref={sectionRef} className="w-full py-40 bg-white overflow-hidden selection:bg-orange-500/20">
            <div className="px-8 md:px-20 mb-20">
                <h2 className="text-[10px] font-expanded-medium uppercase tracking-[0.6em] text-black/20 mb-6">
                    Capabilities
                </h2>
                <h3 className="text-7xl md:text-9xl font-expanded-bold tracking-tighter text-black uppercase leading-[0.8]">
                    What We <br /> <span className="text-black/5">Offer</span>
                </h3>
            </div>

            <div className="relative">
                <motion.div 
                    ref={containerRef}
                    style={{ x }}
                    className="flex gap-12 px-8 md:px-20 w-max"
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
