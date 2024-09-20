import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export interface InputTextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const InputTextarea = React.forwardRef<HTMLTextAreaElement, InputTextareaProps>(
	({ className, ...props }, ref) => {
		// const innerRef = React.useRef<HTMLTextAreaElement>(null);

		// React.useEffect(() => {
		// 	if (innerRef.current) {
		// 		innerRef.current.style.height = "40px";
		// 	}
		// }, [props.value]);

		// React.useImperativeHandle(ref, () => innerRef.current!, []);

		return (
			<Textarea
				{...props}
				ref={ref}
				className={cn(
					className,
				)}
			/>
		);
	},
);
InputTextarea.displayName = "InputTextarea";

export { InputTextarea };
