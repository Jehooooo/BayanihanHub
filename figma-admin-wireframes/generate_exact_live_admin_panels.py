import os

output_dir = r"c:\Users\Jeho\Downloads\BayanihanHubAfter\figma-admin-wireframes"
os.makedirs(output_dir, exist_ok=True)

# Exact Desktop Sidebar matching src/components/layout/AdminLayout.tsx
def get_exact_sidebar(active_index=0):
    nav_items = [
        ("Dashboard", "/admin"),
        ("Identity & Approvals", "/admin/approvals"),
        ("Users", "/admin/users"),
        ("Posts", "/admin/posts"),
        ("Requests", "/admin/requests"),
        ("Reports", "/admin/reports"),
        ("Categories", "/admin/categories"),
        ("Ratings", "/rate"),
        ("Settings", "/settings")
    ]
    
    items_svg = ""
    y = 80
    for idx, (label, route) in enumerate(nav_items):
        is_active = (idx == active_index)
        bg = 'fill="#27692a"' if is_active else 'fill="transparent"'
        text_color = '#ffffff' if is_active else '#94a3b8'
        font_weight = '700' if is_active else '600'
        shadow = '<rect x="0" y="0" width="224" height="38" rx="8" fill="#000" opacity="0.15"/>' if is_active else ''
        
        items_svg += f'''
        <g transform="translate(16, {y})">
            {shadow}
            <rect x="0" y="0" width="224" height="38" rx="8" {bg} />
            <circle cx="18" cy="19" r="6" fill="{text_color}" opacity="0.7"/>
            <text x="34" y="24" fill="{text_color}" font-size="12" font-weight="{font_weight}">{label}</text>
        </g>
        '''
        y += 44

    return f'''
    <!-- Exact Desktop Sidebar (w-64 = 256px, bg-[#0f172a], border-r border-[#1e293b]) -->
    <rect x="0" y="0" width="256" height="960" fill="#0f172a" />
    <line x1="256" y1="0" x2="256" y2="960" stroke="#1e293b" stroke-width="1"/>
    
    <!-- Brand Logo Header -->
    <g transform="translate(20, 20)">
        <rect x="0" y="0" width="32" height="32" rx="6" fill="#2e7d32" />
        <path d="M16 6 L6 16 L10 16 L10 26 L22 26 L22 16 L26 16 Z" fill="#ffffff"/>
        <text x="42" y="16" fill="#ffffff" font-size="14" font-weight="700">Bayanihan Hub</text>
        <text x="42" y="29" fill="#66bb6a" font-size="10" font-weight="700" letter-spacing="1">ADMIN PANEL</text>
    </g>
    <line x1="0" y1="68" x2="256" y2="68" stroke="#1e293b" stroke-width="1"/>
    
    <!-- Nav Items -->
    {items_svg}
    
    <!-- Sidebar Footer -->
    <g transform="translate(0, 860)">
        <rect x="0" y="0" width="256" height="100" fill="#020617" opacity="0.4"/>
        <line x1="0" y1="0" x2="256" y2="0" stroke="#1e293b" stroke-width="1"/>
        <text x="40" y="32" fill="#94a3b8" font-size="12" font-weight="500">← Back to Main App</text>
        <text x="40" y="68" fill="#f87171" font-size="12" font-weight="600">⎋ Logout (Admin)</text>
    </g>
    '''

