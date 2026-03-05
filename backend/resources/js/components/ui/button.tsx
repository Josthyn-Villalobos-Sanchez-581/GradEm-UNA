import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 🎨 Variantes de estilo personalizadas
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // 🔵 Primario institucional
        default:
          "bg-[#034991] text-white shadow-md hover:bg-[#0563c1] focus:ring-[#034991]/40",
        // ⚫ Secundario gris
        secondary:
          "bg-gray-500 text-white shadow-md hover:bg-gray-700 focus:ring-gray-500/40",
        // 🔴 Peligro
        destructive:
          "bg-[#CD1719] text-white shadow-md hover:bg-[#a21514] focus:ring-[#CD1719]/40",
        // ✅ Exitoso
        success:
          "bg-green-600 text-white shadow-md hover:bg-green-700 focus:ring-green-600/40",
        // 🔲 Bordeado
        outline:
          "border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100 focus:ring-gray-400/40",
        // 👻 Transparente
        ghost:
          "bg-blue-50 hover:bg-blue-100 text-[#034991] focus:ring-gray-400/40",
        // 🔗 Link simple
        link:
          "text-[#034991] underline-offset-4 hover:underline focus:ring-[#034991]/40",
        static:
          "bg-transparent text-inherit shadow-none hover"
      },
      size: {
        sm: "h-8 px-4 text-sm",
        default: "h-10 px-6 text-base",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// 🧱 Componente principal
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
