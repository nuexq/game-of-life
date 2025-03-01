import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

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
	return (
		<CollapsiblePrimitive.CollapsibleContent forceMount {...props}>
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className="overflow-hidden"
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</CollapsiblePrimitive.CollapsibleContent>
	);
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
