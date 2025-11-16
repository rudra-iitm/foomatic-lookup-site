"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// -----------------------
// Context
// -----------------------
const SelectContext = React.createContext<{
  markHovering: () => void
  markNotHovering: () => void
} | null>(null)

// -----------------------
// Select Root
// -----------------------
function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [open, setOpen] = React.useState(false)
  const isHoveringRef = React.useRef(false)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const isOpeningRef = React.useRef(false)

  const markHovering = React.useCallback(() => {
    isHoveringRef.current = true

    // Always clear any pending close first
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    // Only set open if not already open - use functional update to avoid stale closure
    setOpen((prevOpen) => {
      if (prevOpen) {
        return prevOpen // Already open, no change
      }
      isOpeningRef.current = true
      // Reset opening flag after a brief moment
      setTimeout(() => {
        isOpeningRef.current = false
      }, 100)
      return true
    })
  }, [])

  const markNotHovering = React.useCallback(() => {
    isHoveringRef.current = false

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }

    closeTimeoutRef.current = setTimeout(() => {
      // Double check hover state before closing
      if (!isHoveringRef.current && !isOpeningRef.current) {
        setOpen(false)
      }
      closeTimeoutRef.current = null
    }, 250)
  }, [])

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  // Memoize context value - stable reference to prevent re-renders
  const contextValue = React.useMemo(
    () => ({ markHovering, markNotHovering }),
    [markHovering, markNotHovering]
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <SelectPrimitive.Root
        {...props}
        open={open}
        onOpenChange={(next) => {
          // Prevent Radix from closing while hovering or opening
          if (!next && (isHoveringRef.current || isOpeningRef.current)) {
            return
          }
          // Only update if state actually changed and not in transition
          if (next !== open && !isOpeningRef.current) {
            setOpen(next)
          }
        }}
      />
    </SelectContext.Provider>
  )
}

// -----------------------
// Trigger
// -----------------------
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  const context = React.useContext(SelectContext)
  const leaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = React.useCallback(() => {
    // Clear any pending leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    // Immediately mark as hovering and open
    context?.markHovering()
  }, [context])

  const handleMouseLeave = (e: React.MouseEvent) => {
    const related = e.relatedTarget as HTMLElement | null

    // If moving to content, don't mark as not hovering
    if (related && related.closest('[data-slot="select-content"]')) {
      return
    }

    // Clear any existing timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
    }

    // Simple delay to allow mouse to move to content
    // The content's mouseEnter will cancel this if mouse reaches it
    leaveTimeoutRef.current = setTimeout(() => {
      context?.markNotHovering()
      leaveTimeoutRef.current = null
    }, 150)
  }

  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:hover:bg-input/50 aria-invalid:border-destructive dark:bg-input/30 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

// -----------------------
// Content
// -----------------------
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const context = React.useContext(SelectContext)
  const leaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = React.useCallback(() => {
    // Clear any pending leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    // Immediately mark as hovering to prevent any close
    context?.markHovering()
  }, [context])

  const handleMouseLeave = (e: React.MouseEvent) => {
    const related = e.relatedTarget as HTMLElement | null

    // If moving to trigger, don't mark as not hovering
    if (related && related.closest('[data-slot="select-trigger"]')) {
      return
    }

    // Clear any existing timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
    }

    // Use a longer delay to allow mouse to move back to trigger
    // Don't use querySelector as it's unreliable during transitions
    leaveTimeoutRef.current = setTimeout(() => {
      // Only mark as not hovering if we're still not over trigger
      context?.markNotHovering()
      leaveTimeoutRef.current = null
    }, 100)
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // animations & styling
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-md border shadow-md transition-all duration-200 ease-in-out",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=left]:-translate-x-1",
          className
        )}
        position={position}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)] w-full scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

// -----------------------
// Sub-Components
// -----------------------
function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border -mx-1 my-1 h-px pointer-events-none", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

// -----------------------
// Exports
// -----------------------
export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectValue,
}
