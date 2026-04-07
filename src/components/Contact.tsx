import Link from "next/link"

import CenterUnderline from "@/components/fancy/text/underline-center"
import ComesInGoesOutUnderline from "@/components/fancy/text/underline-comes-in-goes-out"
import GoesOutComesInUnderline from "@/components/fancy/text/underline-goes-out-comes-in"

export default function Contact() {
    return (
        <div className="w-dvw h-dvh flex flex-col items-center justify-center bg-white">
            <div className="flex flex-row font-overused-grotesk items-start text-[#0015ff] h-full py-36 uppercase space-x-8 text-sm sm:text-lg md:text-xl lg:text-2xl">
                <div>Contact</div>
                <ul className="flex flex-col space-y-1 h-full">
                    <Link className="" href="https://www.linkedin.com/in/nuturn-studio-94b0633ba">
                        <CenterUnderline>LINKEDIN</CenterUnderline>
                    </Link>
                    <Link className="" href="https://instagram.com/nuturn.studio">
                        <ComesInGoesOutUnderline direction="right">
                            INSTAGRAM
                        </ComesInGoesOutUnderline>
                    </Link>
                    <Link className="" href="https://x.com/nuturnstudio">
                        <ComesInGoesOutUnderline direction="left">
                            X (TWITTER)
                        </ComesInGoesOutUnderline>
                    </Link>

                    <div className="pt-12">
                        <ul className="flex flex-col space-y-1 h-full">
                            <Link className="" href="mailto:hello@nuturnstudio.com">
                                <GoesOutComesInUnderline direction="left">
                                    HELLO@NUTURNSTUDIO.COM
                                </GoesOutComesInUnderline>
                            </Link>
                        </ul>
                    </div>
                </ul>
            </div>
        </div>
    )
}
