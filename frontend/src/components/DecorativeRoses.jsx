const DecorativeRoses = () => {
  return (
    <>
      {/* Left Side Roses */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 pointer-events-none z-10 hidden lg:block">
        <svg
          width="80"
          height="200"
          viewBox="0 0 80 200"
          fill="none"
          className="opacity-60"
        >
          <circle cx="20" cy="40" r="15" fill="hsl(var(--primary))" />
          <circle cx="35" cy="80" r="12" fill="hsl(var(--rose-medium))" />
          <circle cx="15" cy="120" r="18" fill="hsl(var(--primary))" />
          <circle cx="40" cy="160" r="10" fill="hsl(var(--rose-medium))" />
          <ellipse 
            cx="30" 
            cy="50" 
            rx="4" 
            ry="15" 
            fill="hsl(145 40% 35%)" 
            transform="rotate(-20 30 50)" 
          />
          <ellipse 
            cx="25" 
            cy="130" 
            rx="5" 
            ry="18" 
            fill="hsl(145 40% 35%)" 
            transform="rotate(15 25 130)" 
          />
        </svg>
      </div>

      {/* Right Side Roses */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 pointer-events-none z-10 hidden lg:block">
        <svg
          width="80"
          height="200"
          viewBox="0 0 80 200"
          fill="none"
          className="opacity-60"
        >
          <circle cx="60" cy="50" r="16" fill="hsl(var(--primary))" />
          <circle cx="45" cy="90" r="12" fill="hsl(var(--rose-medium))" />
          <circle cx="65" cy="130" r="14" fill="hsl(var(--primary))" />
          <circle cx="50" cy="170" r="11" fill="hsl(var(--rose-medium))" />
          <ellipse 
            cx="55" 
            cy="60" 
            rx="4" 
            ry="16" 
            fill="hsl(145 40% 35%)" 
            transform="rotate(20 55 60)" 
          />
          <ellipse 
            cx="60" 
            cy="140" 
            rx="5" 
            ry="15" 
            fill="hsl(145 40% 35%)" 
            transform="rotate(-15 60 140)" 
          />
        </svg>
      </div>

      {/* Floating Petals */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-4 rounded-full opacity-30 animate-float"
            style={{
              backgroundColor: `hsl(var(--${i % 2 === 0 ? 'primary' : 'rose-medium'}))`,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
              borderRadius: '50% 50% 50% 0',
              transform: `rotate(${45 + i * 20}deg)`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default DecorativeRoses;