# A1: System Overview (/admin) matching live MySQL database (Total Users: 2, Total Posts: 10, Active Requests: 3, Exchanges: 3)
def get_a1_live():
    return f'''
    <g transform="translate(288, 36)">
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">System Overview</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">Bayanihan Hub live operational community stats, reports, and moderation queue.</text>
        
        <!-- 5 Quick Stats Grid (Real Data: Users: 2, Posts: 10, Requests: 3, Approvals: 0, Exchanges: 3) -->
        <g transform="translate(0, 80)">
            <!-- Total Users -->
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" fill="#94a3b8" font-size="12" font-weight="700">Total Users</text>
            <text x="16" y="62" fill="#0f172a" font-size="24" font-weight="800">2</text>
            
            <!-- Total Posts -->
            <rect x="226" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="242" y="28" fill="#94a3b8" font-size="12" font-weight="700">Total Posts</text>
            <text x="242" y="62" fill="#0f172a" font-size="24" font-weight="800">10</text>
            
            <!-- Active Requests -->
            <rect x="452" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="468" y="28" fill="#94a3b8" font-size="12" font-weight="700">Active Requests</text>
            <text x="468" y="62" fill="#0f172a" font-size="24" font-weight="800">3</text>
            
            <!-- Pending Approvals (0) -->
            <rect x="678" y="0" width="212" height="84" rx="8" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
            <text x="694" y="28" fill="#92400e" font-size="12" font-weight="700">Pending Approvals</text>
            <text x="694" y="62" fill="#d97706" font-size="24" font-weight="800">0</text>
            
            <!-- Completed Exchanges (3) -->
            <rect x="904" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="920" y="28" fill="#94a3b8" font-size="12" font-weight="700">Completed Exchanges</text>
            <text x="920" y="62" fill="#27692a" font-size="24" font-weight="800">3</text>
        </g>
        
        <!-- 2 Large Split Cards -->
        <g transform="translate(0, 184)">
            <!-- Left Card: Reports & Moderation -->
            <rect x="0" y="0" width="548" height="420" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <g transform="translate(24, 24)">
                <text x="0" y="18" fill="#0f172a" font-size="17" font-weight="800">Reports &amp; Moderation</text>
                <text x="0" y="36" fill="#64748b" font-size="12">Live moderation status and disciplinary queue</text>
                
                <rect x="376" y="0" width="124" height="32" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="438" y="20" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">Review Reports →</text>
                
                <!-- 4 Stat Boxes -->
                <g transform="translate(0, 60)">
                    <rect x="0" y="0" width="118" height="74" rx="6" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
                    <text x="59" y="24" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Pending</text>
                    <text x="59" y="56" fill="#d97706" font-size="22" font-weight="800" text-anchor="middle">0</text>
                    
                    <rect x="127" y="0" width="118" height="74" rx="6" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1"/>
                    <text x="186" y="24" fill="#4338ca" font-size="11" font-weight="700" text-anchor="middle">Under Review</text>
                    <text x="186" y="56" fill="#4f46e5" font-size="22" font-weight="800" text-anchor="middle">0</text>
                    
                    <rect x="254" y="0" width="118" height="74" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
                    <text x="313" y="24" fill="#047857" font-size="11" font-weight="700" text-anchor="middle">Resolved</text>
                    <text x="313" y="56" fill="#10b981" font-size="22" font-weight="800" text-anchor="middle">0</text>
                    
                    <rect x="381" y="0" width="118" height="74" rx="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
                    <text x="440" y="24" fill="#b91c1c" font-size="11" font-weight="700" text-anchor="middle">High Priority</text>
                    <text x="440" y="56" fill="#ef4444" font-size="22" font-weight="800" text-anchor="middle">0</text>
                </g>
                
                <line x1="0" y1="310" x2="500" y2="310" stroke="#f1f5f9" stroke-width="1"/>
                <g transform="translate(0, 330)">
                    <text x="0" y="16" fill="#64748b" font-size="12">0 dismissed reports archived</text>
                    <text x="500" y="16" fill="#27692a" font-size="12" font-weight="700" text-anchor="end">Open Full Moderation Console →</text>
                </g>
            </g>
            
            <!-- Right Card: Recent Moderation & Activity -->
            <g transform="translate(572, 0)">
                <rect x="0" y="0" width="548" height="420" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <g transform="translate(24, 24)">
                    <text x="0" y="18" fill="#0f172a" font-size="17" font-weight="800">Recent Moderation &amp; Activity</text>
                    
                    <g transform="translate(0, 48)">
                        <rect x="0" y="0" width="500" height="52" rx="8" fill="#f8faf9"/>
                        <text x="16" y="30" fill="#334155" font-size="12" font-weight="500">Moderation system operational and synchronized</text>
                        <text x="484" y="30" fill="#94a3b8" font-size="11" text-anchor="end">Live</text>
                    </g>
                    
                    <g transform="translate(0, 112)">
                        <rect x="0" y="0" width="500" height="52" rx="8" fill="#f8faf9"/>
                        <text x="16" y="30" fill="#334155" font-size="12" font-weight="500">User identity verification approved: Jehosue B.</text>
                        <text x="484" y="30" fill="#94a3b8" font-size="11" text-anchor="end">Active</text>
                    </g>
                    
                    <g transform="translate(0, 176)">
                        <rect x="0" y="0" width="500" height="52" rx="8" fill="#f8faf9"/>
                        <text x="16" y="30" fill="#334155" font-size="12" font-weight="500">Exchange marked completed (#exc-3)</text>
                        <text x="484" y="30" fill="#94a3b8" font-size="11" text-anchor="end">Verified</text>
                    </g>
                </g>
            </g>
        </g>
    </g>
    '''

