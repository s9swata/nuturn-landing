import HeroText from "./HeroText"
import HeroVideo from "./HeroVideo"
import GooeyTabs from "./GoeeyTabs"

const Hero = () => {
    return (
        <>
            <section className="flex flex-col relative z-10">
                <HeroText />
                <HeroVideo />
                <GooeyTabs />
            </section>
        </>
    )
}

export default Hero