import os

output_dir = r"c:\Users\Jeho\Downloads\BayanihanHubAfter\figma-admin-wireframes"
os.makedirs(output_dir, exist_ok=True)

# Exact Admin Sidebar matching src/components/layout/AdminLayout.tsx
def get_exact_sidebar_svg(active_index=0):
    nav_items = [
        ("Dashboard", "LayoutDashboard", "/admin"),
        ("Identity & Approvals", "ShieldCheck", "/admin/approvals"),
        ("Users", "Users", "/admin/users"),
        ("Posts", "Package", "/admin/posts"),
        ("Requests", "HandHeart", "/admin/requests"),
        ("Reports", "AlertOctagon", "/admin/reports"),
        ("Categories", "FolderTree", "/admin/categories"),
        ("Ratings", "Star", "/rate"),
        ("Settings", "Settings", "/settings")
    ]
    
    items_svg = ""
    y = 80
    for idx, (label, icon, route) in enumerate(nav_items):
        is_active = (idx == active_index)
        bg = 'fill="#27692a"' if is_active else 'fill="transparent"'
        text_color = '#ffffff' if is_active else '#94a3b8'
        font_weight = '700' if is_active else '600'
        shadow = '<rect x="0" y="0" width="224" height="38" rx="8" fill="#000" opacity="0.15"/>' if is_active else ''
        
        badge = ''
        if idx == 1:
            badge = f'<rect x="186" y="{y+9}" width="24" height="18" rx="9" fill="#d97706"/><text x="198" y="{y+22}" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle" font-family="Poppins, sans-serif">14</text>'
        elif idx == 5:
            badge = f'<rect x="190" y="{y+9}" width="20" height="18" rx="9" fill="#ef4444"/><text x="200" y="{y+22}" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle" font-family="Poppins, sans-serif">3</text>'
            
        items_svg += f'''
        <g transform="translate(16, {y})">
            {shadow}
            <rect x="0" y="0" width="224" height="38" rx="8" {bg} />
            <circle cx="18" cy="19" r="6" fill="{text_color}" opacity="0.7"/>
            <text x="34" y="24" fill="{text_color}" font-size="12" font-weight="{font_weight}" font-family="Poppins, sans-serif">{label}</text>
        </g>
        {badge}
        '''
        y += 44

    return f'''
    <!-- Exact Desktop Sidebar (w-64 = 256px, bg-[#0f172a], border-r border-[#1e293b]) -->
    <rect x="0" y="0" width="256" height="960" fill="#0f172a" />
    <line x1="256" y1="0" x2="256" y2="960" stroke="#1e293b" stroke-width="1"/>
    
    <!-- Brand Logo Header (p-5 border-b border-[#1e293b]) -->
    <g transform="translate(20, 20)">
        <rect x="0" y="0" width="32" height="32" rx="6" fill="#2e7d32" />
        <path d="M16 6 L6 16 L10 16 L10 26 L22 26 L22 16 L26 16 Z" fill="#ffffff"/>
        <text x="42" y="16" fill="#ffffff" font-size="14" font-weight="700" font-family="Poppins, sans-serif">Bayanihan Hub</text>
        <text x="42" y="29" fill="#66bb6a" font-size="10" font-weight="700" letter-spacing="1" font-family="Poppins, sans-serif">ADMIN PANEL</text>
    </g>
    <line x1="0" y1="68" x2="256" y2="68" stroke="#1e293b" stroke-width="1"/>
    
    <!-- Nav Items -->
    {items_svg}
    
    <!-- Sidebar Footer (p-4 border-t border-[#1e293b] bg-slate-950/40) -->
    <g transform="translate(0, 860)">
        <rect x="0" y="0" width="256" height="100" fill="#020617" opacity="0.4"/>
        <line x1="0" y1="0" x2="256" y2="0" stroke="#1e293b" stroke-width="1"/>
        <g transform="translate(16, 14)">
            <text x="24" y="16" fill="#94a3b8" font-size="12" font-weight="500" font-family="Poppins, sans-serif">← Back to Main App</text>
        </g>
        <g transform="translate(16, 50)">
            <text x="24" y="16" fill="#f87171" font-size="12" font-weight="600" font-family="Poppins, sans-serif">⎋ Logout (Admin)</text>
        </g>
    </g>
    '''

