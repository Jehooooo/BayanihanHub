import os

output_dir = r"c:\Users\Jeho\Downloads\BayanihanHubAfter\figma-admin-wireframes"
os.makedirs(output_dir, exist_ok=True)

def get_sidebar_svg(active_index=0):
    nav_items = [
        ("Dashboard", "LayoutDashboard"),
        ("Identity Approvals", "ShieldCheck"),
        ("Users Directory", "Users"),
        ("Post Moderation", "Package"),
        ("Community Requests", "HandHeart"),
        ("Reports & Logs", "AlertOctagon"),
        ("Categories", "FolderTree"),
        ("System Terminal", "Terminal")
    ]
    
    items_svg = ""
    y = 120
    for idx, (label, icon) in enumerate(nav_items):
        is_active = (idx == active_index)
        bg = "fill=\"#2E7D32\"" if is_active else "fill=\"transparent\""
        text_color = "#FFFFFF" if is_active else "#94A3B8"
        font_weight = "bold" if is_active else "500"
        badge = ""
        if idx == 1:
            badge = f'<rect x="200" y="{y+8}" width="24" height="18" rx="9" fill="#E11D48"/><text x="212" y="{y+20}" fill="#FFF" font-size="10" font-weight="bold" text-anchor="middle">14</text>'
        elif idx == 5:
            badge = f'<rect x="200" y="{y+8}" width="20" height="18" rx="9" fill="#F59E0B"/><text x="210" y="{y+20}" fill="#FFF" font-size="10" font-weight="bold" text-anchor="middle">3</text>'
            
        items_svg += f'''
        <g transform="translate(16, {y})">
            <rect x="0" y="0" width="228" height="38" rx="8" {bg} />
            <circle cx="20" cy="19" r="6" fill="{text_color}" opacity="0.6"/>
            <text x="36" y="24" fill="{text_color}" font-size="13" font-weight="{font_weight}" font-family="Inter, sans-serif">{label}</text>
        </g>
        {badge}
        '''
        y += 46

    return f'''
    <!-- Left Sticky Sidebar -->
    <rect x="0" y="0" width="260" height="960" fill="#0F172A" />
    <g transform="translate(24, 28)">
        <rect x="0" y="0" width="36" height="36" rx="8" fill="#2E7D32" />
        <path d="M18 8 L8 18 L12 18 L12 28 L24 28 L24 18 L28 18 Z" fill="#FFFFFF"/>
        <text x="48" y="20" fill="#FFFFFF" font-size="16" font-weight="bold" font-family="Inter, sans-serif">Bayanihan Hub</text>
        <text x="48" y="34" fill="#2E7D32" font-size="10" font-weight="bold" letter-spacing="1.5" font-family="Inter, sans-serif">ADMIN PORTAL</text>
    </g>
    <line x1="20" y1="88" x2="240" y2="88" stroke="#1E293B" stroke-width="1"/>
    {items_svg}
    
    <!-- Admin User Badge at Bottom -->
    <g transform="translate(16, 880)">
        <rect x="0" y="0" width="228" height="60" rx="10" fill="#1E293B" />
        <circle cx="28" cy="30" r="16" fill="#2E7D32" />
        <text x="28" y="34" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">JB</text>
        <text x="54" y="26" fill="#FFFFFF" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Jehosue Biscarra</text>
        <text x="54" y="42" fill="#94A3B8" font-size="11" font-family="Inter, sans-serif">Lead Admin • DMMMSU</text>
    </g>
    '''

def get_header_svg(breadcrumb="Admin / Overview"):
    return f'''
    <!-- Top App Bar -->
    <rect x="260" y="0" width="1180" height="68" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
    <text x="290" y="38" fill="#64748B" font-size="13" font-family="Inter, sans-serif">{breadcrumb}</text>
    
    <!-- Search Bar -->
    <g transform="translate(780, 16)">
        <rect x="0" y="0" width="280" height="36" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
        <circle cx="16" cy="18" r="5" stroke="#94A3B8" stroke-width="1.5" fill="none"/>
        <line x1="20" y1="22" x2="25" y2="27" stroke="#94A3B8" stroke-width="1.5"/>
        <text x="34" y="22" fill="#94A3B8" font-size="12" font-family="Inter, sans-serif">Quick search...</text>
    </g>
    
    <!-- Status / Notification -->
    <g transform="translate(1080, 18)">
        <rect x="0" y="0" width="120" height="32" rx="16" fill="#DCFCE7" stroke="#86EFAC" stroke-width="1"/>
        <circle cx="14" cy="16" r="4" fill="#16A34A"/>
        <text x="26" y="20" fill="#166534" font-size="11" font-weight="bold" font-family="Inter, sans-serif">System Live</text>
        <circle cx="100" cy="16" r="10" fill="#F1F5F9"/>
        <circle cx="106" cy="10" r="4" fill="#EF4444"/>
    </g>
    '''

