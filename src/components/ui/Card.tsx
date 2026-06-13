import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ padding = "md", className = "", children, ...props }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-md border border-noir/7 shadow-sm",
        paddingClasses[padding],
        className,
      ].join(" ")}
      style={{ borderColor: "rgba(13,10,11,0.07)" }}
      {...props}
    >
      {children}
    </div>
  );
}