# A2: Manage Approvals (/admin/approvals)
def get_a2_live():
    return f'''
    <g transform="translate(288, 36)">
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">Approvals &amp; Identity Verifications</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">Review valid Philippine IDs, facial biometric comparisons, and profile photos to maintain community trust.</text>
        
        <!-- Switcher Tabs -->
        <g transform="translate(740, 10)">
            <rect x="0" y="0" width="380" height="42" rx="10" fill="#e2e8f0"/>
            <rect x="4" y="4" width="190" height="34" rx="8" fill="#ffffff"/>
            <text x="99" y="25" fill="#1b5e20" font-size="12" font-weight="700" text-anchor="middle">🛡️ Identity Verifications</text>
            
            <text x="285" y="25" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">📷 Photo Approvals</text>
        </g>
        
        <!-- 3 Metrics -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="360" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="16" y="16" width="52" height="52" rx="8" fill="#fffbeb"/>
            <text x="42" y="48" fill="#d97706" font-size="22" text-anchor="middle">⏱️</text>
            <text x="80" y="34" fill="#94a3b8" font-size="12" font-weight="700">Pending Identity Review</text>
            <text x="80" y="62" fill="#d97706" font-size="24" font-weight="800">0</text>
            
            <rect x="380" y="0" width="360" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="396" y="16" width="52" height="52" rx="8" fill="#f0fdf4"/>
            <text x="422" y="48" fill="#27692a" font-size="22" text-anchor="middle">✓</text>
            <text x="460" y="34" fill="#94a3b8" font-size="12" font-weight="700">Verified Identities</text>
            <text x="460" y="62" fill="#27692a" font-size="24" font-weight="800">2</text>
            
            <rect x="760" y="0" width="360" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="776" y="16" width="52" height="52" rx="8" fill="#fef2f2"/>
            <text x="802" y="48" fill="#dc2626" font-size="22" text-anchor="middle">✕</text>
            <text x="840" y="34" fill="#94a3b8" font-size="12" font-weight="700">Rejected / Retry</text>
            <text x="840" y="62" fill="#dc2626" font-size="24" font-weight="800">0</text>
        </g>
        
        <!-- Filter Tabs & Search -->
        <g transform="translate(0, 176)">
            <rect x="0" y="0" width="130" height="34" rx="17" fill="#27692a"/>
            <text x="65" y="21" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">All Verifications</text>
            
            <rect x="140" y="0" width="110" height="34" rx="17" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="195" y="21" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Pending (0)</text>
            
            <rect x="260" y="0" width="120" height="34" rx="17" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="320" y="21" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Verified (2)</text>
            
            <rect x="740" y="0" width="380" height="36" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="756" y="22" fill="#94a3b8" font-size="12">🔍 Search applicant by name, email, or ID type...</text>
        </g>
        
        <!-- Verified Applications Table -->
        <g transform="translate(0, 230)">
            <rect x="0" y="0" width="1120" height="420" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="16" y="16" width="1088" height="40" rx="6" fill="#f8fafc"/>
            <text x="32" y="41" fill="#64748b" font-size="11" font-weight="700">APPLICANT</text>
            <text x="260" y="41" fill="#64748b" font-size="11" font-weight="700">BARANGAY &amp; LOCATION</text>
            <text x="500" y="41" fill="#64748b" font-size="11" font-weight="700">SUBMITTED ID TYPE</text>
            <text x="700" y="41" fill="#64748b" font-size="11" font-weight="700">BIOMETRIC STATUS</text>
            <text x="880" y="41" fill="#64748b" font-size="11" font-weight="700">VERIFICATION</text>
            <text x="1020" y="41" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            
            <!-- Real User: Jehosue Biscarra -->
            <g transform="translate(16, 68)">
                <rect x="0" y="0" width="1088" height="74" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
                <circle cx="36" cy="37" r="18" fill="#2e7d32"/>
                <text x="36" y="42" fill="#fff" font-size="12" font-weight="800" text-anchor="middle">JB</text>
                <text x="68" y="32" fill="#0f172a" font-size="13" font-weight="700">Jehosue Biscarra (Lead Admin)</text>
                <text x="68" y="48" fill="#64748b" font-size="11">jehosuebiscarra@gmail.com • ID #14</text>
                
                <text x="260" y="40" fill="#334155" font-size="12">Dangdangla, Poblacion, San Fernando</text>
                
                <rect x="500" y="26" width="120" height="22" rx="4" fill="#f1f5f9"/>
                <text x="560" y="41" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">PhilSys National ID</text>
                
                <rect x="700" y="26" width="100" height="22" rx="11" fill="#dcfce7"/>
                <text x="750" y="41" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">✓ PASSED 96%</text>
                
                <rect x="880" y="26" width="90" height="22" rx="11" fill="#dcfce7"/>
                <text x="925" y="41" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">APPROVED</text>
                
                <rect x="1010" y="24" width="64" height="26" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
                <text x="1042" y="41" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">View</text>
            </g>
            
            <!-- Real User: Admin User -->
            <g transform="translate(16, 150)">
                <rect x="0" y="0" width="1088" height="74" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="36" cy="37" r="18" fill="#0f172a"/>
                <text x="36" y="42" fill="#fff" font-size="12" font-weight="800" text-anchor="middle">AU</text>
                <text x="68" y="32" fill="#0f172a" font-size="13" font-weight="700">Admin User (Administrator)</text>
                <text x="68" y="48" fill="#64748b" font-size="11">admin@bayanihanhub.com • ID #5</text>
                
                <text x="260" y="40" fill="#334155" font-size="12">Municipal Hall, Poblacion</text>
                
                <rect x="500" y="26" width="120" height="22" rx="4" fill="#f1f5f9"/>
                <text x="560" y="41" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">Government ID</text>
                
                <rect x="700" y="26" width="100" height="22" rx="11" fill="#dcfce7"/>
                <text x="750" y="41" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">✓ PASSED</text>
                
                <rect x="880" y="26" width="90" height="22" rx="11" fill="#dcfce7"/>
                <text x="925" y="41" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">APPROVED</text>
                
                <rect x="1010" y="24" width="64" height="26" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
                <text x="1042" y="41" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">View</text>
            </g>
        </g>
    </g>
    '''