# =========================================================================
# A2: Identity Approvals Queue
# =========================================================================
def generate_a2_svg():
    sidebar = get_sidebar_svg(1)
    header = get_header_svg("Admin / Identity Verification Queue")
    
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960">
    <rect width="1440" height="960" fill="#F1F5F3" />
    {sidebar}
    {header}
    
    <g transform="translate(290, 96)">
        <!-- Title & Subtitle -->
        <text x="0" y="24" fill="#0F172A" font-size="24" font-weight="bold" font-family="Inter, sans-serif">Identity Approvals &amp; KYC Verification</text>
        <text x="0" y="44" fill="#64748B" font-size="13" font-family="Inter, sans-serif">Verify community residents through Philippine government IDs and biometric selfie match.</text>
        
        <!-- Tabs & Privacy Shield Bar -->
        <g transform="translate(0, 60)">
            <!-- Tabs -->
            <rect x="0" y="0" width="150" height="38" rx="8" fill="#2E7D32"/>
            <text x="75" y="24" fill="#FFFFFF" font-size="13" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">Pending Review (14)</text>
            
            <rect x="160" y="0" width="120" height="38" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="220" y="24" fill="#64748B" font-size="13" font-weight="500" text-anchor="middle" font-family="Inter, sans-serif">Approved (142)</text>
            
            <rect x="290" y="0" width="110" height="38" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="345" y="24" fill="#64748B" font-size="13" font-weight="500" text-anchor="middle" font-family="Inter, sans-serif">Rejected (8)</text>
            
            <!-- Privacy Shield Active Indicator -->
            <rect x="740" y="0" width="370" height="38" rx="8" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1"/>
            <circle cx="760" cy="19" r="7" fill="#2563EB"/>
            <text x="774" y="24" fill="#1E40AF" font-size="12" font-weight="bold" font-family="Inter, sans-serif">Privacy Shield Active</text>
            <text x="910" y="24" fill="#3B82F6" font-size="11" font-family="Inter, sans-serif">• Face &amp; ID Blurred</text>
            <rect x="1030" y="6" width="70" height="26" rx="6" fill="#2563EB"/>
            <text x="1065" y="23" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">Toggle</text>
        </g>
        
        <!-- Main Verification Review Workspace (Left: 740px, Right Queue: 350px) -->
        <g transform="translate(0, 116)">
            <!-- Main Candidate Review Card -->
            <rect x="0" y="0" width="730" height="660" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            
            <!-- Applicant Header Profile -->
            <g transform="translate(24, 24)">
                <circle cx="28" cy="28" r="28" fill="#2E7D32"/>
                <text x="28" y="35" fill="#FFF" font-size="18" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">JD</text>
                <text x="70" y="24" fill="#0F172A" font-size="18" font-weight="bold" font-family="Inter, sans-serif">Juan Dela Cruz</text>
                <rect x="210" y="8" width="100" height="22" rx="11" fill="#FEF3C7"/>
                <text x="260" y="23" fill="#92400E" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">PhilID National ID</text>
                
                <text x="70" y="44" fill="#64748B" font-size="12" font-family="Inter, sans-serif">📍 Barangay San Nicolas, Agoo, La Union • Submitted 18 mins ago</text>
                <text x="70" y="60" fill="#64748B" font-size="12" font-family="Inter, sans-serif">📧 juan.delacruz@gmail.com • 📞 +63 917 123 4567</text>
            </g>
            <line x1="24" y1="100" x2="706" y2="100" stroke="#F1F5F9" stroke-width="1"/>
            
            <!-- Side-by-Side Comparison Container -->
            <g transform="translate(24, 116)">
                <!-- Left: Government ID Document Viewer -->
                <g transform="translate(0, 0)">
                    <rect x="0" y="0" width="330" height="280" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4"/>
                    <rect x="12" y="12" width="306" height="190" rx="8" fill="#E2E8F0"/>
                    <!-- Blurred ID mock elements -->
                    <rect x="28" y="32" width="60" height="70" rx="4" fill="#94A3B8" opacity="0.6"/>
                    <rect x="100" y="36" width="160" height="12" rx="3" fill="#94A3B8" opacity="0.6"/>
                    <rect x="100" y="56" width="120" height="10" rx="3" fill="#94A3B8" opacity="0.4"/>
                    <rect x="100" y="74" width="140" height="10" rx="3" fill="#94A3B8" opacity="0.4"/>
                    <!-- Privacy Shield Overlay Stamp -->
                    <rect x="60" y="90" width="190" height="32" rx="6" fill="#0F172A" opacity="0.85"/>
                    <text x="155" y="111" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">🔒 PRIVACY SHIELD BLUR</text>
                    
                    <!-- ID Metadata under viewer -->
                    <text x="12" y="224" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Document: PhilID Front Card</text>
                    <text x="12" y="242" fill="#64748B" font-size="11" font-family="Inter, sans-serif">ID No: ••••-••••-4821 (Verified Checksum)</text>
                    <rect x="220" y="214" width="98" height="24" rx="4" fill="#E2E8F0"/>
                    <text x="269" y="230" fill="#334155" font-size="10" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">View Back Card</text>
                </g>
                
                <!-- Right: Biometric Live Selfie Viewer -->
                <g transform="translate(352, 0)">
                    <rect x="0" y="0" width="330" height="280" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4"/>
                    <rect x="12" y="12" width="306" height="190" rx="8" fill="#E2E8F0"/>
                    <!-- Oval face guide -->
                    <ellipse cx="165" cy="100" rx="55" ry="70" fill="#94A3B8" opacity="0.5"/>
                    <!-- Privacy Shield Overlay Stamp -->
                    <rect x="60" y="90" width="190" height="32" rx="6" fill="#0F172A" opacity="0.85"/>
                    <text x="155" y="111" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">🔒 PRIVACY SHIELD BLUR</text>
                    
                    <!-- Match Score Pill -->
                    <rect x="12" y="212" width="130" height="26" rx="13" fill="#DCFCE7" stroke="#86EFAC" stroke-width="1"/>
                    <text x="77" y="229" fill="#166534" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">✓ 96.4% Face Match</text>
                    <text x="12" y="255" fill="#64748B" font-size="11" font-family="Inter, sans-serif">Captured via Live Browser Camera</text>
                </g>
            </g>
            
            <!-- Resident Verification Checklist -->
            <g transform="translate(24, 420)">
                <rect x="0" y="0" width="682" height="100" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                <text x="16" y="24" fill="#0F172A" font-size="12" font-weight="bold" font-family="Inter, sans-serif">Automated Security Pre-Check</text>
                <text x="16" y="48" fill="#166534" font-size="12" font-family="Inter, sans-serif">✓ ID Expiration Valid (Expires 2031)</text>
                <text x="16" y="68" fill="#166534" font-size="12" font-family="Inter, sans-serif">✓ Barangay San Nicolas Boundary Confirmed</text>
                <text x="340" y="48" fill="#166534" font-size="12" font-family="Inter, sans-serif">✓ Zero Prior Disciplinary Flagged Reports</text>
                <text x="340" y="68" fill="#166534" font-size="12" font-family="Inter, sans-serif">✓ Liveness Biometrics Pass (No Static Spoof)</text>
            </g>
            
            <!-- Action Execution Buttons Bar -->
            <g transform="translate(24, 546)">
                <!-- Approve Button (Primary Green) -->
                <rect x="0" y="0" width="260" height="46" rx="8" fill="#2E7D32"/>
                <text x="130" y="28" fill="#FFFFFF" font-size="14" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">✓ Approve &amp; Activate Neighbor</text>
                
                <!-- Reject Button (Red Outline) -->
                <rect x="280" y="0" width="200" height="46" rx="8" fill="#FFFFFF" stroke="#DC2626" stroke-width="1.5"/>
                <text x="380" y="28" fill="#DC2626" font-size="13" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">✕ Reject with Reason</text>
                
                <!-- Request Re-upload (Amber) -->
                <rect x="500" y="0" width="182" height="46" rx="8" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5"/>
                <text x="591" y="28" fill="#D97706" font-size="13" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">↻ Request Re-upload</text>
            </g>
        </g>
        
        <!-- Right Queue Column (350px) -->
        <g transform="translate(750, 116)">
            <rect x="0" y="0" width="360" height="660" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="20" y="32" fill="#0F172A" font-size="15" font-weight="bold" font-family="Inter, sans-serif">Pending Review Queue (14)</text>
            <text x="20" y="50" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Select applicant to load dossier</text>
            
            <!-- Queue Item 1 (Selected) -->
            <g transform="translate(16, 70)">
                <rect x="0" y="0" width="328" height="74" rx="8" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.5"/>
                <circle cx="28" cy="37" r="18" fill="#2E7D32"/>
                <text x="28" y="42" fill="#FFF" font-size="12" font-weight="bold" text-anchor="middle">JD</text>
                <text x="56" y="30" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Juan Dela Cruz (Active)</text>
                <text x="56" y="46" fill="#64748B" font-size="11" font-family="Inter, sans-serif">PhilID • San Nicolas</text>
                <rect x="250" y="24" width="66" height="20" rx="10" fill="#DCFCE7"/>
                <text x="283" y="38" fill="#166534" font-size="10" font-weight="bold" text-anchor="middle">Reviewing</text>
            </g>
            
            <!-- Queue Item 2 -->
            <g transform="translate(16, 154)">
                <rect x="0" y="0" width="328" height="74" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                <circle cx="28" cy="37" r="18" fill="#2563EB"/>
                <text x="28" y="42" fill="#FFF" font-size="12" font-weight="bold" text-anchor="middle">MS</text>
                <text x="56" y="30" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Maria Santos</text>
                <text x="56" y="46" fill="#64748B" font-size="11" font-family="Inter, sans-serif">Driver's License • San Antonio</text>
                <text x="56" y="60" fill="#94A3B8" font-size="10" font-family="Inter, sans-serif">Submitted 32m ago</text>
            </g>
            
            <!-- Queue Item 3 -->
            <g transform="translate(16, 238)">
                <rect x="0" y="0" width="328" height="74" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                <circle cx="28" cy="37" r="18" fill="#D97706"/>
                <text x="28" y="42" fill="#FFF" font-size="12" font-weight="bold" text-anchor="middle">CR</text>
                <text x="56" y="30" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Carlo Reyes</text>
                <text x="56" y="46" fill="#64748B" font-size="11" font-family="Inter, sans-serif">Barangay ID • Santa Barbara</text>
                <text x="56" y="60" fill="#94A3B8" font-size="10" font-family="Inter, sans-serif">Submitted 1h ago</text>
            </g>
            
            <!-- Queue Item 4 -->
            <g transform="translate(16, 322)">
                <rect x="0" y="0" width="328" height="74" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                <circle cx="28" cy="37" r="18" fill="#9333EA"/>
                <text x="28" y="42" fill="#FFF" font-size="12" font-weight="bold" text-anchor="middle">AD</text>
                <text x="56" y="30" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Ana Dizon</text>
                <text x="56" y="46" fill="#64748B" font-size="11" font-family="Inter, sans-serif">Voter's ID • San Nicolas</text>
                <text x="56" y="60" fill="#94A3B8" font-size="10" font-family="Inter, sans-serif">Submitted 2h ago</text>
            </g>
        </g>
    </g>
