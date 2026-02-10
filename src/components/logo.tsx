export function Logo({ className = "w-12 h-12" }: { className?: string }) {
    return (
        <div className={className}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect width="100" height="100" rx="24" fill="url(#logo-grad)" />
                <path d="M30 70L45 50L55 60L75 30" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M75 30H60M75 30V45" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="75" cy="30" r="4" fill="white" />
                <defs>
                    <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10B981" />
                        <stop offset="1" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
