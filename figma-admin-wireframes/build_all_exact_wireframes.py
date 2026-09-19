import os
import re

output_dir = r"c:\Users\Jeho\Downloads\BayanihanHubAfter\figma-admin-wireframes"
os.makedirs(output_dir, exist_ok=True)

# Exact Admin Sidebar matching src/components/layout/AdminLayout.tsx
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
        
        badge = ''
        if idx == 1:
            badge = f'<rect x="186" y="{y+9}" width="24" height="18" rx="9" fill="#d97706"/><text x="198" y="{y+22}" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">14</text>'
        elif idx == 5:
            badge = f'<rect x="190" y="{y+9}" width="20" height="18" rx="9" fill="#ef4444"/><text x="200" y="{y+22}" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3</text>'
            
        items_svg += f'''
        <g transform="translate(16, {y})">
            <rect x="0" y="0" width="224" height="38" rx="8" {bg} />
            <circle cx="18" cy="19" r="6" fill="{text_color}" opacity="0.7"/>
            <text x="34" y="24" fill="{text_color}" font-size="12" font-weight="{font_weight}">{label}</text>
        </g>
        {badge}
        '''
        y += 44

    return f'''
    <!-- Desktop Sidebar (256px, bg-[#0f172a], border-r border-[#1e293b]) -->
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
    
    <!-- Sidebar Footer (p-4 border-t border-[#1e293b] bg-slate-950/40) -->
    <g transform="translate(0, 860)">
        <rect x="0" y="0" width="256" height="100" fill="#020617" opacity="0.4"/>
        <line x1="0" y1="0" x2="256" y2="0" stroke="#1e293b" stroke-width="1"/>
        <text x="40" y="32" fill="#94a3b8" font-size="12" font-weight="500">← Back to Main App</text>
        <text x="40" y="68" fill="#f87171" font-size="12" font-weight="600">⎋ Logout (Admin)</text>
    </g>
    '''

