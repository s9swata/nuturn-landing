"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { motion, useSpring } from "framer-motion"
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
    const cardsContainerRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const isScrollingRef = useRef(false)
    
    const [activeCardIndex, setActiveCardIndex] = useState(0)
    const [xPos, setXPos] = useState(0)
    const [isOverSection, setIsOverSection] = useState(false)
    
    const services = [
        { title: "Web Development", subtitle: "Modern Frameworks", description: "High-performance, cinematic web experiences built with Next.js and GSAP." },
        { title: "Mobile Apps", subtitle: "iOS & Android", description: "Native-feeling cross-platform applications that don't compromise on design." },
        { title: "Ecommerce", subtitle: "Shopify & Custom", description: "Conversion-optimized digital storefronts for luxury and boutique brands." },
        { title: "Backend & APIs", subtitle: "Scalable Systems", description: "Robust architecture designed to handle complex data and high traffic." },
        { title: "Custom AI Chatbots", subtitle: "Intelligent UX", description: "Leverage LLMs to automate customer interaction and internal workflows." },
        { title: "Automations", subtitle: "Efficiency First", description: "Streamline your business operations with intelligent, connected logic." },
    ]

    const totalCards = services.length
    const cardWidth = 482 // 450px + 32px gap
    const maxScroll = (totalCards - 1) * cardWidth

    // Calculate active card
    const updateActiveCard = useCallback(() => {
        const centerX = window.innerWidth / 2
        let closestIndex = 0
        let closestDistance = Infinity
        
        cardRefs.current.forEach((card, index) => {
            if (!card) return
            const rect = card.getBoundingClientRect()
            const cardCenter = rect.left + rect.width / 2
            const distance = Math.abs(cardCenter - centerX)
            
            if (distance < closestDistance) {
                closestDistance = distance
                closestIndex = index
            }
        })
        
        setActiveCardIndex(closestIndex)
    }, [])

    // Direct DOM manipulation for immediate scroll response
    const updateScroll = useCallback((newX: number) => {
        const clampedX = Math.max(0, Math.min(maxScroll, newX))
        setXPos(clampedX)
        
        if (cardsContainerRef.current) {
            cardsContainerRef.current.style.transform = `translateX(-${clampedX}px)`
        }
    }, [maxScroll])

    // Wheel event handler on the scroll container
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const handleWheel = (e: WheelEvent) => {
            // Only hijack if we're over this section
            if (!isOverSection) return
            
            e.preventDefault()
            
            const delta = e.deltaY || e.deltaX
            updateScroll(xPos + delta)
            
            requestAnimationFrame(updateActiveCard)
        }

        // Use capture phase to catch events early
        container.addEventListener("wheel", handleWheel, { passive: false })
        
        return () => {
            container.removeEventListener("wheel", handleWheel)
        }
    }, [xPos, isOverSection, updateScroll, updateActiveCard])

    // Track mouse position to know when we're over the section
    useEffect(() => {
        const section = sectionRef.current
        if (!section) return

        const handleMouseEnter = () => setIsOverSection(true)
        const handleMouseLeave = () => setIsOverSection(false)

        section.addEventListener("mouseenter", handleMouseEnter)
        section.addEventListener("mouseleave", handleMouseLeave)

        return () => {
            section.removeEventListener("mouseenter", handleMouseEnter)
            section.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [])

    // Update active card on mount and resize
    useEffect(() => {
        updateActiveCard()
        window.addEventListener("resize", updateActiveCard)
        return () => window.removeEventListener("resize", updateActiveCard)
    }, [updateActiveCard])

    // Check if at last card to allow vertical scroll
    const isAtLastCard = xPos >= maxScroll - 20

    return (
        <section ref={sectionRef} className="relative bg-white overflow-hidden">
            <div ref={scrollContainerRef} className="px-8 md:px-20 py-32">
                <div className="mb-16">
                    <h2 className="text-[10px] font-expanded-medium uppercase tracking-[0.5em] text-black/20 mb-4">
                        Capabilities
                    </h2>
                    <h3 className="text-6xl md:text-8xl font-expanded-bold tracking-tighter text-black uppercase leading-[0.9]">
                        What We <br /> <span className="text-black/10">Offer</span>
                    </h3>
                </div>

                <div className="relative overflow-visible">
                    <div 
                        ref={cardsContainerRef}
                        className="flex gap-8 px-8 md:px-20 w-max transition-transform duration-100"
                        style={{ transform: `translateX(-${xPos}px)` }}
                    >
                        {services.map((service, index) => (
                            <div 
                                key={index}
                                ref={(el) => { cardRefs.current[index] = el }}
                            >
                                <BentoCard 
                                    title={service.title}
                                    subtitle={service.subtitle}
                                    description={service.description}
                                    buttonText="Learn More"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Card Progress Indicator */}
                <div className="flex gap-2 px-8 md:px-20 mt-12">
                    {services.map((_, index) => (
                        <div 
                            key={index}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                index === activeCardIndex 
                                    ? "w-12 bg-orange-500" 
                                    : index < activeCardIndex 
                                        ? "w-4 bg-orange-500/30" 
                                        : "w-4 bg-black/10"
                            }`}
                        />
                    ))}
                </div>
                
                {/* Scroll Hint */}
                {!isAtLastCard && isOverSection && (
                    <div className="absolute bottom-8 right-8 md:right-20 flex items-center gap-2 text-black/30 text-xs font-roc uppercase tracking-widest">
                        <span>Scroll to explore</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                )}
                
                {isAtLastCard && (
                    <div className="absolute bottom-8 right-8 md:right-20 flex items-center gap-2 text-black/30 text-xs font-roc uppercase tracking-widest">
                        <span>Continue scrolling</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce">
                            <path d="M12 5v14M5 12l7 7 7-7"/>
                        </svg>
                    </div>
                )}
            </div>
            
            {/* Spacer */}
            <div className="h-[50vh]" />
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
