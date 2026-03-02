import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

export interface DialogProps
  extends React.ComponentProps<typeof DialogPrimitive.Root> {}

export const Dialog = DialogPrimitive.Root

export const DialogTrigger = DialogPrimitive.Trigger

export const DialogPortal = DialogPrimitive.Portal

export const DialogClose = DialogPrimitive.Close

export function DialogOverlay(
  props: React.ComponentProps<typeof DialogPrimitive.Overlay>
) {
  const { className, ...rest } = props
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm",
        className
      )}
      {...rest}
    />
  )
}

export interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {}

export function DialogContent(props: DialogContentProps) {
  const { className, children, ...rest } = props
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 gap-4 border bg-card p-6 shadow-lg duration-200 sm:rounded-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        {...rest}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export function DialogHeader(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-left",
        className
      )}
      {...rest}
    />
  )
}

export function DialogFooter(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...rest}
    />
  )
}

export function DialogTitle(
  props: React.HTMLAttributes<HTMLHeadingElement>
) {
  const { className, ...rest } = props
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...rest}
    />
  )
}

export function DialogDescription(
  props: React.HTMLAttributes<HTMLParagraphElement>
) {
  const { className, ...rest } = props
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...rest}
    />
  )
}