# =========================================================================
# Exact Screen A1: Admin Dashboard (/admin)
# =========================================================================
def get_a1_content():
    return f'''
    <!-- Main Content (p-8, max-w-[72rem]) -->
    <g transform="translate(288, 36)">
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">System Overview</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">Bayanihan Hub live operational community stats, reports, and moderation queue.</text>
        
        <!-- Urgent Alert Banner -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="1120" height="60" rx="8" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
            <circle cx="28" cy="30" r="14" fill="#fef3c7"/>
            <text x="28" y="35" fill="#d97706" font-size="14" font-weight="800" text-anchor="middle">🛡️</text>
            <text x="56" y="26" fill="#92400e" font-size="14" font-weight="800">Action Required: Moderation Reports Awaiting Review</text>
            <text x="56" y="44" fill="#b45309" font-size="12" font-weight="400">There are 3 pending reports (1 high priority) flagged by community residents.</text>
            
            <rect x="920" y="14" width="180" height="32" rx="6" fill="#27692a"/>
            <text x="1010" y="34" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">Review Reports Queue →</text>
        </g>
        
        <!-- 5 Quick Stats Grid -->
        <g transform="translate(0, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" fill="#94a3b8" font-size="12" font-weight="700">Total Users</text>
            <text x="16" y="62" fill="#0f172a" font-size="24" font-weight="800">1,248</text>
        </g>
        
        <g transform="translate(226, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" fill="#94a3b8" font-size="12" font-weight="700">Total Posts</text>
            <text x="16" y="62" fill="#0f172a" font-size="24" font-weight="800">342</text>
        </g>
        
        <g transform="translate(452, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" fill="#94a3b8" font-size="12" font-weight="700">Active Requests</text>
            <text x="16" y="62" fill="#0f172a" font-size="24" font-weight="800">28</text>
        </g>
        
        <g transform="translate(678, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
            <text x="16" y="28" fill="#92400e" font-size="12" font-weight="700">Pending Approvals</text>
            <text x="16" y="62" fill="#d97706" font-size="24" font-weight="800">14</text>
        </g>
        
        <g transform="translate(904, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" fill="#94a3b8" font-size="12" font-weight="700">Completed Exchanges</text>
            <text x="16" y="62" fill="#27692a" font-size="24" font-weight="800">189</text>
        </g>
        
        <!-- 2 Large Split Cards (Reports & Moderation vs. Recent Activity) -->
        <g transform="translate(0, 256)">
            <!-- Left Card: Reports & Moderation -->
            <rect x="0" y="0" width="548" height="420" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <g transform="translate(24, 24)">
                <text x="0" y="18" fill="#0f172a" font-size="17" font-weight="800">Reports &amp; Moderation</text>
                <text x="0" y="36" fill="#64748b" font-size="12">Live moderation status and disciplinary queue</text>
                
                <rect x="376" y="0" width="124" height="32" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="438" y="20" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">Review Reports →</text>
                
                <g transform="translate(0, 60)">
                    <rect x="0" y="0" width="118" height="74" rx="6" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
                    <text x="59" y="24" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Pending</text>
                    <text x="59" y="56" fill="#d97706" font-size="22" font-weight="800" text-anchor="middle">3</text>
                    
                    <rect x="127" y="0" width="118" height="74" rx="6" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1"/>
                    <text x="186" y="24" fill="#4338ca" font-size="11" font-weight="700" text-anchor="middle">Under Review</text>
                    <text x="186" y="56" fill="#4f46e5" font-size="22" font-weight="800" text-anchor="middle">2</text>
                    
                    <rect x="254" y="0" width="118" height="74" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
                    <text x="313" y="24" fill="#047857" font-size="11" font-weight="700" text-anchor="middle">Resolved</text>
                    <text x="313" y="56" fill="#10b981" font-size="22" font-weight="800" text-anchor="middle">41</text>
                    
                    <rect x="381" y="0" width="118" height="74" rx="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
                    <text x="440" y="24" fill="#b91c1c" font-size="11" font-weight="700" text-anchor="middle">High Priority</text>
                    <text x="440" y="56" fill="#ef4444" font-size="22" font-weight="800" text-anchor="middle">1</text>
                </g>
                
                <line x1="0" y1="310" x2="500" y2="310" stroke="#f1f5f9" stroke-width="1"/>
                <g transform="translate(0, 330)">
                    <text x="0" y="16" fill="#64748b" font-size="12">7 dismissed reports archived</text>
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
                        <text x="16" y="30" fill="#334155" font-size="12" font-weight="500">Moderation report resolved by administrator</text>
                        <text x="484" y="30" fill="#94a3b8" font-size="11" text-anchor="end">Today</text>
                    </g>
                    
                    <g transform="translate(0, 112)">
                        <rect x="0" y="0" width="500" height="52" rx="8" fill="#f8faf9"/>
                        <text x="16" y="30" fill="#334155" font-size="12" font-weight="500">User identity verification approved: Carlo M.</text>
                        <text x="484" y="30" fill="#94a3b8" font-size="11" text-anchor="end">1 hour ago</text>
                    </g>
                    
                    <g transform="translate(0, 176)">
                        <rect x="0" y="0" width="500" height="52" rx="8" fill="#f8faf9"/>
                        <text x="16" y="30" fill="#334155" font-size="12" font-weight="500">Exchange marked completed (#exc-3)</text>
                        <text x="484" y="30" fill="#94a3b8" font-size="11" text-anchor="end">2 hours ago</text>
                    </g>
                </g>
            </g>
        </g>
    </g>
    '''

