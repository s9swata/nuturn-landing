import type { RefObject } from "react";

export function Squiggle({ ref }: { ref?: RefObject<SVGSVGElement | null> }) {
    return (
        <svg ref={ref} width="1000" height="2000" viewBox="0 0 1000 2000" fill="none" xmlns="http://www.w3.org/2000/svg" className="squiggle opacity-0 transition-opacity duration-300">
            <path d="M-24.5 101C285 315 5.86279 448.291 144.223 631.238C239.404 757.091 559.515 782.846 608.808 617.456C658.101 452.067 497.627 367.073 406.298 426.797C314.968 486.521 263.347 612.858 322.909 865.537C384.086 1125.06 79.3992 1007.94 100 1261.99C144.222 1807.35 819 1325 513 1142.5C152.717 927.625 -45 1916.5 1191.5 1852" stroke="#3946F4" strokeWidth="30" strokeLinejoin="round" />
        </svg>
    );
}