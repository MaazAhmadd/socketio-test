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
	return inline ? (
		<span
			onClick={onClick}
			className={cn(
				"gradient-text animate-gradient select-none font-Scripto font-medium text-4xl text-transparent",
				className,
			)}
		>
			{children}
		</span>
	) : (
		<p
			onClick={onClick}
			className={cn(
				"gradient-text animate-gradient select-none font-Scripto font-medium text-4xl text-transparent",
				className,
			)}
		>
			{children}
		</p>
	);
};
