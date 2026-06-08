import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path
                fill="#12803D"
                d="M16 1.75 30.25 16 16 30.25 1.75 16 16 1.75Z"
            />
            <path fill="#0C6A32" d="m16 4.5 11.5 11.5L16 27.5 4.5 16 16 4.5Z" />
            <path fill="#fff" d="M16 7.25 24.75 16 16 24.75 7.25 16 16 7.25Z" />
            <path
                fill="#16A34A"
                d="m16 8.9 7.1 7.1-7.1 7.1-7.1-7.1 7.1-7.1Z"
                opacity=".92"
            />
            <path
                fill="#F97316"
                d="M16.35 8.9c2.1 2.05 3.1 3.96 3.1 5.71 0 1.12-.36 2.08-1.08 2.9-.44.5-.95.9-1.53 1.19.12-.42.18-.83.18-1.24 0-1.2-.48-2.33-1.43-3.41-1 1.06-1.51 2.14-1.51 3.23 0 .48.1.96.3 1.42-.67-.29-1.24-.71-1.7-1.28-.72-.87-1.08-1.87-1.08-3.02 0-1.77.92-3.54 2.77-5.3l1.13-1.08.85.88Z"
            />
            <path
                fill="#EF4444"
                d="M16.08 14.08c1.18 1.08 1.77 2.18 1.77 3.31 0 .96-.34 1.77-1.03 2.42-.68.65-1.48.98-2.39.98-.84 0-1.55-.26-2.12-.77.89-.49 1.6-1.14 2.13-1.95.54-.82.83-1.49.88-2.01.06-.58.31-1.24.76-1.98Z"
                opacity=".9"
            />
            <path
                stroke="#fff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
                d="M10.5 16h11"
            />
            <path
                stroke="#111827"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
                d="m14 16 1.15-1.95L16.4 17.9 17.6 14.8 18.65 16h2.85"
            />
            <path
                fill="#12803D"
                d="M16 1.75 30.25 16 16 30.25 1.75 16 16 1.75Zm0 2.75L4.5 16 16 27.5 27.5 16 16 4.5Z"
            />
        </svg>
    );
}
