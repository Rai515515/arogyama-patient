import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9v10a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1V9" />
    </svg>
  );
}

export function CareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2.2" />
      <path d="M9 3.5h6a.6.6 0 0 1 .6.6V6a.6.6 0 0 1-.6.6H9A.6.6 0 0 1 8.4 6V4.1a.6.6 0 0 1 .6-.6Z" />
      <path d="m9 13 2 2 4-4.2" />
    </svg>
  );
}

export function ScheduleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.2" />
      <path d="M4 9.8h16" />
      <path d="M8.3 3.5v3.4M15.7 3.5v3.4" />
      <path d="M8.3 13.3h1.6M11.9 13.3h1.6M15.5 13.3h.9M8.3 16.6h1.6M11.9 16.6h1.6" />
    </svg>
  );
}

export function InsightsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 12 12 5.8" />
      <path d="M12 12 16.8 14.6" />
    </svg>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.3" r="3.6" />
      <path d="M4.8 20c1.1-3.6 4-5.6 7.2-5.6s6.1 2 7.2 5.6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  );
}

export function CircleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.8 21 19.5H3L12 3.8Z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17" r="0.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9.5 5.5 7 6.5-7 6.5" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m5.5 9.5 6.5 7 6.5-7" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}

export function CalendarPlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.2" />
      <path d="M4 9.8h16" />
      <path d="M8.3 3.5v3.4M15.7 3.5v3.4" />
      <path d="M12 12.5v5M9.5 15h5" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 15.5V4.5" />
      <path d="m7.5 9 4.5-4.5L16.5 9" />
      <path d="M5 15.5v3a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-3" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 19 6.3v5.4c0 4.4-3 7.9-7 8.8-4-.9-7-4.4-7-8.8V6.3L12 3.5Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4.8c2.3-.9 4.7-.9 7 0v14.4c-2.3-.9-4.7-.9-7 0Z" />
      <path d="M19 4.8c-2.3-.9-4.7-.9-7 0v14.4c2.3-.9 4.7-.9 7 0Z" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 10.2a6 6 0 0 1 12 0c0 4 1.2 5.4 1.8 6.2H4.2c.6-.8 1.8-2.2 1.8-6.2Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function SyringeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m15.5 4.5 4 4" />
      <path d="m17.5 6.5-9.8 9.8a1.2 1.2 0 0 1-1.7 0l-.8-.8a1.2 1.2 0 0 1 0-1.7l9.8-9.8" />
      <path d="m11 8 1.5 1.5M8.5 10.5 10 12" />
      <path d="m5.2 15.8-2 2 1 1" />
    </svg>
  );
}

export function SupportIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10Z" />
      <path d="M9 11.5h1.6l1-2 1.6 4 1-2H16" />
    </svg>
  );
}

export function GaugeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 16a7.5 7.5 0 1 1 15 0" />
      <path d="m12 16 3.5-4.5" />
      <circle cx="12" cy="16" r="1.2" />
    </svg>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19c0-8 5-13.5 14-14-.5 9-6 14-14 14Z" />
      <path d="M5 19c3-3.5 6-6 9.5-8.5" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7.5 4h2.2l1.4 4-2 1.3a10 10 0 0 0 5.6 5.6l1.3-2 4 1.4v2.2a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 6 5.6 1.5 1.5 0 0 1 7.5 4Z" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function ExitIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4" />
      <path d="M10 8 6 12l4 4M6 12h9" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.6 2.6M15.4 15.4 18 18M6 18l2.6-2.6M15.4 8.6 18 6" />
    </svg>
  );
}

export function BabyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9" r="4.5" />
      <path d="M10.3 9.2h.01M13.7 9.2h.01" />
      <path d="M10.6 11c.8.6 2 .6 2.8 0" />
      <path d="M6.5 20c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5" />
    </svg>
  );
}