</svg>'''

# =========================================================================
# A3: Manage Users Directory + Suspension Modal
# =========================================================================
def generate_a3_svg():
    sidebar = get_sidebar_svg(2)
    header = get_header_svg("Admin / User Management Directory")
    
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960">
    <rect width="1440" height="960" fill="#F1F5F3" />
    {sidebar}
    {header}
    
    <g transform="translate(290, 96)">
        <text x="0" y="24" fill="#0F172A" font-size="24" font-weight="bold" font-family="Inter, sans-serif">Community Resident Directory &amp; Moderation</text>
        <text x="0" y="44" fill="#64748B" font-size="13" font-family="Inter, sans-serif">View, filter, manage account roles, and enforce disciplinary bans or warnings.</text>
        
        <!-- Search, Filter & Actions Bar -->
        <g transform="translate(0, 64)">
            <rect x="0" y="0" width="380" height="40" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
            <text x="16" y="25" fill="#94A3B8" font-size="13" font-family="Inter, sans-serif">🔍 Search by name, email, or barangay...</text>
            
            <rect x="400" y="0" width="150" height="40" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
            <text x="416" y="25" fill="#334155" font-size="13" font-family="Inter, sans-serif">Role: All Roles ▾</text>
            
            <rect x="565" y="0" width="160" height="40" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
            <text x="581" y="25" fill="#334155" font-size="13" font-family="Inter, sans-serif">Status: All Status ▾</text>
            
            <rect x="970" y="0" width="140" height="40" rx="8" fill="#0F172A"/>
            <text x="1040" y="25" fill="#FFFFFF" font-size="13" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">+ Add Administrator</text>
        </g>
        
        <!-- Users Data Table Container -->
        <g transform="translate(0, 124)">
            <rect x="0" y="0" width="1110" height="520" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            
            <!-- Table Header -->
            <rect x="16" y="16" width="1078" height="40" rx="6" fill="#F8FAFC"/>
            <text x="32" y="41" fill="#64748B" font-size="12" font-weight="bold" font-family="Inter, sans-serif">RESIDENT NAME</text>
            <text x="240" y="41" fill="#64748B" font-size="12" font-weight="bold" font-family="Inter, sans-serif">EMAIL ADDRESS</text>
            <text x="440" y="41" fill="#64748B" font-size="12" font-weight="bold" font-family="Inter, sans-serif">BARANGAY</text>
            <text x="620" y="41" fill="#64748B" font-size="12" font-weight="bold" font-family="Inter, sans-serif">ROLE</text>
            <text x="740" y="41" fill="#64748B" font-size="12" font-weight="bold" font-family="Inter, sans-serif">ACCOUNT STATUS</text>
            <text x="890" y="41" fill="#64748B" font-size="12" font-weight="bold" font-family="Inter, sans-serif">TRUST RATING</text>
            <text x="1030" y="41" fill="#64748B" font-size="12" font-weight="bold" font-family="Inter, sans-serif">ACTIONS</text>
            
            <!-- Table Row 1 -->
            <line x1="16" y1="110" x2="1094" y2="110" stroke="#F1F5F9" stroke-width="1"/>
            <circle cx="44" cy="85" r="16" fill="#2E7D32"/>
            <text x="44" y="90" fill="#FFF" font-size="11" font-weight="bold" text-anchor="middle">JD</text>
            <text x="70" y="86" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Juan Dela Cruz</text>
            <text x="70" y="100" fill="#64748B" font-size="10" font-family="Inter, sans-serif">Joined Sep 2026</text>
            <text x="240" y="90" fill="#475569" font-size="12" font-family="Inter, sans-serif">juan.delacruz@gmail.com</text>
            <text x="440" y="90" fill="#475569" font-size="12" font-family="Inter, sans-serif">San Nicolas, Agoo</text>
            <rect x="615" y="78" width="70" height="22" rx="4" fill="#F1F5F9"/>
            <text x="650" y="93" fill="#475569" font-size="11" font-weight="600" text-anchor="middle" font-family="Inter, sans-serif">Neighbor</text>
            <rect x="735" y="78" width="84" height="22" rx="11" fill="#DCFCE7"/>
            <text x="777" y="93" fill="#166534" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">✓ Active</text>
            <text x="890" y="90" fill="#D97706" font-size="12" font-weight="bold" font-family="Inter, sans-serif">★ 4.9 (18 reviews)</text>
            <text x="1045" y="90" fill="#64748B" font-size="18" font-weight="bold" font-family="Inter, sans-serif">•••</text>
            
            <!-- Table Row 2 -->
            <line x1="16" y1="164" x2="1094" y2="164" stroke="#F1F5F9" stroke-width="1"/>
            <circle cx="44" cy="137" r="16" fill="#2563EB"/>
            <text x="44" y="142" fill="#FFF" font-size="11" font-weight="bold" text-anchor="middle">MS</text>
            <text x="70" y="138" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Maria Santos</text>
            <text x="70" y="152" fill="#64748B" font-size="10" font-family="Inter, sans-serif">Joined Aug 2026</text>
            <text x="240" y="142" fill="#475569" font-size="12" font-family="Inter, sans-serif">maria.s@yahoo.com</text>
            <text x="440" y="142" fill="#475569" font-size="12" font-family="Inter, sans-serif">San Antonio, Agoo</text>
            <rect x="615" y="130" width="70" height="22" rx="4" fill="#F1F5F9"/>
            <text x="650" y="145" fill="#475569" font-size="11" font-weight="600" text-anchor="middle" font-family="Inter, sans-serif">Neighbor</text>
            <rect x="735" y="130" width="84" height="22" rx="11" fill="#DCFCE7"/>
            <text x="777" y="145" fill="#166534" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">✓ Active</text>
            <text x="890" y="142" fill="#D97706" font-size="12" font-weight="bold" font-family="Inter, sans-serif">★ 5.0 (34 reviews)</text>
            <text x="1045" y="142" fill="#64748B" font-size="18" font-weight="bold" font-family="Inter, sans-serif">•••</text>
            
            <!-- Table Row 3 (Suspended Resident) -->
            <line x1="16" y1="218" x2="1094" y2="218" stroke="#F1F5F9" stroke-width="1"/>
            <circle cx="44" cy="191" r="16" fill="#DC2626"/>
            <text x="44" y="196" fill="#FFF" font-size="11" font-weight="bold" text-anchor="middle">CR</text>
            <text x="70" y="192" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Carlo Reyes (Flagged)</text>
            <text x="70" y="206" fill="#DC2626" font-size="10" font-weight="bold" font-family="Inter, sans-serif">Suspension Active (7 Days)</text>
            <text x="240" y="196" fill="#475569" font-size="12" font-family="Inter, sans-serif">carlo99@gmail.com</text>
            <text x="440" y="196" fill="#475569" font-size="12" font-family="Inter, sans-serif">Santa Barbara, Agoo</text>
            <rect x="615" y="184" width="70" height="22" rx="4" fill="#F1F5F9"/>
            <text x="650" y="199" fill="#475569" font-size="11" font-weight="600" text-anchor="middle" font-family="Inter, sans-serif">Neighbor</text>
            <rect x="735" y="184" width="84" height="22" rx="11" fill="#FEE2E2"/>
            <text x="777" y="199" fill="#991B1B" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">✕ Suspended</text>
            <text x="890" y="196" fill="#64748B" font-size="12" font-weight="bold" font-family="Inter, sans-serif">★ 2.1 (Flagged)</text>
            <text x="1045" y="196" fill="#64748B" font-size="18" font-weight="bold" font-family="Inter, sans-serif">•••</text>
            
            <!-- Table Row 4 (Admin Account) -->
            <line x1="16" y1="272" x2="1094" y2="272" stroke="#F1F5F9" stroke-width="1"/>
            <circle cx="44" cy="245" r="16" fill="#0F172A"/>
            <text x="44" y="250" fill="#FFF" font-size="11" font-weight="bold" text-anchor="middle">AD</text>
            <text x="70" y="246" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Ana Dizon (Barangay Officer)</text>
            <text x="70" y="260" fill="#64748B" font-size="10" font-family="Inter, sans-serif">Joined Jul 2026</text>
            <text x="240" y="250" fill="#475569" font-size="12" font-family="Inter, sans-serif">ana.d@agoo.gov.ph</text>
            <text x="440" y="250" fill="#475569" font-size="12" font-family="Inter, sans-serif">San Nicolas, Agoo</text>
            <rect x="615" y="238" width="70" height="22" rx="4" fill="#FEF3C7"/>
            <text x="650" y="253" fill="#92400E" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">Admin</text>
            <rect x="735" y="238" width="84" height="22" rx="11" fill="#DCFCE7"/>
            <text x="777" y="253" fill="#166534" font-size="11" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">✓ Active</text>
            <text x="890" y="250" fill="#D97706" font-size="12" font-weight="bold" font-family="Inter, sans-serif">★ 4.8 (Verified)</text>
            <text x="1045" y="250" fill="#64748B" font-size="18" font-weight="bold" font-family="Inter, sans-serif">•••</text>
        </g>
    </g>
    
    <!-- Floating Wireframe Modal: User Suspension Modal (A3 Modal Requirement) -->
    <g transform="translate(480, 240)">
        <rect x="-10" y="-10" width="500" height="420" rx="16" fill="#000000" opacity="0.3"/>
        <rect x="0" y="0" width="480" height="400" rx="12" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
        
        <!-- Modal Header -->
        <g transform="translate(24, 24)">
            <circle cx="16" cy="16" r="16" fill="#FEE2E2"/>
            <text x="16" y="22" fill="#DC2626" font-size="16" font-weight="bold" text-anchor="middle">⚠️</text>
            <text x="44" y="16" fill="#0F172A" font-size="16" font-weight="bold" font-family="Inter, sans-serif">Suspend Resident Account</text>
            <text x="44" y="32" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Target: Carlo Reyes (ID #USR-8491 • Santa Barbara)</text>
        </g>
        <line x1="0" y1="72" x2="480" y2="72" stroke="#E2E8F0" stroke-width="1"/>
        
        <!-- Suspension Form -->
        <g transform="translate(24, 90)">
            <text x="0" y="16" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Suspension Duration</text>
            <rect x="0" y="26" width="130" height="34" rx="6" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/>
            <text x="65" y="48" fill="#991B1B" font-size="12" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">7 Days</text>
            
            <rect x="140" y="26" width="130" height="34" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
            <text x="205" y="48" fill="#475569" font-size="12" font-weight="500" text-anchor="middle" font-family="Inter, sans-serif">30 Days</text>
            
            <rect x="280" y="26" width="150" height="34" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
            <text x="355" y="48" fill="#475569" font-size="12" font-weight="500" text-anchor="middle" font-family="Inter, sans-serif">Permanent Ban</text>
            
            <text x="0" y="90" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Violation Category</text>
            <rect x="0" y="100" width="430" height="36" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
            <text x="14" y="123" fill="#334155" font-size="12" font-family="Inter, sans-serif">Repeated spam listings &amp; unfulfilled barter trades ▾</text>
            
            <text x="0" y="162" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Admin Disciplinary Note to User</text>
            <rect x="0" y="172" width="430" height="60" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
            <text x="14" y="194" fill="#64748B" font-size="11" font-family="Inter, sans-serif">Your account has been placed on a 7-day trade suspension due to multiple</text>
            <text x="14" y="210" fill="#64748B" font-size="11" font-family="Inter, sans-serif">resident complaints regarding no-shows during scheduled exchanges.</text>
        </g>
        
        <!-- Modal Footer Buttons -->
        <g transform="translate(24, 340)">
            <rect x="0" y="0" width="200" height="40" rx="6" fill="#DC2626"/>
            <text x="100" y="25" fill="#FFFFFF" font-size="13" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">Confirm Suspension</text>
            
            <rect x="215" y="0" width="100" height="40" rx="6" fill="#F1F5F9"/>
            <text x="265" y="25" fill="#475569" font-size="13" font-weight="600" text-anchor="middle" font-family="Inter, sans-serif">Cancel</text>
        </g>
    </g>
</svg>'''

