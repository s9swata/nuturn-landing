import VerticalCutReveal from "@/components/fancy/text/vertical-cut-reveal"

export default function HeroText() {
    return (
        <div className="w-full p-20 xs:text-2xl text-2xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl flex flex-col items-start justify-center font-expanded-bold leading-14 md:p-10 lg:p-12 text-black tracking-wide">
            <VerticalCutReveal
                splitBy="characters"
                staggerDuration={0.025}
                staggerFrom="first"
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 21,
                }}
            >
                {`Built to `}
            </VerticalCutReveal>
            <VerticalCutReveal
                splitBy="characters"
                staggerDuration={0.025}
                staggerFrom="last"
                reverse={true}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 21,
                    delay: 0.5,
                }}
            >
                {`Stand Out`}
            </VerticalCutReveal>
        </div>
    )
}
