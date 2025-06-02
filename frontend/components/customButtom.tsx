import { Button } from "@/components/ui/button";

interface CustomButtonProps {
  variant?: "primary" | "green" | "red" | "orange";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function CustomButton({ variant = "primary", children, onClick, type ,disabled }: CustomButtonProps) {
  const baseStyles = "px-4 py-2 rounded font-semibold transition";

  const variantMap: Record<string, string> = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    green: "bg-green-500 text-white hover:bg-green-600",
    red: "bg-pink-600 hover:bg-pink-700 text-white",
    orange: "bg-orange-400",
  };

  const variantStyles = variantMap[variant] || variantMap["primary"];

  return (
    <Button className={`${baseStyles} ${variantStyles} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </Button>
  );
}
