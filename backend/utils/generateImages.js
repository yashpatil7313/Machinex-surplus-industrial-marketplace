const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const parts = [
  {
    file: 'siemens-motor.svg',
    title: 'SIEMENS 5 HP MOTOR',
    subtitle: '3.7 kW • 1450 RPM • 415V IE3',
    brand: 'SIEMENS',
    code: '1LE1001-1DB22-2AA4',
    bg: '#0F172A',
    accent: '#00646E',
    iconColor: '#38BDF8',
    category: 'MOTORS & DRIVES',
    icon: `<circle cx="200" cy="140" r="70" fill="none" stroke="#38BDF8" stroke-width="8" stroke-dasharray="8 6"/>
           <circle cx="200" cy="140" r="45" fill="#1E293B" stroke="#0284C7" stroke-width="6"/>
           <rect x="188" y="50" width="24" height="35" rx="4" fill="#38BDF8"/>
           <rect x="188" y="195" width="24" height="35" rx="4" fill="#38BDF8"/>
           <rect x="110" y="128" width="35" height="24" rx="4" fill="#38BDF8"/>
           <rect x="255" y="128" width="35" height="24" rx="4" fill="#38BDF8"/>
           <circle cx="200" cy="140" r="16" fill="#F8FAFC"/>`
  },
  {
    file: 'skf-bearing.svg',
    title: 'SKF BALL BEARING',
    subtitle: '40x80x18 mm • 2RS1 Rubber Seal',
    brand: 'SKF SWEDEN',
    code: '6208-2RS1/C3',
    bg: '#0B132B',
    accent: '#1C3144',
    iconColor: '#60A5FA',
    category: 'INDUSTRIAL BEARINGS',
    icon: `<circle cx="200" cy="140" r="75" fill="none" stroke="#60A5FA" stroke-width="12"/>
           <circle cx="200" cy="140" r="40" fill="#1E293B" stroke="#93C5FD" stroke-width="8"/>
           <circle cx="200" cy="80" r="12" fill="#E2E8F0"/>
           <circle cx="250" cy="110" r="12" fill="#E2E8F0"/>
           <circle cx="250" cy="170" r="12" fill="#E2E8F0"/>
           <circle cx="200" cy="200" r="12" fill="#E2E8F0"/>
           <circle cx="150" cy="170" r="12" fill="#E2E8F0"/>
           <circle cx="150" cy="110" r="12" fill="#E2E8F0"/>`
  },
  {
    file: 'bosch-pump.svg',
    title: 'BOSCH REXROTH PUMP',
    subtitle: 'Axial Piston • 45 cc • 280 bar',
    brand: 'BOSCH REXROTH',
    code: 'A10VSO45DFR1',
    bg: '#18181B',
    accent: '#D97706',
    iconColor: '#F59E0B',
    category: 'HYDRAULIC SYSTEMS',
    icon: `<rect x="130" y="80" width="140" height="120" rx="16" fill="#27272A" stroke="#F59E0B" stroke-width="6"/>
           <circle cx="200" cy="140" r="35" fill="none" stroke="#FBBF24" stroke-width="6"/>
           <line x1="100" y1="140" x2="130" y2="140" stroke="#F59E0B" stroke-width="10" stroke-linecap="round"/>
           <line x1="270" y1="140" x2="300" y2="140" stroke="#F59E0B" stroke-width="10" stroke-linecap="round"/>
           <circle cx="200" cy="140" r="12" fill="#F59E0B"/>`
  },
  {
    file: 'schneider-sensor.svg',
    title: 'SCHNEIDER PROXIMITY SENSOR',
    subtitle: 'M18 PNP Flush • 8mm Sensing',
    brand: 'SCHNEIDER',
    code: 'XS618B1PAL2',
    bg: '#064E3B',
    accent: '#047857',
    iconColor: '#34D399',
    category: 'SENSORS & AUTOMATION',
    icon: `<rect x="120" y="115" width="160" height="50" rx="8" fill="#065F46" stroke="#34D399" stroke-width="5"/>
           <rect x="250" y="110" width="30" height="60" rx="4" fill="#10B981"/>
           <path d="M70 140 C 90 120, 90 160, 115 140" stroke="#6EE7B7" stroke-width="5" fill="none"/>
           <circle cx="295" cy="140" r="5" fill="#F87171"/>`
  },
  {
    file: 'abb-gearbox.svg',
    title: 'ABB HELICAL GEARBOX',
    subtitle: 'Inline 15:1 Ratio • Cast Iron Housing',
    brand: 'ABB',
    code: 'M2BAX 132MLA',
    bg: '#1E1B4B',
    accent: '#4338CA',
    iconColor: '#818CF8',
    category: 'SPEED REDUCERS & GEARS',
    icon: `<polygon points="140,80 260,80 280,180 120,180" fill="#312E81" stroke="#818CF8" stroke-width="6"/>
           <circle cx="170" cy="130" r="24" fill="#1E1B4B" stroke="#A5B4FC" stroke-width="5"/>
           <circle cx="230" cy="130" r="18" fill="#1E1B4B" stroke="#A5B4FC" stroke-width="5"/>
           <rect x="190" y="170" width="20" height="30" fill="#818CF8"/>`
  },
  {
    file: 'parker-valve.svg',
    title: 'PARKER HYDRAULIC VALVE',
    subtitle: '4-Way 3-Pos D03 • 24V DC Solenoid',
    brand: 'PARKER',
    code: 'D1VW001CNJW',
    bg: '#1C1917',
    accent: '#EA580C',
    iconColor: '#FB923C',
    category: 'VALVES & ACTUATORS',
    icon: `<rect x="130" y="90" width="140" height="100" rx="10" fill="#292524" stroke="#FB923C" stroke-width="6"/>
           <rect x="90" y="115" width="40" height="50" rx="4" fill="#C2410C"/>
           <rect x="270" y="115" width="40" height="50" rx="4" fill="#C2410C"/>
           <circle cx="165" cy="140" r="12" fill="#FB923C"/>
           <circle cx="235" cy="140" r="12" fill="#FB923C"/>`
  },
  {
    file: 'mitsubishi-servo.svg',
    title: 'MITSUBISHI SERVO MOTOR',
    subtitle: '1.5 kW • 2000 RPM • 22-Bit Encoder',
    brand: 'MITSUBISHI',
    code: 'HG-SR152',
    bg: '#172554',
    accent: '#1D4ED8',
    iconColor: '#60A5FA',
    category: 'SERVO & MOTION',
    icon: `<rect x="110" y="100" width="160" height="80" rx="8" fill="#1E3A8A" stroke="#60A5FA" stroke-width="6"/>
           <rect x="270" y="125" width="40" height="30" rx="3" fill="#93C5FD"/>
           <rect x="80" y="115" width="30" height="50" rx="4" fill="#3B82F6"/>
           <circle cx="190" cy="140" r="22" fill="#0F172A" stroke="#BFDBFE" stroke-width="4"/>`
  },
  {
    file: 'fag-bearing.svg',
    title: 'FAG ROLLER BEARING',
    subtitle: '75x130x31 mm • Spherical Roller C3',
    brand: 'FAG SCHAEFFLER',
    code: '22215-E1-XL',
    bg: '#0F172A',
    accent: '#0E7490',
    iconColor: '#22D3EE',
    category: 'HEAVY LOAD BEARINGS',
    icon: `<ellipse cx="200" cy="140" rx="80" ry="70" fill="none" stroke="#22D3EE" stroke-width="12"/>
           <ellipse cx="200" cy="140" rx="45" ry="38" fill="#1E293B" stroke="#67E8F9" stroke-width="7"/>
           <rect x="190" y="75" width="20" height="15" rx="3" fill="#A5F3FC"/>
           <rect x="190" y="190" width="20" height="15" rx="3" fill="#A5F3FC"/>
           <rect x="130" y="132" width="15" height="20" rx="3" fill="#A5F3FC"/>
           <rect x="255" y="132" width="15" height="20" rx="3" fill="#A5F3FC"/>`
  },
  {
    file: 'allen-bradley-plc.svg',
    title: 'ALLEN BRADLEY CONTROLLOGIX',
    subtitle: '16-Point 24V DC Digital Input Module',
    brand: 'ROCKWELL / AB',
    code: '1756-IB16',
    bg: '#27272A',
    accent: '#E11D48',
    iconColor: '#FB7185',
    category: 'PLC & INDUSTRIAL CONTROLS',
    icon: `<rect x="140" y="70" width="120" height="140" rx="8" fill="#3F3F46" stroke="#FB7185" stroke-width="6"/>
           <rect x="160" y="90" width="80" height="25" fill="#18181B"/>
           <circle cx="160" cy="135" r="5" fill="#34D399"/>
           <circle cx="180" cy="135" r="5" fill="#34D399"/>
           <circle cx="200" cy="135" r="5" fill="#34D399"/>
           <circle cx="220" cy="135" r="5" fill="#34D399"/>
           <circle cx="240" cy="135" r="5" fill="#34D399"/>
           <circle cx="160" cy="160" r="5" fill="#34D399"/>
           <circle cx="180" cy="160" r="5" fill="#34D399"/>
           <circle cx="200" cy="160" r="5" fill="#34D399"/>
           <circle cx="220" cy="160" r="5" fill="#34D399"/>
           <circle cx="240" cy="160" r="5" fill="#34D399"/>`
  },
  {
    file: 'siemens-contactor.svg',
    title: 'SIEMENS SIRIUS CONTACTOR',
    subtitle: '3-Pole 25A 400V • 24V DC Coil',
    brand: 'SIEMENS',
    code: '3RT2026-1BB40',
    bg: '#042F2E',
    accent: '#0D9488',
    iconColor: '#2DD4BF',
    category: 'ELECTRICAL SWITCHGEAR',
    icon: `<rect x="135" y="75" width="130" height="130" rx="10" fill="#115E59" stroke="#2DD4BF" stroke-width="6"/>
           <rect x="155" y="95" width="90" height="35" rx="4" fill="#134E4A"/>
           <circle cx="165" cy="155" r="8" fill="#F8FAFC"/>
           <circle cx="200" cy="155" r="8" fill="#F8FAFC"/>
           <circle cx="235" cy="155" r="8" fill="#F8FAFC"/>
           <rect x="155" y="180" width="90" height="12" rx="2" fill="#5EEAD4"/>`
  },
  {
    file: 'rexroth-cylinder.svg',
    title: 'REXROTH PNEUMATIC CYLINDER',
    subtitle: 'ISO 15552 • 80mm Bore • 250mm Stroke',
    brand: 'BOSCH REXROTH',
    code: 'PRA-DA-080-0250',
    bg: '#18181B',
    accent: '#475569',
    iconColor: '#94A3B8',
    category: 'PNEUMATICS',
    icon: `<rect x="100" y="105" width="170" height="70" rx="8" fill="#334155" stroke="#94A3B8" stroke-width="6"/>
           <rect x="270" y="130" width="60" height="20" rx="3" fill="#CBD5E1"/>
           <circle cx="130" cy="120" r="6" fill="#38BDF8"/>
           <circle cx="240" cy="120" r="6" fill="#38BDF8"/>`
  },
  {
    file: 'thk-guideway.svg',
    title: 'THK LINEAR MOTION GUIDE',
    subtitle: 'HSR25 Rail & Block Set • 1200mm Length',
    brand: 'THK JAPAN',
    code: 'HSR25R2SS+1200L',
    bg: '#0F172A',
    accent: '#334155',
    iconColor: '#38BDF8',
    category: 'CNC & LINEAR MOTION',
    icon: `<rect x="70" y="135" width="260" height="20" rx="4" fill="#475569" stroke="#94A3B8" stroke-width="3"/>
           <rect x="150" y="100" width="100" height="50" rx="6" fill="#1E293B" stroke="#38BDF8" stroke-width="6"/>
           <circle cx="180" cy="125" r="6" fill="#F59E0B"/>
           <circle cx="220" cy="125" r="6" fill="#F59E0B"/>`
  },
  {
    file: 'grundfos-pump.svg',
    title: 'GRUNDFOS CR 15-3 PUMP',
    subtitle: 'Vertical Multistage • 4 kW • Stainless Steel',
    brand: 'GRUNDFOS',
    code: 'CR 15-3 A-F-A-E',
    bg: '#082F49',
    accent: '#0284C7',
    iconColor: '#38BDF8',
    category: 'INDUSTRIAL PUMPS',
    icon: `<rect x="155" y="60" width="90" height="80" rx="8" fill="#0C4A6E" stroke="#38BDF8" stroke-width="6"/>
           <rect x="165" y="140" width="70" height="80" rx="4" fill="#0369A1" stroke="#7DD3FC" stroke-width="5"/>
           <rect x="130" y="210" width="140" height="20" rx="4" fill="#0284C7"/>`
  }
];

