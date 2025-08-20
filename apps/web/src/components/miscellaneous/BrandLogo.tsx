import Image from 'next/image';

interface BrandLogoProps {
  src?: string;
  className?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export function BrandLogo({
  src = '/logos/fleet-ai-logo.svg',
  className = '',
  width = 96,
  height = 48,
  onClick,
}: BrandLogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width: 96, height: 48 }}>
      <Image
        onClick={onClick}
        src={src}
        alt="FleetAI Logo"
        fill
        sizes="96px"
        className="object-contain"
        priority
      />
    </div>
  );
}
