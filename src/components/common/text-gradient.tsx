import { cn } from "@/lib/utils";

export const TextGradient = ({
	children,
	onClick,
	className,
	inline = false,
}: {
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
	inline?: boolean;
}) => {
	if (inline) {
		return (
			<span
				onClick={onClick}
				className={cn(
					"gradient-text animate-gradient font-Scripto font-medium text-4xl text-transparent",
					// "font-Scripto bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-lime-500",
					className,
				)}
			>
				{children}
			</span>
		);
	}
	return (
		<p
			onClick={onClick}
			className={cn(
				"gradient-text animate-gradient font-Scripto font-medium text-4xl text-transparent",
				// "font-Scripto bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-lime-500",
				className,
			)}
		>
			{children}
		</p>
	);
};