parts.forEach(p => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
    <defs>
      <linearGradient id="grad_${p.file.replace(/[^a-z0-9]/gi, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.bg}"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="400" height="300" fill="url(#grad_${p.file.replace(/[^a-z0-9]/gi, '')})"/>
    <rect width="400" height="300" fill="url(#grid)"/>
    
    <!-- Top badge -->
    <rect x="24" y="20" width="150" height="24" rx="12" fill="rgba(255,255,255,0.1)"/>
    <text x="34" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#94A3B8" letter-spacing="1">${p.category}</text>
    
    <text x="376" y="36" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#F8FAFC" letter-spacing="1.5">${p.brand}</text>

    <!-- Industrial Graphic -->
    <g>
      ${p.icon}
    </g>

    <!-- Bottom Specs Strip -->
    <rect x="16" y="232" width="368" height="54" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <text x="30" y="254" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#F8FAFC">${p.title}</text>
    <text x="30" y="272" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" fill="#94A3B8">${p.subtitle}</text>
    <text x="370" y="264" text-anchor="end" font-family="monospace" font-size="11" font-weight="600" fill="${p.iconColor}">${p.code}</text>
  </svg>`;

  fs.writeFileSync(path.join(uploadsDir, p.file), svg, 'utf8');
  // Also create a fallback .jpg name pointing to same SVG content so both extensions work
  const jpgFile = p.file.replace('.svg', '.jpg');
  fs.writeFileSync(path.join(uploadsDir, jpgFile), svg, 'utf8');
});

console.log(`Generated ${parts.length} industrial part images successfully!`);
