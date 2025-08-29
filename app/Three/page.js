"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { OrbitControls } from "three-stdlib";
import { RGBELoader } from "three-stdlib";

export default function LionHead() {
    const mountRef = useRef(null);

    useEffect(() => {
        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(
            60,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            100
        );
        camera.position.set(0, 0, 6);

        // Renderer (with transparent background)
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0); // fully transparent background
        mountRef.current.appendChild(renderer.domElement);

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        new RGBELoader().load(
            "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/rogland_clear_night_1k.hdr",
            function (texture) {
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                scene.background = envMap;
                scene.environment = envMap;
                texture.dispose();
                pmremGenerator.dispose();

                // Load model
                const loader = new GLTFLoader();
                loader.load("/models/DamagedHelmet.gltf", (gltf) => {
                    const model = gltf.scene;
                    model.scale.set(1.5, 1.5, 1.5);
                    scene.add(model);

                    // Compute bounding box of model
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3()).length();
                    const center = box.getCenter(new THREE.Vector3());

                    // Re-center model
                    model.position.x += model.position.x - center.x;
                    model.position.y += model.position.y - center.y;
                    model.position.z += model.position.z - center.z;

                    // Move camera so model fits in view
                    camera.position.set(0, 0, size * 1.2);
                    camera.lookAt(center);

                    // Light
                    const light = new THREE.DirectionalLight(0xffffff, 2);
                    light.position.set(5, 5, 5);
                    scene.add(light);

                    // Controls
                    const controls = new OrbitControls(camera, renderer.domElement);
                    controls.enableDamping = true;
                    controls.dampingFactor = 0.05;
                    controls.enablePan = true;
                    controls.enableZoom = true;
                    controls.target.copy(center);
                    controls.update();

                    // Animation loop
                    const animate = () => {
                        requestAnimationFrame(animate);
                        controls.update();
                        renderer.render(scene, camera);
                    };
                    animate();
                });
            }
        );

        // Handle resize
        const handleResize = () => {
            camera.aspect =
                mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(
                mountRef.current.clientWidth,
                mountRef.current.clientHeight
            );
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                position: "relative", // important for overlay
            }}
        >
            {/* Overlay text */}
            <div
                style={{
                    position: "absolute",
                    top: "20%",
                    left: "50%",
                    transform: "translate(-50%, -50%)", // centers it perfectly
                    color: "white",
                    fontSize: "24px",
                    fontWeight: "bold",
                    zIndex: 10,
                    pointerEvents: "none",
                    textAlign: "center",
                }}
            >
                Preview
            </div>
        </div>
    );
}
