"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Page = () => {
    const canvasRef = useRef(null);
    const frameCount = 118;
    const images = useRef([]); // keep images persistent
    const frameState = useRef({ frame: 0 });

    // Frame file naming
    const currentFrame = (index) =>
        `/helmet/frame_${index.toString().padStart(4, "0")}.jpeg`;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Function to resize and redraw
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawFrame(images.current[frameState.current.frame]);
        };

        // Draw helper (cover fit)
        const drawFrame = (img) => {
            if (!img || !img.width) return;
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShiftX = (canvas.width - img.width * ratio) / 2;
            const centerShiftY = (canvas.height - img.height * ratio) / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                centerShiftX,
                centerShiftY,
                img.width * ratio,
                img.height * ratio
            );
        };

        // Preload images
        let loaded = 0;
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                loaded++;
                if (loaded === frameCount) {
                    // Draw first frame when ready
                    drawFrame(images.current[0]);

                    // Animate frame index
                    gsap.to(frameState.current, {
                        frame: frameCount - 1,
                        snap: "frame",
                        ease: "none",
                        scrollTrigger: {
                            trigger: ".page2",
                            start: "top top",
                            end: "bottom bottom",
                            scrub: true,
                            pin: true,
                        },
                        onUpdate: () => drawFrame(images.current[frameState.current.frame]),
                    });
                }
            };
            images.current.push(img);
        }

        // Resize listener
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas(); // initial sizing

        return () => {
            ScrollTrigger.getAll().forEach((st) => st.kill());
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <div className="page2 w-full bg-black relative">
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="block w-full h-screen sticky top-0"
            />

            {/* Overlay text */}
            <div className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-end text-white pointer-events-none pb-20">
                <h1 className="text-3xl sm:text-5xl font-bold text-block">Futuristic Helmet</h1>
                <p className="text-lg mt-4 text-block">Scroll down to explore the design</p>
            </div>

            {/* Features of Helmet */}
            <section
                className="first relative w-full h-[500px] flex items-center bg-fixed bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: "url('/Assets/place.png')" }}
            >
                {/* Overlay tint */}
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)]" />

                {/* Foreground text */}
                <h1 className="relative z-10 text-4xl font-semibold text-white px-4">
                    Lightweight Material
                </h1>
            </section>

            <section
                className="second relative w-full h-[500px] flex items-center justify-end bg-fixed bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: "url('/Assets/place.png')" }}
            >
                {/* Overlay tint */}
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)]" />

                {/* Foreground text */}
                <h1 className="relative z-10 text-4xl font-semibold text-white px-4">
                    Enhanced Vision System
                </h1>
            </section>

            <section
                className="third relative w-full h-[500px] flex items-center justify-start bg-fixed bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: "url('/Assets/place.png')" }}
            >
                {/* Overlay tint */}
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)]" />

                {/* Foreground text */}
                <h1 className="relative z-10 text-4xl font-semibold text-white text-center px-4">
                    Built for Speed and Protection
                </h1>
            </section>

        </div>
    );
};

export default Page;