# =========================================================================
# Exact Screen A2: Manage Approvals & Identity Verification (/admin/approvals)
# =========================================================================
def get_a2_content():
    return f'''
    <!-- Main Content -->
    <g transform="translate(288, 36)">
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">Approvals &amp; Identity Verifications</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">Review valid Philippine IDs, facial biometric comparisons, and profile photos to maintain community trust.</text>
        
        <!-- Main Section Switcher Tabs (top right) -->
        <g transform="translate(740, 10)">
            <rect x="0" y="0" width="380" height="42" rx="10" fill="#e2e8f0"/>
            <rect x="4" y="4" width="190" height="34" rx="8" fill="#ffffff"/>
            <text x="99" y="25" fill="#1b5e20" font-size="12" font-weight="700" text-anchor="middle">🛡️ Identity Verifications</text>
            <rect x="168" y="10" width="20" height="16" rx="8" fill="#d97706"/>
            <text x="178" y="22" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">14</text>
            
            <text x="285" y="25" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">📷 Photo Approvals</text>
            <rect x="350" y="10" width="18" height="16" rx="8" fill="#d97706"/>
            <text x="359" y="22" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3</text>
        </g>
        
        <!-- 3 Metric Summary Cards -->
        <g transform="translate(0, 72)">
            <!-- Pending Review Card -->
            <rect x="0" y="0" width="360" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="16" y="16" width="52" height="52" rx="8" fill="#fffbeb"/>
            <text x="42" y="48" fill="#d97706" font-size="22" text-anchor="middle">⏱️</text>
            <text x="80" y="34" fill="#94a3b8" font-size="12" font-weight="700">Pending Identity Review</text>
            <text x="80" y="62" fill="#d97706" font-size="24" font-weight="800">14</text>
            
            <!-- Verified Identities Card -->
            <rect x="380" y="0" width="360" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="396" y="16" width="52" height="52" rx="8" fill="#f0fdf4"/>
            <text x="422" y="48" fill="#27692a" font-size="22" text-anchor="middle">✓</text>
            <text x="460" y="34" fill="#94a3b8" font-size="12" font-weight="700">Verified Identities</text>
            <text x="460" y="62" fill="#27692a" font-size="24" font-weight="800">142</text>
            
            <!-- Rejected Card -->
            <rect x="760" y="0" width="360" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <rect x="776" y="16" width="52" height="52" rx="8" fill="#fef2f2"/>
            <text x="802" y="48" fill="#dc2626" font-size="22" text-anchor="middle">✕</text>
            <text x="840" y="34" fill="#94a3b8" font-size="12" font-weight="700">Rejected / Retry</text>
            <text x="840" y="62" fill="#dc2626" font-size="24" font-weight="800">8</text>
        </g>
        
        <!-- Filter Tabs & Search Bar -->
        <g transform="translate(0, 176)">
            <rect x="0" y="0" width="130" height="34" rx="17" fill="#27692a"/>
            <text x="65" y="21" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">Pending (14)</text>
            
            <rect x="140" y="0" width="120" height="34" rx="17" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="200" y="21" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Approved (142)</text>
            
            <rect x="270" y="0" width="110" height="34" rx="17" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="325" y="21" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Rejected (8)</text>
            
            <!-- Search Bar -->
            <rect x="740" y="0" width="380" height="36" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="756" y="22" fill="#94a3b8" font-size="12">🔍 Search applicant by name, email, or ID type...</text>
        </g>
        
        <!-- Verification Applications Table / Card Grid -->
        <g transform="translate(0, 230)">
            <rect x="0" y="0" width="1120" height="640" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Table Header -->
            <rect x="16" y="16" width="1088" height="40" rx="6" fill="#f8fafc"/>
            <text x="32" y="41" fill="#64748b" font-size="11" font-weight="700">APPLICANT</text>
            <text x="240" y="41" fill="#64748b" font-size="11" font-weight="700">BARANGAY &amp; CONTACT</text>
            <text x="460" y="41" fill="#64748b" font-size="11" font-weight="700">SUBMITTED ID TYPE</text>
            <text x="640" y="41" fill="#64748b" font-size="11" font-weight="700">BIOMETRICS MATCH</text>
            <text x="800" y="41" fill="#64748b" font-size="11" font-weight="700">STATUS</text>
            <text x="960" y="41" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            
            <!-- Row 1: Juan Dela Cruz -->
            <g transform="translate(16, 68)">
                <rect x="0" y="0" width="1088" height="84" rx="8" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
                <circle cx="36" cy="42" r="20" fill="#2e7d32"/>
                <text x="36" y="48" fill="#fff" font-size="14" font-weight="800" text-anchor="middle">JD</text>
                <text x="68" y="36" fill="#0f172a" font-size="14" font-weight="700">Juan Dela Cruz</text>
                <text x="68" y="54" fill="#94a3b8" font-size="12">Submitted 18 mins ago</text>
                
                <text x="240" y="36" fill="#334155" font-size="13">Brgy. San Nicolas, Agoo</text>
                <text x="240" y="54" fill="#64748b" font-size="12">juan.delacruz@gmail.com</text>
                
                <rect x="460" y="30" width="130" height="24" rx="4" fill="#f1f5f9"/>
                <text x="525" y="46" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">PhilSys National ID</text>
                
                <rect x="640" y="30" width="110" height="24" rx="12" fill="#dcfce7"/>
                <text x="695" y="46" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">✓ 96.4% Match</text>
                
                <rect x="800" y="30" width="110" height="24" rx="12" fill="#fef3c7"/>
                <text x="855" y="46" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Pending Review</text>
                
                <rect x="940" y="26" width="68" height="32" rx="6" fill="#27692a"/>
                <text x="974" y="46" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Approve</text>
                
                <rect x="1016" y="26" width="60" height="32" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
                <text x="1046" y="46" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Reject</text>
            </g>
            
            <!-- Row 2: Maria Santos -->
            <g transform="translate(16, 160)">
                <rect x="0" y="0" width="1088" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="36" cy="42" r="20" fill="#2563eb"/>
                <text x="36" y="48" fill="#fff" font-size="14" font-weight="800" text-anchor="middle">MS</text>
                <text x="68" y="36" fill="#0f172a" font-size="14" font-weight="700">Maria Santos</text>
                <text x="68" y="54" fill="#94a3b8" font-size="12">Submitted 45 mins ago</text>
                
                <text x="240" y="36" fill="#334155" font-size="13">Brgy. San Antonio, Agoo</text>
                <text x="240" y="54" fill="#64748b" font-size="12">maria.santos@yahoo.com</text>
                
                <rect x="460" y="30" width="130" height="24" rx="4" fill="#f1f5f9"/>
                <text x="525" y="46" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">Driver's License</text>
                
                <rect x="640" y="30" width="110" height="24" rx="12" fill="#dcfce7"/>
                <text x="695" y="46" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">✓ 98.1% Match</text>
                
                <rect x="800" y="30" width="110" height="24" rx="12" fill="#fef3c7"/>
                <text x="855" y="46" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Pending Review</text>
                
                <rect x="940" y="26" width="68" height="32" rx="6" fill="#27692a"/>
                <text x="974" y="46" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Approve</text>
                
                <rect x="1016" y="26" width="60" height="32" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
                <text x="1046" y="46" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Reject</text>
            </g>
            
            <!-- Row 3: Carlo Reyes -->
            <g transform="translate(16, 252)">
                <rect x="0" y="0" width="1088" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="36" cy="42" r="20" fill="#d97706"/>
                <text x="36" y="48" fill="#fff" font-size="14" font-weight="800" text-anchor="middle">CR</text>
                <text x="68" y="36" fill="#0f172a" font-size="14" font-weight="700">Carlo Reyes</text>
                <text x="68" y="54" fill="#94a3b8" font-size="12">Submitted 1 hour ago</text>
                
                <text x="240" y="36" fill="#334155" font-size="13">Brgy. Santa Barbara</text>
                <text x="240" y="54" fill="#64748b" font-size="12">carlo99@gmail.com</text>
                
                <rect x="460" y="30" width="130" height="24" rx="4" fill="#f1f5f9"/>
                <text x="525" y="46" fill="#334155" font-size="11" font-weight="600" text-anchor="middle">Barangay ID</text>
                
                <rect x="640" y="30" width="110" height="24" rx="12" fill="#dcfce7"/>
                <text x="695" y="46" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">✓ 94.2% Match</text>
                
                <rect x="800" y="30" width="110" height="24" rx="12" fill="#fef3c7"/>
                <text x="855" y="46" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Pending Review</text>
                
                <rect x="940" y="26" width="68" height="32" rx="6" fill="#27692a"/>
                <text x="974" y="46" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Approve</text>
                
                <rect x="1016" y="26" width="60" height="32" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
                <text x="1046" y="46" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Reject</text>
            </g>
        </g>
    </g>
    '''