# A3: Manage Registered Users (/admin/users) matching live MySQL database
def get_a3_live():
    return f'''
    <g transform="translate(288, 36)">
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">Manage Registered Users</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">View and moderate all registered accounts in MySQL across all verification and moderation states</text>
        
        <g transform="translate(980, 10)">
            <rect x="0" y="0" width="140" height="36" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="70" y="23" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">↻ Refresh Users</text>
        </g>
        
        <!-- Filter Pills matching real DB counts -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="120" height="32" rx="16" fill="#0f172a"/>
            <text x="60" y="21" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle">All Users (2)</text>
            
            <rect x="130" y="0" width="110" height="32" rx="16" fill="#f1f5f9"/>
            <text x="185" y="21" fill="#475569" font-size="12" font-weight="600" text-anchor="middle">Pending (0)</text>
            
            <rect x="250" y="0" width="120" height="32" rx="16" fill="#dcfce7"/>
            <text x="310" y="21" fill="#166534" font-size="12" font-weight="600" text-anchor="middle">Approved (2)</text>
            
            <rect x="380" y="0" width="120" height="32" rx="16" fill="#f1f5f9"/>
            <text x="440" y="21" fill="#475569" font-size="12" font-weight="600" text-anchor="middle">Suspended (0)</text>
            
            <rect x="740" y="0" width="380" height="36" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="756" y="22" fill="#94a3b8" font-size="12">🔍 Search by name, email, municipality, or barangay...</text>
        </g>
        
        <!-- Live Table -->
        <g transform="translate(0, 126)">
            <rect x="0" y="0" width="1120" height="360" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="16" y="16" width="1088" height="40" rx="6" fill="#f8fafc"/>
            <text x="32" y="41" fill="#64748b" font-size="11" font-weight="700">RESIDENT NAME</text>
            <text x="260" y="41" fill="#64748b" font-size="11" font-weight="700">CONTACT &amp; LOCATION</text>
            <text x="500" y="41" fill="#64748b" font-size="11" font-weight="700">ACCOUNT STATUS</text>
            <text x="680" y="41" fill="#64748b" font-size="11" font-weight="700">IDENTITY STATUS</text>
            <text x="860" y="41" fill="#64748b" font-size="11" font-weight="700">ROLES</text>
            <text x="1000" y="41" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            
            <!-- User 14: Jehosue Biscarra -->
            <line x1="16" y1="116" x2="1104" y2="116" stroke="#f1f5f9" stroke-width="1"/>
            <circle cx="44" cy="88" r="18" fill="#2e7d32"/>
            <text x="44" y="94" fill="#fff" font-size="12" font-weight="800" text-anchor="middle">JB</text>
            <text x="72" y="84" fill="#0f172a" font-size="13" font-weight="700">Jehosue Biscarra</text>
            <text x="72" y="100" fill="#94a3b8" font-size="11">@jeho • ID #14</text>
            
            <text x="260" y="84" fill="#334155" font-size="12">jehosuebiscarra@gmail.com • +639923314755</text>
            <text x="260" y="100" fill="#64748b" font-size="11">Dangdangla, Poblacion, San Fernando</text>
            
            <rect x="500" y="78" width="94" height="22" rx="11" fill="#dcfce7"/>
            <text x="547" y="93" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">✓ APPROVED</text>
            
            <text x="680" y="92" fill="#166534" font-size="12" font-weight="600">PhilID • Verified</text>
            
            <rect x="860" y="78" width="70" height="22" rx="4" fill="#fef3c7"/>
            <text x="895" y="93" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Admin</text>
            
            <rect x="1000" y="74" width="74" height="28" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="1037" y="92" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">Manage</text>
            
            <!-- User 5: Admin User -->
            <line x1="16" y1="184" x2="1104" y2="184" stroke="#f1f5f9" stroke-width="1"/>
            <circle cx="44" cy="150" r="18" fill="#0f172a"/>
            <text x="44" y="156" fill="#fff" font-size="12" font-weight="800" text-anchor="middle">AU</text>
            <text x="72" y="146" fill="#0f172a" font-size="13" font-weight="700">Admin User</text>
            <text x="72" y="162" fill="#94a3b8" font-size="11">@admin • ID #5</text>
            
            <text x="260" y="146" fill="#334155" font-size="12">admin@bayanihanhub.com • 09170000000</text>
            <text x="260" y="162" fill="#64748b" font-size="11">Municipal Hall, Poblacion</text>
            
            <rect x="500" y="140" width="94" height="22" rx="11" fill="#dcfce7"/>
            <text x="547" y="155" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">✓ APPROVED</text>
            
            <text x="680" y="154" fill="#166534" font-size="12" font-weight="600">Gov ID • Verified</text>
            
            <rect x="860" y="140" width="70" height="22" rx="4" fill="#fef3c7"/>
            <text x="895" y="155" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Admin</text>
            
            <rect x="1000" y="136" width="74" height="28" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="1037" y="154" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">Manage</text>
        </g>
    </g>
    '''

