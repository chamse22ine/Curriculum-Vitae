"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function AnimatedBackground() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        container.appendChild(renderer.domElement)

        camera.position.z = 30

        // Floating geometric shapes
        const shapes: THREE.Mesh[] = []
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 0),
            new THREE.TorusGeometry(0.7, 0.3, 8, 16),
            new THREE.SphereGeometry(0.8, 16, 16),
        ]

        const colors = [
            new THREE.Color(0x6366f1), // indigo
            new THREE.Color(0xec4899), // pink
            new THREE.Color(0x8b5cf6), // violet
            new THREE.Color(0x06b6d4), // cyan
            new THREE.Color(0xf59e0b), // amber
            new THREE.Color(0x10b981), // emerald
        ]

        // Create 40 floating shapes
        for (let i = 0; i < 40; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)]
            const material = new THREE.MeshPhongMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                transparent: true,
                opacity: 0.15 + Math.random() * 0.15,
                wireframe: Math.random() > 0.5,
                shininess: 100,
            })

            const mesh = new THREE.Mesh(geometry, material)
            const scale = 0.5 + Math.random() * 2
            mesh.scale.set(scale, scale, scale)
            mesh.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30
            )
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            )

            // Store animation data
            mesh.userData = {
                rotSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.01,
                },
                floatSpeed: 0.3 + Math.random() * 0.7,
                floatOffset: Math.random() * Math.PI * 2,
                originalY: mesh.position.y,
            }

            shapes.push(mesh)
            scene.add(mesh)
        }

        // Soft ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)

        // Directional lights for depth
        const light1 = new THREE.DirectionalLight(0x6366f1, 0.4)
        light1.position.set(10, 10, 10)
        scene.add(light1)

        const light2 = new THREE.DirectionalLight(0xec4899, 0.3)
        light2.position.set(-10, -10, 5)
        scene.add(light2)

        // Mouse tracking for parallax
        let mouseX = 0
        let mouseY = 0
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener("mousemove", handleMouseMove)

        // Animation loop
        const timer = new THREE.Timer()
        let animId: number

        function animate() {
            animId = requestAnimationFrame(animate)
            timer.update()
            const elapsed = timer.getElapsed()

            // Animate shapes
            shapes.forEach((shape) => {
                const { rotSpeed, floatSpeed, floatOffset, originalY } = shape.userData
                shape.rotation.x += rotSpeed.x
                shape.rotation.y += rotSpeed.y
                shape.rotation.z += rotSpeed.z
                shape.position.y = originalY + Math.sin(elapsed * floatSpeed + floatOffset) * 2
            })

            // Smooth camera parallax
            camera.position.x += (mouseX * 3 - camera.position.x) * 0.02
            camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02
            camera.lookAt(scene.position)

            renderer.render(scene, camera)
        }

        animate()

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener("resize", handleResize)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("resize", handleResize)
            container.removeChild(renderer.domElement)
            renderer.dispose()
            geometries.forEach(g => g.dispose())
            shapes.forEach(s => {
                if (s.material instanceof THREE.Material) s.material.dispose()
            })
        }
    }, [])

    return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" />
}
