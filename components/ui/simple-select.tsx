"use client"

import * as React from "react"
import { ChevronDownIcon, CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ---- Types -----

interface SimpleSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  triggerClassName?: string
  contentClassName?: string
}

interface SimpleSelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

// ---- Context -----

const SimpleSelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  close: () => void
} | null>(null)

// ---- Main Component -----

export function SimpleSelect({
  value,
  onValueChange,
  placeholder = "Select...",
  children,
  triggerClassName,
  contentClassName,
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState<string>(placeholder)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Find selected label from items
  React.useEffect(() => {
    let found = false

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const componentType =
          (child.type as { displayName?: string }).displayName

        const isContent =
          child.type === SimpleSelectContent ||
          componentType === "SimpleSelectContent"

        if (isContent) {
          const contentProps = child.props as { children?: React.ReactNode }

          React.Children.forEach(contentProps.children, (item) => {
            if (!React.isValidElement(item)) return

            const itemType =
              (item.type as { displayName?: string }).displayName

            const isItem =
              item.type === SimpleSelectItem ||
              itemType === "SimpleSelectItem"

            if (isItem) {
              const itemProps = item.props as SimpleSelectItemProps
              if (itemProps.value === value && !found) {
                setSelectedLabel(String(itemProps.children))
                found = true
              }
            }
          })
        }
      }
    })

    if (!found) setSelectedLabel(placeholder)
  }, [value, children, placeholder])

  // Close on outside click
  React.useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [isOpen])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen((s) => !s)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const related = e.relatedTarget as HTMLElement | null

    const movingToContent = related?.closest("[data-simple-select-content]")
    const movingToTrigger = related?.closest("[data-simple-select-trigger]")

    if (movingToContent || movingToTrigger) return

    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  const close = React.useCallback(() => setIsOpen(false), [])

  return (
    <SimpleSelectContext.Provider
      value={{
        value,
        onValueChange: (v) => {
          onValueChange(v)
          setIsOpen(false)
        },
        close,
      }}
    >
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child

          const type = child.type as { displayName?: string }
          const isTrigger =
            child.type === SimpleSelectTrigger ||
            type.displayName === "SimpleSelectTrigger"

          const isContent =
            child.type === SimpleSelectContent ||
            type.displayName === "SimpleSelectContent"

          if (isTrigger) {
            return React.cloneElement(
              child as React.ReactElement<{
                isOpen: boolean
                selectedLabel: string
                className?: string
                onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
              }>,
              {
                isOpen,
                selectedLabel,
                className: triggerClassName,
                onClick: handleClick,
              }
            )
          }

          if (isContent) {
            return React.cloneElement(
              child as React.ReactElement<{
                isOpen: boolean
                className?: string
              }>,
              {
                isOpen,
                className: contentClassName,
              }
            )
          }

          return child
        })}
      </div>
    </SimpleSelectContext.Provider>
  )
}

// ---- Trigger -----

const SimpleSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  {
    isOpen?: boolean
    selectedLabel?: string
    className?: string
    children?: React.ReactNode
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  }
>(({ isOpen = false, selectedLabel, className, children, onClick, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      data-simple-select-trigger
      {...props}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors",
        "border-input bg-muted/50 border-border/50 text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {children || (
        <>
          <span>{selectedLabel}</span>
          <ChevronDownIcon
            className={cn(
              "h-4 w-4 opacity-50 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </>
      )}
    </button>
  )
})
SimpleSelectTrigger.displayName = "SimpleSelectTrigger"

// ---- Content -----

const SimpleSelectContent = React.forwardRef<
  HTMLDivElement,
  { isOpen?: boolean; className?: string; children: React.ReactNode }
>(({ isOpen = false, className, children, ...props }, ref) => {
  if (!isOpen) return null

  return (
    <div
      ref={ref}
      data-simple-select-content
      {...props}
      className={cn(
        "absolute z-50 mt-1 min-w-[8rem] rounded-md border bg-popover shadow-md",
        "transition-all duration-200",
        className
      )}
    >
      <div className="p-1 max-h-[70vh] overflow-y-auto">{children}</div>
    </div>
  )
})
SimpleSelectContent.displayName = "SimpleSelectContent"

// ---- Item -----

export function SimpleSelectItem({ value, children, className }: SimpleSelectItemProps) {
  const ctx = React.useContext(SimpleSelectContext)
  if (!ctx) return null

  const isSelected = ctx.value === value

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent/50",
        className
      )}
      onClick={() => ctx.onValueChange(value)}
    >
      {isSelected && (
        <CheckIcon className="h-4 w-4 text-primary absolute right-2" />
      )}
      <span className={cn(isSelected && "pr-6")}>{children}</span>
    </div>
  )
}

// ---- Exports -----

SimpleSelect.Trigger = SimpleSelectTrigger
SimpleSelect.Content = SimpleSelectContent
SimpleSelect.Item = SimpleSelectItem