# A4: Manage Posts & Item Listings (/admin/posts) matching real database posts
def get_a4_live():
    return f'''
    <g transform="translate(288, 36)">
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">Manage Posts &amp; Item Listings</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">Review, moderate, and manage community item listings with notification dispatches</text>
        
        <g transform="translate(980, 10)">
            <rect x="0" y="0" width="140" height="36" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="70" y="23" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">↻ Refresh Posts</text>
        </g>
        
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="130" height="32" rx="16" fill="#0f172a"/>
            <text x="65" y="21" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle">All Posts (10)</text>
            
            <rect x="140" y="0" width="150" height="32" rx="16" fill="#dcfce7"/>
            <text x="215" y="21" fill="#166534" font-size="12" font-weight="600" text-anchor="middle">Available (10)</text>
            
            <rect x="300" y="0" width="140" height="32" rx="16" fill="#f1f5f9"/>
            <text x="370" y="21" fill="#475569" font-size="12" font-weight="600" text-anchor="middle">Removed (0)</text>
            
            <rect x="740" y="0" width="380" height="36" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="756" y="22" fill="#94a3b8" font-size="12">🔍 Search listings by title, category, or owner...</text>
        </g>
        
        <!-- Live Posts Table -->
        <g transform="translate(0, 126)">
            <rect x="0" y="0" width="1120" height="520" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="16" y="16" width="1088" height="40" rx="6" fill="#f8fafc"/>
            <text x="32" y="41" fill="#64748b" font-size="11" font-weight="700">ITEM TITLE</text>
            <text x="360" y="41" fill="#64748b" font-size="11" font-weight="700">CATEGORY</text>
            <text x="540" y="41" fill="#64748b" font-size="11" font-weight="700">POST TYPE</text>
            <text x="720" y="41" fill="#64748b" font-size="11" font-weight="700">STATUS</text>
            <text x="960" y="41" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            
            <!-- Item 1: Elementary School Supplies Pack -->
            <line x1="16" y1="116" x2="1104" y2="116" stroke="#f1f5f9" stroke-width="1"/>
            <rect x="32" y="74" width="48" height="48" rx="6" fill="#e8f5e9"/>
            <text x="92" y="92" fill="#0f172a" font-size="13" font-weight="700">Elementary School Supplies Pack</text>
            <text x="92" y="108" fill="#94a3b8" font-size="11">Item #24 • 6 spiral notebooks, pad paper, crayons, pens...</text>
            
            <text x="360" y="100" fill="#334155" font-size="12">School &amp; Office Supplies</text>
            
            <rect x="540" y="88" width="90" height="22" rx="4" fill="#ecfdf5"/>
            <text x="585" y="103" fill="#047857" font-size="11" font-weight="600" text-anchor="middle">Donation</text>
            
            <rect x="720" y="88" width="70" height="22" rx="11" fill="#dcfce7"/>
            <text x="755" y="103" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">Available</text>
            
            <rect x="960" y="84" width="94" height="28" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
            <text x="1007" y="102" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Remove Post</text>
            
            <!-- Item 2: College Algebra Textbooks -->
            <line x1="16" y1="172" x2="1104" y2="172" stroke="#f1f5f9" stroke-width="1"/>
            <rect x="32" y="130" width="48" height="48" rx="6" fill="#eff6ff"/>
            <text x="92" y="148" fill="#0f172a" font-size="13" font-weight="700">College Algebra &amp; General Science Used Textbooks</text>
            <text x="92" y="164" fill="#94a3b8" font-size="11">Item #25 • Suitable for Grade 11-12 STEM or college...</text>
            
            <text x="360" y="156" fill="#334155" font-size="12">Books &amp; Learning Material</text>
            
            <rect x="540" y="144" width="90" height="22" rx="4" fill="#ecfdf5"/>
            <text x="585" y="159" fill="#047857" font-size="11" font-weight="600" text-anchor="middle">Donation</text>
            
            <rect x="720" y="144" width="70" height="22" rx="11" fill="#dcfce7"/>
            <text x="755" y="159" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">Available</text>
            
            <rect x="960" y="140" width="94" height="28" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
            <text x="1007" y="158" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Remove Post</text>
            
            <!-- Item 3: Stainless Steel Cooking Utensils -->
            <line x1="16" y1="228" x2="1104" y2="228" stroke="#f1f5f9" stroke-width="1"/>
            <rect x="32" y="186" width="48" height="48" rx="6" fill="#fff7ed"/>
            <text x="92" y="204" fill="#0f172a" font-size="13" font-weight="700">Stainless Steel Cooking Utensils &amp; Frying Pan Set</text>
            <text x="92" y="220" fill="#94a3b8" font-size="11">Item #27 • Heavy duty stainless steel skillet and spatulas...</text>
            
            <text x="360" y="212" fill="#334155" font-size="12">Home Appliances</text>
            
            <rect x="540" y="200" width="90" height="22" rx="4" fill="#ecfdf5"/>
            <text x="585" y="215" fill="#047857" font-size="11" font-weight="600" text-anchor="middle">Donation</text>
            
            <rect x="720" y="200" width="70" height="22" rx="11" fill="#dcfce7"/>
            <text x="755" y="215" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">Available</text>
            
            <rect x="960" y="196" width="94" height="28" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
            <text x="1007" y="214" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Remove Post</text>
        </g>
    </g>
    '''

