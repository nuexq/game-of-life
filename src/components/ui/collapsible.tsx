import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { motion, AnimatePresence } from "framer-motion";
import React, { useLayoutEffect, useRef, useState } from "react";

function Collapsible({
  open,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
  children: React.ReactNode;
}) {
  return (
    <CollapsiblePrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === CollapsibleContent) {
          return React.cloneElement(child, { open } as React.ComponentProps<
            typeof CollapsibleContent
          >);
        }
        return child;
      })}
    </CollapsiblePrimitive.Root>
  );
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger {...props} />;
}

function CollapsibleContent({
  open,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent> & {
  open?: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (open && contentRef.current) {
      const newHeight = contentRef.current.scrollHeight;
      setHeight(newHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <CollapsiblePrimitive.CollapsibleContent forceMount {...props}>
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, borderTopWidth: 0 }}
            animate={{ opacity: 1, height, borderTopWidth: 1 }}
            exit={{ opacity: 0, height: 0, borderTopWidth: 0 }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 30,
              mass: 0.5,
              restDelta: 0.1,
            }}
            className="overflow-hidden will-change-[height] contain-strict border-border space-y-2 px-5 py-3"
            ref={contentRef}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </CollapsiblePrimitive.CollapsibleContent>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
