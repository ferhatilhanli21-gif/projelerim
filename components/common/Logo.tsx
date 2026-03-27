'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-16',
};

export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 60"
        className={sizes[size]}
        aria-label="Sor Ajans"
      >
        <rect width="200" height="60" rx="4" fill="#DC2626" />
        <text
          x="100"
          y="42"
          textAnchor="middle"
          fill="white"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          fontSize="28"
          letterSpacing="2"
        >
          SOR AJANS
        </text>
      </svg>
    </div>
  );
}