# =========================================================================
# A4: Post & Listing Moderation + Takedown Modal
# =========================================================================
def generate_a4_svg():
    sidebar = get_sidebar_svg(3)
    header = get_header_svg("Admin / Post & Listing Moderation")
    
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960">
    <rect width="1440" height="960" fill="#F1F5F3" />
    {sidebar}
    {header}
    
    <g transform="translate(290, 96)">
        <text x="0" y="24" fill="#0F172A" font-size="24" font-weight="bold" font-family="Inter, sans-serif">Item Listings &amp; Donation Moderation</text>
        <text x="0" y="44" fill="#64748B" font-size="13" font-family="Inter, sans-serif">Audit active listings, enforce safety guidelines, and remove prohibited or commercial goods.</text>
        
        <!-- Tabs & Filters -->
        <g transform="translate(0, 60)">
            <rect x="0" y="0" width="160" height="38" rx="8" fill="#DC2626"/>
            <text x="80" y="24" fill="#FFFFFF" font-size="13" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">Flagged Items (5)</text>
            
            <rect x="170" y="0" width="140" height="38" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="240" y="24" fill="#64748B" font-size="13" font-weight="500" text-anchor="middle" font-family="Inter, sans-serif">All Listings (342)</text>
            
            <rect x="320" y="0" width="140" height="38" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="390" y="24" fill="#64748B" font-size="13" font-weight="500" text-anchor="middle" font-family="Inter, sans-serif">Taken Down (12)</text>
        </g>
        
        <!-- Main Moderation Layout: Table (710px) + Quick Preview Drawer (380px) -->
        <g transform="translate(0, 116)">
            <!-- Left Table Container -->
            <rect x="0" y="0" width="700" height="660" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="20" y="32" fill="#0F172A" font-size="15" font-weight="bold" font-family="Inter, sans-serif">Reported Listings Requiring Review</text>
            <text x="20" y="50" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Flagged by verified neighbors for prohibited content</text>
            
            <!-- Table Header -->
            <rect x="16" y="68" width="668" height="36" rx="6" fill="#F8FAFC"/>
            <text x="28" y="90" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">ITEM / TITLE</text>
            <text x="220" y="90" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">OWNER</text>
            <text x="360" y="90" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">TYPE</text>
            <text x="470" y="90" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">FLAGS</text>
            <text x="570" y="90" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">ACTION</text>
            
            <!-- Row 1: Selected Flagged Item -->
            <g transform="translate(16, 112)">
                <rect x="0" y="0" width="668" height="84" rx="8" fill="#FEF2F2" stroke="#F87171" stroke-width="1.5"/>
                <rect x="12" y="12" width="60" height="60" rx="6" fill="#CBD5E1"/>
                <text x="42" y="47" fill="#64748B" font-size="10" font-weight="bold" text-anchor="middle">PHOTO</text>
                <text x="82" y="32" fill="#991B1B" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Commercial Vape Pods 10x (Selected)</text>
                <text x="82" y="50" fill="#DC2626" font-size="11" font-family="Inter, sans-serif">Prohibited Goods Violation</text>
                <text x="204" y="36" fill="#0F172A" font-size="12" font-weight="600" font-family="Inter, sans-serif">BadActor101</text>
                <rect x="344" y="24" width="80" height="22" rx="4" fill="#FEE2E2"/>
                <text x="384" y="39" fill="#991B1B" font-size="10" font-weight="bold" text-anchor="middle">Donation (?)</text>
                <rect x="454" y="24" width="64" height="22" rx="11" fill="#DC2626"/>
                <text x="486" y="39" fill="#FFF" font-size="11" font-weight="bold" text-anchor="middle">4 Flags</text>
                <rect x="554" y="24" width="94" height="28" rx="6" fill="#DC2626"/>
                <text x="601" y="42" fill="#FFF" font-size="11" font-weight="bold" text-anchor="middle">Review →</text>
            </g>
            
            <!-- Row 2 -->
            <g transform="translate(16, 204)">
                <rect x="0" y="0" width="668" height="84" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
                <rect x="12" y="12" width="60" height="60" rx="6" fill="#E2E8F0"/>
                <text x="42" y="47" fill="#64748B" font-size="10" font-weight="bold" text-anchor="middle">PHOTO</text>
                <text x="82" y="32" fill="#0F172A" font-size="13" font-weight="bold" font-family="Inter, sans-serif">Gasoline Container 20L (Hazardous)</text>
                <text x="82" y="50" fill="#64748B" font-size="11" font-family="Inter, sans-serif">Category: Home &amp; Garden</text>
                <text x="204" y="36" fill="#0F172A" font-size="12" font-weight="600" font-family="Inter, sans-serif">Ramon G.</text>
                <rect x="344" y="24" width="80" height="22" rx="4" fill="#EFF6FF"/>
                <text x="384" y="39" fill="#1E40AF" font-size="10" font-weight="bold" text-anchor="middle">Exchange</text>
                <rect x="454" y="24" width="64" height="22" rx="11" fill="#F59E0B"/>
                <text x="486" y="39" fill="#FFF" font-size="11" font-weight="bold" text-anchor="middle">2 Flags</text>
                <rect x="554" y="24" width="94" height="28" rx="6" fill="#F1F5F9"/>
                <text x="601" y="42" fill="#334155" font-size="11" font-weight="bold" text-anchor="middle">Review →</text>
            </g>
        </g>
        
        <!-- Right Quick Preview Drawer (380px) -->
        <g transform="translate(730, 116)">
            <rect x="0" y="0" width="380" height="660" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            
            <!-- Drawer Header -->
            <g transform="translate(20, 20)">
                <text x="0" y="16" fill="#0F172A" font-size="15" font-weight="bold" font-family="Inter, sans-serif">Listing Incident Dossier</text>
                <text x="0" y="34" fill="#DC2626" font-size="12" font-weight="bold" font-family="Inter, sans-serif">⚠️ Violation: Prohibited Regulated Product</text>
            </g>
            <line x1="0" y1="70" x2="380" y2="70" stroke="#E2E8F0" stroke-width="1"/>
            
            <!-- Photo & Title -->
            <g transform="translate(20, 86)">
                <rect x="0" y="0" width="340" height="180" rx="8" fill="#CBD5E1"/>
                <text x="170" y="96" fill="#475569" font-size="14" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">[EVIDENCE PHOTO PREVIEW]</text>
                
                <text x="0" y="210" fill="#0F172A" font-size="16" font-weight="bold" font-family="Inter, sans-serif">Commercial Vape Pods 10x Disposable</text>
                <text x="0" y="230" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Posted 2 hours ago by BadActor101 (Santa Barbara)</text>
                
                <!-- Description Box -->
                <rect x="0" y="244" width="340" height="74" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                <text x="12" y="266" fill="#475569" font-size="11" font-family="Inter, sans-serif">"Selling / swapping brand new boxes of flavored vape pods.</text>
                <text x="12" y="282" fill="#475569" font-size="11" font-family="Inter, sans-serif">DM for meetup at plaza."</text>
                <text x="12" y="302" fill="#DC2626" font-size="11" font-weight="bold" font-family="Inter, sans-serif">Community Rule: Direct violation of tobacco/nicotine ban.</text>
            </g>
            
            <!-- Reporter Notes -->
            <g transform="translate(20, 420)">
                <rect x="0" y="0" width="340" height="70" rx="6" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1"/>
                <text x="12" y="22" fill="#92400E" font-size="11" font-weight="bold" font-family="Inter, sans-serif">Flagged by 4 Neighbors (including Brgy. Official):</text>
                <text x="12" y="42" fill="#B45309" font-size="11" font-family="Inter, sans-serif">"Commercial sales &amp; e-cigarettes are illegal under</text>
                <text x="12" y="56" fill="#B45309" font-size="11" font-family="Inter, sans-serif">Bayanihan community trade policy."</text>
            </g>
            
            <!-- Moderation Buttons -->
            <g transform="translate(20, 520)">
                <rect x="0" y="0" width="340" height="42" rx="8" fill="#DC2626"/>
                <text x="170" y="26" fill="#FFFFFF" font-size="13" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">🗑️ Takedown &amp; Delete Listing</text>
                
                <rect x="0" y="52" width="165" height="38" rx="8" fill="#F8FAFC" stroke="#D97706" stroke-width="1.5"/>
                <text x="82" y="76" fill="#D97706" font-size="12" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">⚠️ Issue Warning</text>
                
                <rect x="175" y="52" width="165" height="38" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                <text x="257" y="76" fill="#64748B" font-size="12" font-weight="600" text-anchor="middle" font-family="Inter, sans-serif">Dismiss Report</text>
            </g>
        </g>
    </g>
