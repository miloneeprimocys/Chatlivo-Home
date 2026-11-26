"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CursorFollower = () => {
    const [isHovered, setIsHovered] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 250 };
    const dotX = useSpring(mouseX, springConfig);
    const dotY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Centers the 12px (h-3) dot on the cursor
            mouseX.set(e.clientX - 6);
            mouseY.set(e.clientY - 6);
        };

        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest(".cursor-scan-effect")) {
                setIsHovered(true);
            }
        };

        const handleMouseLeave = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest(".cursor-scan-effect")) {
                setIsHovered(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseover", handleMouseEnter, true);
        document.addEventListener("mouseout", handleMouseLeave, true);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseover", handleMouseEnter, true);
            document.removeEventListener("mouseout", handleMouseLeave, true);
        };
    }, [mouseX, mouseY]);

    return (
        <motion.div
            style={{
                x: dotX,
                y: dotY,
                // Only apply the blend mode when hovered/large
                mixBlendMode: isHovered ? "difference" : "normal"
            }}
            animate={{
                scale: isHovered ? 8 : 1,
                // When small (not hovered), it stays green. 
                // When large (hovered), it turns white to use the 'difference' effect.
                backgroundColor: isHovered ? "#ffffff" : "#73C311",
            }}
            transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                backgroundColor: { duration: 0.2 }
            }}
            className="pointer-events-none fixed top-0 left-0 z-[10000] h-3 w-3 rounded-full hidden xl:block"
        />
    );
};

export default CursorFollower;