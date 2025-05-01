import { Children } from "react"
import Navbar from "./navbar";

export default function MainWrap({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <>
      <Navbar/>
      <div className="ml-10 mr-6 mt-4">
        {children}
      </div>
    </>
  );
}