# A5: Manage Community Requests (/admin/requests) matching real database requests
def get_a5_live():
    return f'''
    <g transform="translate(288, 36)">
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">Manage Community Requests</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">Review and manage urgent help requests, calamity appeals, and neighborhood drives</text>
        
        <g transform="translate(980, 10)">
            <rect x="0" y="0" width="140" height="36" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="70" y="23" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">↻ Refresh Requests</text>
        </g>
        
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="140" height="32" rx="16" fill="#0f172a"/>
            <text x="70" y="21" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle">All Requests (3)</text>
            
            <rect x="150" y="0" width="150" height="32" rx="16" fill="#ecfdf5"/>
            <text x="225" y="21" fill="#047857" font-size="12" font-weight="600" text-anchor="middle">Active &amp; Open (3)</text>
            
            <rect x="310" y="0" width="140" height="32" rx="16" fill="#f1f5f9"/>
            <text x="380" y="21" fill="#475569" font-size="12" font-weight="600" text-anchor="middle">Cancelled (0)</text>
            
            <rect x="740" y="0" width="380" height="36" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="756" y="22" fill="#94a3b8" font-size="12">🔍 Search requests by title, category, or requester...</text>
        </g>
        
        <!-- Live Requests Table -->
        <g transform="translate(0, 126)">
            <rect x="0" y="0" width="1120" height="360" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="16" y="16" width="1088" height="40" rx="6" fill="#f8fafc"/>
            <text x="32" y="41" fill="#64748b" font-size="11" font-weight="700">REQUEST TITLE</text>
            <text x="380" y="41" fill="#64748b" font-size="11" font-weight="700">DESCRIPTION &amp; DETAILS</text>
            <text x="700" y="41" fill="#64748b" font-size="11" font-weight="700">URGENCY</text>
            <text x="840" y="41" fill="#64748b" font-size="11" font-weight="700">STATUS</text>
            <text x="980" y="41" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            
            <!-- Req 1: Water-Resistant Backpack -->
            <line x1="16" y1="116" x2="1104" y2="116" stroke="#f1f5f9" stroke-width="1"/>
            <text x="32" y="92" fill="#0f172a" font-size="13" font-weight="700">Durable Water-Resistant School Backpack</text>
            <text x="32" y="108" fill="#94a3b8" font-size="11">Request #12 • School &amp; Office</text>
            
            <text x="380" y="100" fill="#334155" font-size="12">Looking for a sturdy backpack for an incoming Grade 7 student.</text>
            
            <rect x="700" y="88" width="70" height="22" rx="4" fill="#fef3c7"/>
            <text x="735" y="103" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">HIGH</text>
            
            <rect x="840" y="88" width="70" height="22" rx="11" fill="#dcfce7"/>
            <text x="875" y="103" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">Open</text>
            
            <rect x="970" y="84" width="94" height="28" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
            <text x="1017" y="102" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Cancel</text>
            
            <!-- Req 2: Toddler Clothing -->
            <line x1="16" y1="172" x2="1104" y2="172" stroke="#f1f5f9" stroke-width="1"/>
            <text x="32" y="148" fill="#0f172a" font-size="13" font-weight="700">Toddler &amp; Children's Clothing (Ages 3-5)</text>
            <text x="32" y="164" fill="#94a3b8" font-size="11">Request #13 • Apparel</text>
            
            <text x="380" y="156" fill="#334155" font-size="12">Pre-loved shirts, shorts, or footwear in clean usable condition.</text>
            
            <rect x="700" y="144" width="70" height="22" rx="4" fill="#eff6ff"/>
            <text x="735" y="159" fill="#1e40af" font-size="11" font-weight="700" text-anchor="middle">MEDIUM</text>
            
            <rect x="840" y="144" width="70" height="22" rx="11" fill="#dcfce7"/>
            <text x="875" y="159" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">Open</text>
            
            <rect x="970" y="140" width="94" height="28" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
            <text x="1017" y="158" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Cancel</text>
            
            <!-- Req 3: Pantry Relief -->
            <line x1="16" y1="228" x2="1104" y2="228" stroke="#f1f5f9" stroke-width="1"/>
            <text x="32" y="204" fill="#0f172a" font-size="13" font-weight="700">Pantry Relief Essentials &amp; Rice Sack</text>
            <text x="32" y="220" fill="#94a3b8" font-size="11">Request #14 • Emergency Calamity Aid</text>
            
            <text x="380" y="212" fill="#334155" font-size="12">Assistance for community pantry supplies for affected families.</text>
            
            <rect x="700" y="200" width="76" height="22" rx="4" fill="#fee2e2"/>
            <text x="738" y="215" fill="#991b1b" font-size="11" font-weight="700" text-anchor="middle">CRITICAL</text>
            
            <rect x="840" y="200" width="70" height="22" rx="11" fill="#dcfce7"/>
            <text x="875" y="215" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">Open</text>
            
            <rect x="970" y="196" width="94" height="28" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
            <text x="1017" y="214" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Cancel</text>
        </g>
    </g>
    '''

