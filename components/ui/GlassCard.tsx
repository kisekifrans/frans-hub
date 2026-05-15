import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "a";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function GlassCard({
  children,
  className,
  as: Tag = "div",
  hover = false,
  padding = "md",
  href,
  onClick,
}: GlassCardProps) {
  const classes = cn(
    "glass-card rounded-2xl border",
    hover &&
      "transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 dark:hover:brightness-110",
    paddingMap[padding],
    className,
  );

  if (Tag === "a" && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={cn(classes, "block no-underline")}
      >
        {children}
      </a>
    );
  }

  return (
    <Tag className={classes} onClick={onClick}>
      {children}
    </Tag>
  );
}