</svg>'''

# =========================================================================
# A5: Community Requests Moderation
# =========================================================================
def generate_a5_svg():
    sidebar = get_sidebar_svg(4)
    header = get_header_svg("Admin / Community Help Requests Moderation")
    
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960">
    <rect width="1440" height="960" fill="#F1F5F3" />
    {sidebar}
    {header}
    
    <g transform="translate(290, 96)">
        <text x="0" y="24" fill="#0F172A" font-size="24" font-weight="bold" font-family="Inter, sans-serif">Community Emergency &amp; Aid Requests</text>
        <text x="0" y="44" fill="#64748B" font-size="13" font-family="Inter, sans-serif">Verify community assistance appeals, calamity relief operations, and grant official verification badges.</text>
        
        <!-- Urgency Level Filters -->
        <g transform="translate(0, 60)">
            <rect x="0" y="0" width="100" height="36" rx="6" fill="#2E7D32"/>
            <text x="50" y="23" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">All (28)</text>
            
            <rect x="110" y="0" width="130" height="36" rx="6" fill="#FEE2E2" stroke="#EF4444" stroke-width="1"/>
            <text x="175" y="23" fill="#991B1B" font-size="12" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">🔴 Critical (3)</text>
            
            <rect x="250" y="0" width="120" height="36" rx="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1"/>
            <text x="310" y="23" fill="#92400E" font-size="12" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">🟠 High (6)</text>
            
            <rect x="380" y="0" width="130" height="36" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="445" y="23" fill="#64748B" font-size="12" font-weight="500" text-anchor="middle" font-family="Inter, sans-serif">🟡 Medium (12)</text>
            
            <rect x="520" y="0" width="120" height="36" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="580" y="23" fill="#64748B" font-size="12" font-weight="500" text-anchor="middle" font-family="Inter, sans-serif">🟢 Low (7)</text>
        </g>
        
        <!-- Request Cards Grid (3 Cards Showcase) -->
        <g transform="translate(0, 116)">
            <!-- Card 1: Critical Calamity Aid (Verified Official) -->
            <g transform="translate(0, 0)">
                <rect x="0" y="0" width="350" height="520" rx="10" fill="#FFFFFF" stroke="#EF4444" stroke-width="2"/>
                
                <!-- Card Header -->
                <rect x="16" y="16" width="90" height="24" rx="12" fill="#FEE2E2"/>
                <text x="61" y="32" fill="#991B1B" font-size="11" font-weight="bold" text-anchor="middle">CRITICAL AID</text>
                
                <rect x="180" y="16" width="154" height="24" rx="12" fill="#DCFCE7"/>
                <text x="257" y="32" fill="#166534" font-size="10" font-weight="bold" text-anchor="middle">🛡️ Official Verified Need</text>
                
                <!-- Title & Beneficiary -->
                <text x="16" y="72" fill="#0F172A" font-size="16" font-weight="bold" font-family="Inter, sans-serif">Emergency Infant Formula &amp;</text>
                <text x="16" y="92" fill="#0F172A" font-size="16" font-weight="bold" font-family="Inter, sans-serif">First Aid Kits</text>
                
                <text x="16" y="120" fill="#64748B" font-size="12" font-family="Inter, sans-serif">📍 Brgy. San Nicolas • 3 Flood-Affected Families</text>
                <text x="16" y="138" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Target: Sept 18, 2026</text>
                
                <!-- Progress Bar -->
                <g transform="translate(16, 156)">
                    <rect x="0" y="0" width="318" height="8" rx="4" fill="#E2E8F0"/>
                    <rect x="0" y="0" width="120" height="8" rx="4" fill="#16A34A"/>
                    <text x="0" y="24" fill="#0F172A" font-size="11" font-weight="bold" font-family="Inter, sans-serif">1 of 3 kits fulfilled (33%)</text>
                </g>
                
                <!-- Description -->
                <rect x="16" y="196" width="318" height="90" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                <text x="26" y="218" fill="#475569" font-size="11" font-family="Inter, sans-serif">"Flooding along riverbank damaged supplies.</text>
                <text x="26" y="234" fill="#475569" font-size="11" font-family="Inter, sans-serif">Urgent need for 0-12mo infant milk formula,</text>
                <text x="26" y="250" fill="#475569" font-size="11" font-family="Inter, sans-serif">sterile gauze, and clean drinking water."</text>
                
                <!-- Admin Actions Box -->
                <g transform="translate(16, 306)">
                    <text x="0" y="14" fill="#0F172A" font-size="12" font-weight="bold" font-family="Inter, sans-serif">Admin Moderation Controls:</text>
                    
                    <!-- Toggle Official Button -->
                    <rect x="0" y="26" width="318" height="38" rx="6" fill="#166534"/>
                    <text x="159" y="50" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">✓ Official Status Granted</text>
                    
                    <rect x="0" y="72" width="154" height="34" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                    <text x="77" y="94" fill="#334155" font-size="11" font-weight="bold" text-anchor="middle">Feature on Hero</text>
                    
                    <rect x="164" y="72" width="154" height="34" rx="6" fill="#F8FAFC" stroke="#DC2626" stroke-width="1"/>
                    <text x="241" y="94" fill="#DC2626" font-size="11" font-weight="bold" text-anchor="middle">Close / Archive</text>
                </g>
            </g>
            
            <!-- Card 2: High Calamity Roof Repair -->
            <g transform="translate(380, 0)">
                <rect x="0" y="0" width="350" height="520" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
                
                <!-- Card Header -->
                <rect x="16" y="16" width="90" height="24" rx="12" fill="#FEF3C7"/>
                <text x="61" y="32" fill="#92400E" font-size="11" font-weight="bold" text-anchor="middle">HIGH NEED</text>
                
                <rect x="180" y="16" width="154" height="24" rx="12" fill="#FEF3C7"/>
                <text x="257" y="32" fill="#92400E" font-size="10" font-weight="bold" text-anchor="middle">⏳ Pending Verification</text>
                
                <text x="16" y="72" fill="#0F172A" font-size="16" font-weight="bold" font-family="Inter, sans-serif">Corrugated Iron Sheets for</text>
                <text x="16" y="92" fill="#0F172A" font-size="16" font-weight="bold" font-family="Inter, sans-serif">Roof Repair (Typhoon Aid)</text>
                
                <text x="16" y="120" fill="#64748B" font-size="12" font-family="Inter, sans-serif">📍 Brgy. San Antonio • 1 Household</text>
                <text x="16" y="138" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Target: Sept 24, 2026</text>
                
                <!-- Progress Bar -->
                <g transform="translate(16, 156)">
                    <rect x="0" y="0" width="318" height="8" rx="4" fill="#E2E8F0"/>
                    <rect x="0" y="0" width="0" height="8" rx="4" fill="#D97706"/>
                    <text x="0" y="24" fill="#0F172A" font-size="11" font-weight="bold" font-family="Inter, sans-serif">0 of 8 sheets fulfilled (0%)</text>
                </g>
                
                <rect x="16" y="196" width="318" height="90" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                <text x="26" y="218" fill="#475569" font-size="11" font-family="Inter, sans-serif">"Strong winds blew off kitchen roof.</text>
                <text x="26" y="234" fill="#475569" font-size="11" font-family="Inter, sans-serif">Seeking 6-8 galvanized sheets or tarpaulin</text>
                <text x="26" y="250" fill="#475569" font-size="11" font-family="Inter, sans-serif">to protect home from rains."</text>
                
                <!-- Admin Actions Box -->
                <g transform="translate(16, 306)">
                    <text x="0" y="14" fill="#0F172A" font-size="12" font-weight="bold" font-family="Inter, sans-serif">Admin Moderation Controls:</text>
                    
                    <rect x="0" y="26" width="318" height="38" rx="6" fill="#2E7D32"/>
                    <text x="159" y="50" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">Verify &amp; Mark as Official</text>
                    
                    <rect x="0" y="72" width="154" height="34" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                    <text x="77" y="94" fill="#334155" font-size="11" font-weight="bold" text-anchor="middle">Contact Resident</text>
                    
                    <rect x="164" y="72" width="154" height="34" rx="6" fill="#F8FAFC" stroke="#DC2626" stroke-width="1"/>
                    <text x="241" y="94" fill="#DC2626" font-size="11" font-weight="bold" text-anchor="middle">Decline Request</text>
                </g>
            </g>
            
            <!-- Card 3: Medium School Supplies -->
            <g transform="translate(760, 0)">
                <rect x="0" y="0" width="350" height="520" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
                
                <rect x="16" y="16" width="100" height="24" rx="12" fill="#EFF6FF"/>
                <text x="66" y="32" fill="#1E40AF" font-size="11" font-weight="bold" text-anchor="middle">MEDIUM NEED</text>
                
                <rect x="180" y="16" width="154" height="24" rx="12" fill="#DCFCE7"/>
                <text x="257" y="32" fill="#166534" font-size="10" font-weight="bold" text-anchor="middle">🛡️ Official Verified Need</text>
                
                <text x="16" y="72" fill="#0F172A" font-size="16" font-weight="bold" font-family="Inter, sans-serif">Elementary Math &amp; Science</text>
                <text x="16" y="92" fill="#0F172A" font-size="16" font-weight="bold" font-family="Inter, sans-serif">Reference Books (Grade 4-6)</text>
                
                <text x="16" y="120" fill="#64748B" font-size="12" font-family="Inter, sans-serif">📍 Brgy. Santa Barbara • 12 Daycare Students</text>
                <text x="16" y="138" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Target: Oct 01, 2026</text>
                
                <g transform="translate(16, 156)">
                    <rect x="0" y="0" width="318" height="8" rx="4" fill="#E2E8F0"/>
                    <rect x="0" y="0" width="220" height="8" rx="4" fill="#2563EB"/>
                    <text x="0" y="24" fill="#0F172A" font-size="11" font-weight="bold" font-family="Inter, sans-serif">8 of 12 books gathered (66%)</text>
                </g>
                
                <rect x="16" y="196" width="318" height="90" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                <text x="26" y="218" fill="#475569" font-size="11" font-family="Inter, sans-serif">"Community reading center revival project.</text>
                <text x="26" y="234" fill="#475569" font-size="11" font-family="Inter, sans-serif">Old or pre-loved learning modules and children's</text>
                <text x="26" y="250" fill="#475569" font-size="11" font-family="Inter, sans-serif">dictionaries are warmly appreciated."</text>
                
                <!-- Admin Actions Box -->
                <g transform="translate(16, 306)">
                    <text x="0" y="14" fill="#0F172A" font-size="12" font-weight="bold" font-family="Inter, sans-serif">Admin Moderation Controls:</text>
                    
                    <rect x="0" y="26" width="318" height="38" rx="6" fill="#166534"/>
                    <text x="159" y="50" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">✓ Official Status Granted</text>
                    
                    <rect x="0" y="72" width="154" height="34" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
                    <text x="77" y="94" fill="#334155" font-size="11" font-weight="bold" text-anchor="middle">Feature on Hero</text>
                    
                    <rect x="164" y="72" width="154" height="34" rx="6" fill="#F8FAFC" stroke="#DC2626" stroke-width="1"/>
                    <text x="241" y="94" fill="#DC2626" font-size="11" font-weight="bold" text-anchor="middle">Close / Archive</text>
                </g>
            </g>
        </g>
    </g>
</svg>'''