# A6: Manage Moderation Reports (/admin/reports)
def get_a6_live():
    return f'''
    <g transform="translate(288, 36)">
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">Moderation Incident Reports</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">Live community reported content, user disputes, and moderation resolution workflows</text>
        
        <!-- 5 KPI Summary Boxes -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="212" height="74" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="26" fill="#94a3b8" font-size="11" font-weight="700">Total Reports</text>
            <text x="16" y="56" fill="#0f172a" font-size="22" font-weight="800">0</text>
            
            <rect x="226" y="0" width="212" height="74" rx="8" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
            <text x="242" y="26" fill="#92400e" font-size="11" font-weight="700">Pending</text>
            <text x="242" y="56" fill="#d97706" font-size="22" font-weight="800">0</text>
            
            <rect x="452" y="0" width="212" height="74" rx="8" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1"/>
            <text x="468" y="26" fill="#4338ca" font-size="11" font-weight="700">Under Review</text>
            <text x="468" y="56" fill="#4f46e5" font-size="22" font-weight="800">0</text>
            
            <rect x="678" y="0" width="212" height="74" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
            <text x="694" y="26" fill="#047857" font-size="11" font-weight="700">Resolved</text>
            <text x="694" y="56" fill="#10b981" font-size="22" font-weight="800">0</text>
            
            <rect x="904" y="0" width="212" height="74" rx="8" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
            <text x="920" y="26" fill="#b91c1c" font-size="11" font-weight="700">High Priority</text>
            <text x="920" y="56" fill="#ef4444" font-size="22" font-weight="800">0</text>
        </g>
        
        <!-- Filter Tabs & Search -->
        <g transform="translate(0, 166)">
            <rect x="0" y="0" width="120" height="32" rx="16" fill="#0f172a"/>
            <text x="60" y="21" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle">All Reports (0)</text>
            
            <rect x="130" y="0" width="110" height="32" rx="16" fill="#f1f5f9"/>
            <text x="185" y="21" fill="#475569" font-size="12" font-weight="600" text-anchor="middle">Pending (0)</text>
            
            <rect x="250" y="0" width="120" height="32" rx="16" fill="#f1f5f9"/>
            <text x="310" y="21" fill="#475569" font-size="12" font-weight="600" text-anchor="middle">Resolved (0)</text>
            
            <rect x="740" y="0" width="380" height="36" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="756" y="22" fill="#94a3b8" font-size="12">🔍 Search reports by reason, reporter, or user...</text>
        </g>
        
        <!-- Empty State / Clean Queue Card -->
        <g transform="translate(0, 218)">
            <rect x="0" y="0" width="1120" height="380" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <g transform="translate(560, 160)">
                <circle cx="0" cy="0" r="32" fill="#f0fdf4"/>
                <text x="0" y="10" fill="#16a34a" font-size="28" text-anchor="middle">✓</text>
                <text x="0" y="52" fill="#0f172a" font-size="16" font-weight="700" text-anchor="middle">Moderation Queue is Clear</text>
                <text x="0" y="74" fill="#64748b" font-size="13" text-anchor="middle">No pending community reports requiring administrator action.</text>
            </g>
        </g>
    </g>
    '''

