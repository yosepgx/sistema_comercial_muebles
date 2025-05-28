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
  const variantStyles =
    variant === "primary"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-green-500 text-white hover:bg-green-600";

  let color;
  if( variant === 'primary'){
    color = "bg-blue-500 text-white hover:bg-blue-600"
  }
  else if( variant === 'green'){
    color = "bg-green-500 text-white hover:bg-green-600"
  }
  else if ( variant === 'red'){
    color ="bg-pink-600 hover:bg-pink-700 text-white"
  }
  else{
    color ="bg-orange-400"
  }


  return (
    <Button className={`${baseStyles} ${variantStyles} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </Button>
  );
}
