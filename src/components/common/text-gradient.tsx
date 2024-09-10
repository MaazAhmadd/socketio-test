import { cn } from "@/lib/utils";

export const TextGradient = ({
	children,
	className,
	inline = false,
	...props
}: {
	children?: React.ReactNode;
	className?: string;
	inline?: boolean;
}) => {
	if (inline) {
		return (
			<span
				className={cn(
					"gradient-text animate-gradient font-Scripto text-4xl font-medium text-transparent",
					// "font-Scripto bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-lime-500",
					className,
				)}
				{...props}
			>
				{children}
			</span>
		);
	}
	return (
		<p
			className={cn(
				"gradient-text animate-gradient font-Scripto text-4xl font-medium text-transparent",
				// "font-Scripto bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-lime-500",
				className,
			)}
			{...props}
		>
			{children}
		</p>
	);
};
