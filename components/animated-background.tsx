"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const particles: Array<{
            x: number
            y: number
            vx: number
            vy: number
            size: number
        }> = []

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
            })
        }

        function animate() {
            if (!ctx || !canvas) return

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw grid
            ctx.strokeStyle = "rgba(139, 92, 246, 0.1)"
            ctx.lineWidth = 1

            for (let i = 0; i < canvas.width; i += 50) {
                ctx.beginPath()
                ctx.moveTo(i, 0)
                ctx.lineTo(i, canvas.height)
                ctx.stroke()
            }

            for (let i = 0; i < canvas.height; i += 50) {
                ctx.beginPath()
                ctx.moveTo(0, i)
                ctx.lineTo(canvas.width, i)
                ctx.stroke()
            }

            // Draw and update particles
            particles.forEach((particle, i) => {
                particle.x += particle.vx
                particle.y += particle.vy

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

                // Draw particle
                ctx.fillStyle = i % 2 === 0 ? "rgba(139, 92, 246, 0.6)" : "rgba(56, 189, 248, 0.6)"
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fill()

                // Draw connections
                particles.forEach((otherParticle, j) => {
                    if (i === j) return
                    const dx = particle.x - otherParticle.x
                    const dy = particle.y - otherParticle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 150) {
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.2 * (1 - distance / 150)})`
                        ctx.lineWidth = 0.5
                        ctx.beginPath()
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(otherParticle.x, otherParticle.y)
                        ctx.stroke()
                    }
                })
            })

            requestAnimationFrame(animate)
        }

        animate()

        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.4 }} />
}