# =========================================================================
# Exact Screen A3: Manage Registered Users (/admin/users)
# =========================================================================
def get_a3_content():
    return f'''
    <!-- Main Content -->
    <g transform="translate(288, 36)">
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">Manage Registered Users</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">View and moderate all registered accounts in MySQL across all verification and moderation states</text>
        
        <!-- Refresh Users Button (top right) -->
        <g transform="translate(980, 10)">
            <rect x="0" y="0" width="140" height="36" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="70" y="23" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">↻ Refresh Users</text>
        </g>
        
        <!-- Status Filter Pills -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="140" height="32" rx="16" fill="#0f172a"/>
            <text x="70" y="21" fill="#ffffff" font-size="12" font-weight="600" text-anchor="middle">All Users (1,248)</text>
            
            <rect x="150" y="0" width="110" height="32" rx="16" fill="#fef3c7"/>
            <text x="205" y="21" fill="#b45309" font-size="12" font-weight="600" text-anchor="middle">Pending (14)</text>
            
            <rect x="270" y="0" width="130" height="32" rx="16" fill="#f1f5f9"/>
            <text x="335" y="21" fill="#475569" font-size="12" font-weight="600" text-anchor="middle">Approved (1,226)</text>
            
            <rect x="410" y="0" width="120" height="32" rx="16" fill="#fee2e2"/>
            <text x="470" y="21" fill="#991b1b" font-size="12" font-weight="600" text-anchor="middle">Suspended (8)</text>
            
            <!-- Search Bar -->
            <rect x="740" y="0" width="380" height="36" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="756" y="22" fill="#94a3b8" font-size="12">🔍 Search by name, email, municipality, or barangay...</text>
        </g>
        
        <!-- Users Data Table -->
        <g transform="translate(0, 126)">
            <rect x="0" y="0" width="1120" height="520" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Table Header -->
            <rect x="16" y="16" width="1088" height="40" rx="6" fill="#f8fafc"/>
            <text x="32" y="41" fill="#64748b" font-size="11" font-weight="700">RESIDENT NAME</text>
            <text x="240" y="41" fill="#64748b" font-size="11" font-weight="700">CONTACT &amp; LOCATION</text>
            <text x="470" y="41" fill="#64748b" font-size="11" font-weight="700">ACCOUNT STATUS</text>
            <text x="640" y="41" fill="#64748b" font-size="11" font-weight="700">ID &amp; BIOMETRICS</text>
            <text x="800" y="41" fill="#64748b" font-size="11" font-weight="700">ROLE</text>
            <text x="960" y="41" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            
            <!-- User 1 -->
            <line x1="16" y1="116" x2="1104" y2="116" stroke="#f1f5f9" stroke-width="1"/>
            <circle cx="44" cy="88" r="18" fill="#2e7d32"/>
            <text x="44" y="94" fill="#fff" font-size="12" font-weight="800" text-anchor="middle">JD</text>
            <text x="72" y="84" fill="#0f172a" font-size="13" font-weight="700">Juan Dela Cruz</text>
            <text x="72" y="100" fill="#94a3b8" font-size="11">@juandelacruz • ID #102</text>
            
            <text x="240" y="84" fill="#334155" font-size="12">juan.delacruz@gmail.com</text>
            <text x="240" y="100" fill="#64748b" font-size="11">San Nicolas, Agoo, La Union</text>
            
            <rect x="470" y="78" width="94" height="22" rx="11" fill="#fef3c7"/>
            <text x="517" y="93" fill="#92400e" font-size="10" font-weight="700" text-anchor="middle">⏳ PENDING</text>
            
            <text x="640" y="92" fill="#334155" font-size="12">PhilID • Submitted</text>
            
            <rect x="800" y="78" width="70" height="22" rx="4" fill="#f1f5f9"/>
            <text x="835" y="93" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">Neighbor</text>
            
            <rect x="960" y="74" width="80" height="28" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
            <text x="1000" y="92" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Suspend</text>
            
            <!-- User 2 -->
            <line x1="16" y1="172" x2="1104" y2="172" stroke="#f1f5f9" stroke-width="1"/>
            <circle cx="44" cy="144" r="18" fill="#2563eb"/>
            <text x="44" y="150" fill="#fff" font-size="12" font-weight="800" text-anchor="middle">MS</text>
            <text x="72" y="140" fill="#0f172a" font-size="13" font-weight="700">Maria Santos</text>
            <text x="72" y="156" fill="#94a3b8" font-size="11">@mariasantos • ID #103</text>
            
            <text x="240" y="140" fill="#334155" font-size="12">maria.s@yahoo.com</text>
            <text x="240" y="156" fill="#64748b" font-size="11">San Antonio, Agoo</text>
            
            <rect x="470" y="134" width="94" height="22" rx="11" fill="#dcfce7"/>
            <text x="517" y="149" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">✓ APPROVED</text>
            
            <text x="640" y="148" fill="#166534" font-size="12" font-weight="600">License • Verified</text>
            
            <rect x="800" y="134" width="70" height="22" rx="4" fill="#f1f5f9"/>
            <text x="835" y="149" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">Neighbor</text>
            
            <rect x="960" y="130" width="80" height="28" rx="6" fill="#ffffff" stroke="#dc2626" stroke-width="1"/>
            <text x="1000" y="148" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Suspend</text>
            
            <!-- User 3 (Suspended) -->
            <line x1="16" y1="228" x2="1104" y2="228" stroke="#f1f5f9" stroke-width="1"/>
            <circle cx="44" cy="200" r="18" fill="#dc2626"/>
            <text x="44" y="206" fill="#fff" font-size="12" font-weight="800" text-anchor="middle">CR</text>
            <text x="72" y="196" fill="#0f172a" font-size="13" font-weight="700">Carlo Reyes</text>
            <text x="72" y="212" fill="#dc2626" font-size="11" font-weight="600">Suspension active: 7 days remaining</text>
            
            <text x="240" y="196" fill="#334155" font-size="12">carlo99@gmail.com</text>
            <text x="240" y="212" fill="#64748b" font-size="11">Santa Barbara, Agoo</text>
            
            <rect x="470" y="190" width="104" height="22" rx="11" fill="#fee2e2"/>
            <text x="522" y="205" fill="#991b1b" font-size="10" font-weight="700" text-anchor="middle">✕ SUSPENDED</text>
            
            <text x="640" y="204" fill="#64748b" font-size="12">Barangay ID</text>
            
            <rect x="800" y="190" width="70" height="22" rx="4" fill="#f1f5f9"/>
            <text x="835" y="205" fill="#475569" font-size="11" font-weight="600" text-anchor="middle">Neighbor</text>
            
            <rect x="960" y="186" width="94" height="28" rx="6" fill="#27692a"/>
            <text x="1007" y="204" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Lift Suspension</text>
        </g>
        
        <!-- Exact Suspension Modal Component (Matching ManageUsersPage.tsx) -->
        <g transform="translate(620, 240)">
            <rect x="-10" y="-10" width="500" height="420" rx="16" fill="#000000" opacity="0.35"/>
            <rect x="0" y="0" width="480" height="400" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
            
            <g transform="translate(24, 20)">
                <text x="0" y="20" fill="#dc2626" font-size="16" font-weight="800">⚠️ Suspend User Account</text>
                <text x="0" y="38" fill="#64748b" font-size="12">Temporarily ban or restrict access for Carlo Reyes</text>
            </g>
            <line x1="0" y1="72" x2="480" y2="72" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Predefined Durations -->
            <g transform="translate(24, 88)">
                <text x="0" y="14" fill="#0f172a" font-size="12" font-weight="700">Suspension Duration</text>
                <rect x="0" y="24" width="70" height="30" rx="6" fill="#f1f5f9"/>
                <text x="35" y="44" fill="#334155" font-size="11" text-anchor="middle">1 Day</text>
                
                <rect x="78" y="24" width="70" height="30" rx="6" fill="#f1f5f9"/>
                <text x="113" y="44" fill="#334155" font-size="11" text-anchor="middle">3 Days</text>
                
                <rect x="156" y="24" width="70" height="30" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
                <text x="191" y="44" fill="#991b1b" font-size="11" font-weight="700" text-anchor="middle">7 Days</text>
                
                <rect x="234" y="24" width="70" height="30" rx="6" fill="#f1f5f9"/>
                <text x="269" y="44" fill="#334155" font-size="11" text-anchor="middle">14 Days</text>
                
                <rect x="312" y="24" width="70" height="30" rx="6" fill="#f1f5f9"/>
                <text x="347" y="44" fill="#334155" font-size="11" text-anchor="middle">30 Days</text>
                
                <rect x="390" y="24" width="42" height="30" rx="6" fill="#f1f5f9"/>
                <text x="411" y="44" fill="#dc2626" font-size="11" font-weight="700" text-anchor="middle">Ban</text>
                
                <!-- Reason Selector -->
                <text x="0" y="84" fill="#0f172a" font-size="12" font-weight="700">Violation Reason</text>
                <rect x="0" y="94" width="432" height="34" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="12" y="116" fill="#334155" font-size="12">Community guidelines violation ▾</text>
                
                <!-- Admin Message -->
                <text x="0" y="154" fill="#0f172a" font-size="12" font-weight="700">Message to User (Optional notification)</text>
                <rect x="0" y="164" width="432" height="60" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="12" y="184" fill="#94a3b8" font-size="11">Your account has been suspended due to verified community reports...</text>
            </g>
            
            <!-- Modal Actions -->
            <g transform="translate(24, 340)">
                <rect x="0" y="0" width="180" height="38" rx="6" fill="#dc2626"/>
                <text x="90" y="24" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">Confirm Suspension</text>
                
                <rect x="190" y="0" width="90" height="38" rx="6" fill="#f1f5f9"/>
                <text x="235" y="24" fill="#475569" font-size="12" font-weight="600" text-anchor="middle">Cancel</text>
            </g>
        </g>
    </g>
    '''

# Combine and write files
files = {
    "A1_Admin_Dashboard_Exact.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960"><defs><style>@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&amp;display=swap"); text {{ font-family: "Poppins", sans-serif; }}</style></defs><rect width="1440" height="960" fill="#f1f5f3" />{get_exact_sidebar(0)}{get_a1_content()}</svg>',
    "A2_Manage_Approvals_Exact.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960"><defs><style>@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&amp;display=swap"); text {{ font-family: "Poppins", sans-serif; }}</style></defs><rect width="1440" height="960" fill="#f1f5f3" />{get_exact_sidebar(1)}{get_a2_content()}</svg>',
    "A3_Manage_Users_Exact.svg": f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960"><defs><style>@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&amp;display=swap"); text {{ font-family: "Poppins", sans-serif; }}</style></defs><rect width="1440" height="960" fill="#f1f5f3" />{get_exact_sidebar(2)}{get_a3_content()}</svg>',
}

for filename, content in files.items():
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Wrote", filename)

print("Exact files generated successfully!")
