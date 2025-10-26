import * as React from "react";

export function TrashIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Trash (filled) path */}
      <path d="M9 3h6a1 1 0 0 1 1 1v1h2a1 1 0 0 1 0 2h-1l-1 12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L3 7H2a1 1 0 1 1 0-2h2V4a1 1 0 0 1 1-1h1zm2 4v10h2V7h-2z" />
    </svg>
  );
}
