import { ShieldCheck } from "lucide-react";
import "./BrandLogo.css";

export default function BrandLogo({ className = "", iconSize = 24 }) {
  return (
    <span className={`brand-logo ${className}`.trim()} aria-label="Breach Radar">
      <ShieldCheck size={iconSize} strokeWidth={2.2} />
      <strong>Breach Radar</strong>
    </span>
  );
}
