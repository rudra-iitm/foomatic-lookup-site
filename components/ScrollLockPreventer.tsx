"use client"

import { useEffect } from "react"

export default function ScrollLockPreventer() {
  useEffect(() => {
    // Simply ensure scrolling is enabled on mount
    document.body.style.overflow = 'auto'
    document.body.style.overflowX = 'auto'
    document.body.style.overflowY = 'auto'
    
    return () => {
      // Cleanup on unmount
      document.body.style.overflow = 'auto'
    }
  }, [])

  return null
}

