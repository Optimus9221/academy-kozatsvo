import { Link } from "@/i18n/navigation";

interface ButtonProps {
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "outline-dark";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

const variants = {
  primary: "bg-ukraine-yellow text-dark-blue hover:bg-yellow-400",
  secondary: "bg-ukraine-blue text-white hover:bg-blue-800",
  outline:
    "border-2 border-white text-white hover:bg-white/10",
  "outline-dark":
    "border-2 border-ukraine-blue text-ukraine-blue hover:bg-blue-50",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-lg font-semibold transition-colors ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