screens = [
    ("A1_Admin_Dashboard_Live.svg", 0, get_a1_live(), "A1_Admin_Dashboard"),
    ("A2_Manage_Approvals_Live.svg", 1, get_a2_live(), "A2_Manage_Approvals"),
    ("A3_Manage_Users_Live.svg", 2, get_a3_live(), "A3_Manage_Users"),
    ("A4_Manage_Posts_Live.svg", 3, get_a4_live(), "A4_Manage_Posts"),
    ("A5_Manage_Requests_Live.svg", 4, get_a5_live(), "A5_Manage_Requests"),
    ("A6_Manage_Reports_Live.svg", 5, get_a6_live(), "A6_Manage_Reports"),
]

for filename, active_idx, content_svg, _ in screens:
    svg_code = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&amp;display=swap');
            text {{ font-family: 'Poppins', sans-serif; }}
        </style>
    </defs>
    <rect width="1440" height="960" fill="#f1f5f3" />
    {get_exact_sidebar(active_idx)}
    {content_svg}
</svg>'''
    with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as f:
        f.write(svg_code)
    print(f"Generated {filename}")

# Canvas with 6 screens
combined_groups = []
grid_coords = [
    (0, 0),       # A1
    (1520, 0),    # A2
    (3040, 0),    # A3
    (0, 1040),    # A4
    (1520, 1040), # A5
    (3040, 1040)  # A6
]

for idx, (filename, active_idx, content_svg, group_id) in enumerate(screens):
    x, y = grid_coords[idx]
    combined_groups.append(f'''
    <g id="{group_id}" transform="translate({x}, {y})">
        <rect width="1440" height="960" fill="#f1f5f3" rx="12"/>
        {get_exact_sidebar(active_idx)}
        {content_svg}
    </g>
    ''')

combined_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4560 2080" width="4560" height="2080">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&amp;display=swap');
            text {{ font-family: 'Poppins', sans-serif; }}
        </style>
    </defs>
    {''.join(combined_groups)}
</svg>'''

combined_path = os.path.join(output_dir, "ALL_6_ADMIN_PANELS_LIVE_CANVAS.svg")
with open(combined_path, "w", encoding="utf-8") as f:
    f.write(combined_svg)

print("ALL_6_ADMIN_PANELS_LIVE_CANVAS.svg generated successfully! Size:", len(combined_svg))