# =========================================================================
# A6: Reports & Audit Logs / System Terminal
# =========================================================================
def generate_a6_svg():
    sidebar = get_sidebar_svg(5)
    header = get_header_svg("Admin / Reports & System Audit Logs")
    
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960">
    <rect width="1440" height="960" fill="#F1F5F3" />
    {sidebar}
    {header}
    
    <g transform="translate(290, 96)">
        <text x="0" y="24" fill="#0F172A" font-size="24" font-weight="bold" font-family="Inter, sans-serif">Incident Reports &amp; System Audit Trail</text>
        <text x="0" y="44" fill="#64748B" font-size="13" font-family="Inter, sans-serif">Resolve user grievances, disciplinary flags, and monitor automated backend infrastructure logs.</text>
        
        <!-- Dual Tab Switcher -->
        <g transform="translate(0, 60)">
            <rect x="0" y="0" width="180" height="38" rx="8" fill="#2E7D32"/>
            <text x="90" y="24" fill="#FFFFFF" font-size="13" font-weight="bold" text-anchor="middle" font-family="Inter, sans-serif">Flagged Incidents (3)</text>
            
            <rect x="190" y="0" width="200" height="38" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="290" y="24" fill="#64748B" font-size="13" font-weight="500" text-anchor="middle" font-family="Inter, sans-serif">System Terminal Logs</text>
        </g>
        
        <!-- Two Section Stack: Top Incident Table (360px), Bottom System Terminal (300px) -->
        <g transform="translate(0, 116)">
            <!-- Incident Table Box -->
            <rect x="0" y="0" width="1110" height="280" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
            <text x="20" y="30" fill="#0F172A" font-size="15" font-weight="bold" font-family="Inter, sans-serif">Open Community Incident Cases</text>
            
            <!-- Table Header -->
            <rect x="16" y="48" width="1078" height="34" rx="6" fill="#F8FAFC"/>
            <text x="32" y="70" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">CASE ID</text>
            <text x="140" y="70" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">VIOLATION TYPE</text>
            <text x="300" y="70" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">REPORTER</text>
            <text x="460" y="70" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">REPORTED ENTITY</text>
            <text x="640" y="70" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">DATE</text>
            <text x="760" y="70" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">STATUS</text>
            <text x="960" y="70" fill="#64748B" font-size="11" font-weight="bold" font-family="Inter, sans-serif">RESOLUTION</text>
            
            <!-- Case Row 1 -->
            <line x1="16" y1="126" x2="1094" y2="126" stroke="#F1F5F9" stroke-width="1"/>
            <text x="32" y="112" fill="#0F172A" font-size="12" font-weight="bold" font-family="Inter, sans-serif">#CAS-9182</text>
            <rect x="140" y="98" width="120" height="22" rx="4" fill="#FEE2E2"/>
            <text x="200" y="113" fill="#991B1B" font-size="11" font-weight="bold" text-anchor="middle">Prohibited Product</text>
            <text x="300" y="112" fill="#475569" font-size="12" font-family="Inter, sans-serif">Maria Santos</text>
            <text x="460" y="112" fill="#DC2626" font-size="12" font-weight="bold" font-family="Inter, sans-serif">BadActor101 (Item #402)</text>
            <text x="640" y="112" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Sept 14, 09:15</text>
            <rect x="760" y="98" width="90" height="22" rx="11" fill="#FEE2E2"/>
            <text x="805" y="113" fill="#991B1B" font-size="11" font-weight="bold" text-anchor="middle">Under Review</text>
            <rect x="950" y="96" width="120" height="28" rx="6" fill="#DC2626"/>
            <text x="1010" y="114" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Resolve Case →</text>
            
            <!-- Case Row 2 -->
            <line x1="16" y1="172" x2="1094" y2="172" stroke="#F1F5F9" stroke-width="1"/>
            <text x="32" y="156" fill="#0F172A" font-size="12" font-weight="bold" font-family="Inter, sans-serif">#CAS-9174</text>
            <rect x="140" y="142" width="100" height="22" rx="4" fill="#FEF3C7"/>
            <text x="190" y="157" fill="#92400E" font-size="11" font-weight="bold" text-anchor="middle">No-Show Barter</text>
            <text x="300" y="156" fill="#475569" font-size="12" font-family="Inter, sans-serif">Juan Dela Cruz</text>
            <text x="460" y="156" fill="#D97706" font-size="12" font-weight="bold" font-family="Inter, sans-serif">Carlo Reyes</text>
            <text x="640" y="156" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Sept 13, 16:40</text>
            <rect x="760" y="142" width="90" height="22" rx="11" fill="#FEF3C7"/>
            <text x="805" y="157" fill="#92400E" font-size="11" font-weight="bold" text-anchor="middle">Investigating</text>
            <rect x="950" y="140" width="120" height="28" rx="6" fill="#2E7D32"/>
            <text x="1010" y="158" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Suspend User</text>
            
            <!-- Case Row 3 -->
            <text x="32" y="202" fill="#0F172A" font-size="12" font-weight="bold" font-family="Inter, sans-serif">#CAS-9160</text>
            <rect x="140" y="188" width="110" height="22" rx="4" fill="#EFF6FF"/>
            <text x="195" y="203" fill="#1E40AF" font-size="11" font-weight="bold" text-anchor="middle">Duplicate Post</text>
            <text x="300" y="202" fill="#475569" font-size="12" font-family="Inter, sans-serif">Ana Dizon</text>
            <text x="460" y="202" fill="#475569" font-size="12" font-weight="bold" font-family="Inter, sans-serif">Ramon G. (Item #388)</text>
            <text x="640" y="202" fill="#64748B" font-size="12" font-family="Inter, sans-serif">Sept 13, 11:20</text>
            <rect x="760" y="188" width="90" height="22" rx="11" fill="#DCFCE7"/>
            <text x="805" y="203" fill="#166534" font-size="11" font-weight="bold" text-anchor="middle">Resolved</text>
            <text x="980" y="202" fill="#166534" font-size="11" font-weight="bold">✓ Archived</text>
            
            <!-- Bottom: Live System Audit Terminal -->
            <g transform="translate(0, 300)">
                <rect x="0" y="0" width="1110" height="350" rx="10" fill="#0B0F19" stroke="#1E293B" stroke-width="1"/>
                
                <!-- Terminal Title Bar -->
                <rect x="0" y="0" width="1110" height="36" rx="10" fill="#111827"/>
                <circle cx="20" cy="18" r="5" fill="#EF4444"/>
                <circle cx="36" cy="18" r="5" fill="#F59E0B"/>
                <circle cx="52" cy="18" r="5" fill="#10B981"/>
                <text x="74" y="22" fill="#94A3B8" font-size="12" font-family="monospace">bayanihan-hub-audit-terminal -- live stream [Render FastAPI &amp; Aiven Cloud MySQL SSL]</text>
                
                <!-- Terminal Monospace Log Lines -->
                <text x="24" y="70" fill="#10B981" font-size="12" font-family="monospace">[2026-09-14 08:00:12] [SYS_INIT] PostgreSQL / MySQL Pool initialized (SSL mode: REQUIRED, MinPool: 5, MaxPool: 20)</text>
                <text x="24" y="94" fill="#38BDF8" font-size="12" font-family="monospace">[2026-09-14 08:14:02] [AUTH] Admin login successful: jehosue (ID: admin_01, IP: 192.168.1.104, Role: LEAD_ADMIN)</text>
                <text x="24" y="118" fill="#FBBF24" font-size="12" font-family="monospace">[2026-09-14 08:32:45] [VERIFICATION] Resident #USR-102 submitted PhilSys ID document. Biometrics score: 0.964</text>
                <text x="24" y="142" fill="#F87171" font-size="12" font-family="monospace">[2026-09-14 09:15:22] [INCIDENT] Flag registered on Listing #LST-402 by Maria Santos. Reason: 'Prohibited vape sales'</text>
                <text x="24" y="166" fill="#E2E8F0" font-size="12" font-family="monospace">[2026-09-14 09:20:10] [MODERATION] Privacy Shield overlay applied to applicant photo verification buffer.</text>
                <text x="24" y="190" fill="#38BDF8" font-size="12" font-family="monospace">[2026-09-14 09:44:00] [BARTER] Trade handshake completed between #USR-201 and #USR-304 in Barangay San Nicolas.</text>
                <text x="24" y="214" fill="#10B981" font-size="12" font-family="monospace">[2026-09-14 10:00:00] [CRON] Automated backup snapshot completed: 'aiven_bayanihanhub_db_20260914.sql.enc'</text>
                <text x="24" y="238" fill="#A855F7" font-size="12" font-family="monospace">[2026-09-14 10:18:22] [API_METRICS] Health check latency: 84ms | Memory: 218MB / 512MB | CPU: 4.2%</text>
                <text x="24" y="270" fill="#10B981" font-size="12" font-family="monospace">admin@bayanihanhub-server:~$ _</text>
            </g>
        </g>
    </g>
</svg>'''

files = {
    "A2_Identity_Approvals_Queue.svg": generate_a2_svg(),
    "A3_Manage_Users_Directory.svg": generate_a3_svg(),
    "A4_Post_Listing_Moderation.svg": generate_a4_svg(),
    "A5_Community_Requests_Moderation.svg": generate_a5_svg(),
    "A6_Reports_And_Audit_Logs.svg": generate_a6_svg(),
}

for filename, content in files.items():
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated {filename}")

print("All 6 screens generated successfully in", output_dir)
