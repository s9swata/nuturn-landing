import HeroText from "./HeroText"
import HeroVideo from "./HeroVideo"

const Hero = () => {
    return (
        <>
            <section className="flex flex-col relative z-10">
                <HeroText />
                <HeroVideo />
            </section>
        </>
    )
}

export default Hero