# =========================================================================
# Exact Screen A1: Admin Dashboard (/admin)
# =========================================================================
def generate_exact_a1():
    sidebar = get_exact_sidebar_svg(0)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&amp;display=swap');
            text {{ font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; }}
        </style>
    </defs>
    <!-- Background: bg-[#f1f5f3] -->
    <rect width="1440" height="960" fill="#f1f5f3" />
    {sidebar}
    
    <!-- Main Content (p-8, max-w-[72rem]) -->
    <g transform="translate(288, 36)">
        <!-- Page Title & Subtitle -->
        <text x="0" y="28" fill="#0f172a" font-size="28" font-weight="800">System Overview</text>
        <text x="0" y="52" fill="#64748b" font-size="14" font-weight="400">Bayanihan Hub live operational community stats, reports, and moderation queue.</text>
        
        <!-- Urgent Alert Banner (hasUrgentReports: true) -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="1120" height="60" rx="8" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
            <circle cx="28" cy="30" r="14" fill="#fef3c7"/>
            <text x="28" y="35" fill="#d97706" font-size="14" font-weight="800" text-anchor="middle">🛡️</text>
            <text x="56" y="26" fill="#92400e" font-size="14" font-weight="800">Action Required: Moderation Reports Awaiting Review</text>
            <text x="56" y="44" fill="#b45309" font-size="12" font-weight="400">There are 3 pending reports (1 high priority) flagged by community residents.</text>
            
            <rect x="920" y="14" width="180" height="32" rx="6" fill="#27692a"/>
            <text x="1010" y="34" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">Review Reports Queue →</text>
        </g>
        
        <!-- 5 Quick Stats Grid (gap 14px) -->
        <!-- 1. Total Users -->
        <g transform="translate(0, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" fill="#94a3b8" font-size="12" font-weight="700">Total Users</text>
            <text x="16" y="62" fill="#0f172a" font-size="24" font-weight="800">1,248</text>
        </g>
        
        <!-- 2. Total Posts -->
        <g transform="translate(226, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" fill="#94a3b8" font-size="12" font-weight="700">Total Posts</text>
            <text x="16" y="62" fill="#0f172a" font-size="24" font-weight="800">342</text>
        </g>
        
        <!-- 3. Active Requests -->
        <g transform="translate(452, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" fill="#94a3b8" font-size="12" font-weight="700">Active Requests</text>
            <text x="16" y="62" fill="#0f172a" font-size="24" font-weight="800">28</text>
        </g>
        
        <!-- 4. Pending Approvals (Amber Card) -->
        <g transform="translate(678, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
            <text x="16" y="28" fill="#92400e" font-size="12" font-weight="700">Pending Approvals</text>
            <text x="16" y="62" fill="#d97706" font-size="24" font-weight="800">14</text>
        </g>
        
        <!-- 5. Completed Exchanges (Green Accent) -->
        <g transform="translate(904, 152)">
            <rect x="0" y="0" width="212" height="84" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" fill="#94a3b8" font-size="12" font-weight="700">Completed Exchanges</text>
            <text x="16" y="62" fill="#27692a" font-size="24" font-weight="800">189</text>
        </g>
        
        <!-- 2 Large Split Cards (grid-cols-2 gap-5) -->
        <g transform="translate(0, 256)">
            <!-- Left Card: Reports & Moderation Dashboard -->
            <rect x="0" y="0" width="548" height="420" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <g transform="translate(24, 24)">
                <text x="0" y="18" fill="#0f172a" font-size="17" font-weight="800">Reports &amp; Moderation</text>
                <text x="0" y="36" fill="#64748b" font-size="12">Live moderation status and disciplinary queue</text>
                
                <rect x="376" y="0" width="124" height="32" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="438" y="20" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">Review Reports →</text>
                
                <!-- 4 Stat Boxes (Pending, Under Review, Resolved, High Priority) -->
                <g transform="translate(0, 60)">
                    <!-- Pending Box -->
                    <rect x="0" y="0" width="118" height="74" rx="6" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
                    <text x="59" y="24" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Pending</text>
                    <text x="59" y="56" fill="#d97706" font-size="22" font-weight="800" text-anchor="middle">3</text>
                    
                    <!-- Under Review Box -->
                    <rect x="127" y="0" width="118" height="74" rx="6" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1"/>
                    <text x="186" y="24" fill="#4338ca" font-size="11" font-weight="700" text-anchor="middle">Under Review</text>
                    <text x="186" y="56" fill="#4f46e5" font-size="22" font-weight="800" text-anchor="middle">2</text>
                    
                    <!-- Resolved Box -->
                    <rect x="254" y="0" width="118" height="74" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
                    <text x="313" y="24" fill="#047857" font-size="11" font-weight="700" text-anchor="middle">Resolved</text>
                    <text x="313" y="56" fill="#10b981" font-size="22" font-weight="800" text-anchor="middle">41</text>
                    
                    <!-- High Priority Box -->
                    <rect x="381" y="0" width="118" height="74" rx="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
                    <text x="440" y="24" fill="#b91c1c" font-size="11" font-weight="700" text-anchor="middle">High Priority</text>
                    <text x="440" y="56" fill="#ef4444" font-size="22" font-weight="800" text-anchor="middle">1</text>
                </g>
                
                <!-- Bottom Info -->
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
                    
                    <!-- Activity List Items -->
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
</svg>'''

# Write A1
with open(os.path.join(output_dir, "A1_Admin_Dashboard_Exact.svg"), "w", encoding="utf-8") as f:
    f.write(generate_exact_a1())

print("A1 Exact generated successfully.")
