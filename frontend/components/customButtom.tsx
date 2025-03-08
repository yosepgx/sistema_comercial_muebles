import { Button } from "@/components/ui/button";

interface CustomButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function CustomButton({ variant = "primary", children, onClick, type ,disabled }: CustomButtonProps) {
  const baseStyles = "px-4 py-2 rounded font-semibold transition";
  const variantStyles =
    variant === "primary"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-green-500 text-white hover:bg-green-600";

  return (
    <Button className={`${baseStyles} ${variantStyles} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </Button>
  );
}
