export function Logo({ className = "w-12 h-12" }: { className?: string }) {
    return (
        <div className={className}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                <style>
                    {`
                        @keyframes flowly-float {
                            0%, 100% { transform: translateY(0px) rotate(0deg); }
                            33% { transform: translateY(-2px) rotate(0.5deg); }
                            66% { transform: translateY(1px) rotate(-0.5deg); }
                        }
                        @keyframes flowly-draw {
                            0% { stroke-dashoffset: 100; opacity: 0; }
                            50% { opacity: 1; }
                            100% { stroke-dashoffset: 0; opacity: 1; }
                        }
                        @keyframes flowly-morph {
                            0%, 100% { d: path("M30 40C30 40 50 35 60 45C70 55 70 70 85 75"); }
                            50% { d: path("M30 45C30 45 50 40 60 50C70 60 70 75 85 80"); }
                        }
                        .animate-flowly-bg { 
                            animation: flowly-float 6s ease-in-out infinite;
                            transform-origin: center;
                        }
                        .animate-flowly-path { 
                            stroke-dasharray: 100;
                            animation: flowly-draw 3s ease-out forwards;
                        }
                        .animate-flowly-wave {
                            animation: flowly-morph 8s ease-in-out infinite;
                        }
                    `}
                </style>
                <rect width="100" height="100" rx="30" fill="url(#flowly-grad-emerald)" className="animate-flowly-bg" />

                {/* Secondary Flow Path */}
                <path
                    d="M20 55C20 55 40 50 50 60C60 70 60 85 75 90"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-20 animate-flowly-path"
                    style={{ animationDelay: '0.5s' }}
                />

                {/* Main Flow Wave */}
                <path
                    d="M30 40C30 40 50 35 60 45C70 55 70 70 85 75"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-flowly-path animate-flowly-wave"
                    style={{ animationDelay: '0.2s' }}
                />

                {/* Highlight Pulse */}
                <circle cx="75" cy="25" r="4" fill="white" className="opacity-40">
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
                </circle>
                <defs>
                    <linearGradient id="flowly-grad-emerald" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10B981" />
                        <stop offset="1" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
