"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (isAnimating) return

    setIsAnimating(true)
    const nextTheme = theme === "light" ? "dark" : "light"

    // Smooth delay for the actual theme switch to sync with animation
    setTimeout(() => {
      setTheme(nextTheme)
    }, 150)

    setTimeout(() => {
      setIsAnimating(false)
    }, 800)
  }

  if (!mounted) return <div className="h-9 w-9" />

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9 rounded-lg relative z-50 overflow-hidden group hover:bg-muted/50 transition-colors"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === "light" ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <Sun className="h-4 w-4 text-orange-500" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <Moon className="h-4 w-4 text-blue-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* The "Wow" Diagonal Swipe Effect */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{
              clipPath: "circle(0% at calc(100% - 60px) 40px)",
              opacity: 1
            }}
            animate={{
              clipPath: "circle(150% at calc(100% - 60px) 40px)",
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 1.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className={`fixed inset-0 pointer-events-none z-[9999] ${theme === "light" ? "bg-slate-950" : "bg-white"
              }`}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
