import os
import html

output_dir = r"c:\Users\Jeho\Downloads\BayanihanHubAfter\figma-admin-wireframes"
os.makedirs(output_dir, exist_ok=True)

def esc(text):
    return html.escape(str(text))

# ==============================================================================
# EXACT SIDEBAR MATCHING RUNNING APP
# ==============================================================================
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
    
    # SVG icons for nav items
    icons = [
        # Dashboard (LayoutDashboard)
        '<rect x="0" y="0" width="6" height="6" rx="1"/><rect x="8" y="0" width="6" height="6" rx="1"/><rect x="0" y="8" width="6" height="6" rx="1"/><rect x="8" y="8" width="6" height="6" rx="1"/>',
        # Approvals (ShieldCheck)
        '<path d="M7 1 L13 3.5 V7 C13 10.5 7 13 7 13 C7 13 1 10.5 1 7 V3.5 Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 7 L6 8.5 L9.5 5" fill="none" stroke="currentColor" stroke-width="1.5"/>',
        # Users
        '<circle cx="6" cy="4" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1 13 C1 10 3 9 6 9 C9 9 11 10 11 13" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="11" cy="4" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 9 C12.5 9.5 13.5 10.5 13.5 12" fill="none" stroke="currentColor" stroke-width="1.5"/>',
        # Posts (Package)
        '<path d="M7 1 L13 4 V10 L7 13 L1 10 V4 Z" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="1" y1="4" x2="7" y2="7" stroke="currentColor" stroke-width="1.5"/><line x1="13" y1="4" x2="7" y2="7" stroke="currentColor" stroke-width="1.5"/><line x1="7" y1="7" x2="7" y2="13" stroke="currentColor" stroke-width="1.5"/>',
        # Requests (HandHeart)
        '<path d="M7 2.5 C6 -0.5 2 0.5 2 3.5 C2 6 7 9 7 9 C7 9 12 6 12 3.5 C12 0.5 8 -0.5 7 2.5 Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1 10 L4 12 L7 11 L10 12 L13 10" fill="none" stroke="currentColor" stroke-width="1.5"/>',
        # Reports (AlertOctagon)
        '<polygon points="4,1 10,1 13,4 13,10 10,13 4,13 1,10 1,4" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="7" y1="4" x2="7" y2="7" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="10" r="0.75" fill="currentColor"/>',
        # Categories (FolderTree)
        '<path d="M1 3 H5 L7 5 H13 V11 H1 Z" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="11" x2="4" y2="14" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="14" x2="7" y2="14" stroke="currentColor" stroke-width="1.5"/>',
        # Ratings (Star)
        '<polygon points="7,1 8.8,5.2 13.3,5.5 9.8,8.4 10.9,12.8 7,10.4 3.1,12.8 4.2,8.4 0.7,5.5 5.2,5.2" fill="none" stroke="currentColor" stroke-width="1.5"/>',
        # Settings
        '<circle cx="7" cy="7" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 1 V2.5 M7 11.5 V13 M1 7 H2.5 M11.5 7 H13" stroke="currentColor" stroke-width="1.5"/>'
    ]

    items_svg = ""
    y = 76
    for idx, (label, route) in enumerate(nav_items):
        is_active = (idx == active_index)
        bg = 'fill="#27692a"' if is_active else 'fill="transparent"'
        text_color = '#ffffff' if is_active else '#94a3b8'
        font_weight = '700' if is_active else '500'
        icon_svg = icons[idx]
        
        items_svg += f'''
        <g transform="translate(12, {y})">
            <rect x="0" y="0" width="232" height="38" rx="8" {bg} />
            <g transform="translate(14, 12)" stroke="{text_color}" fill="{text_color}">
                {icon_svg}
            </g>
            <text x="38" y="24" fill="{text_color}" font-size="12" font-weight="{font_weight}">{label}</text>
        </g>
        '''
        y += 42

    return f'''
    <!-- Desktop Sidebar (256px, #0f172a, border #1e293b) -->
    <rect x="0" y="0" width="256" height="100%" fill="#0f172a" />
    <line x1="256" y1="0" x2="256" y2="100%" stroke="#1e293b" stroke-width="1"/>
    
    <!-- Logo Brand Header -->
    <g transform="translate(20, 20)">
        <circle cx="16" cy="16" r="16" fill="#1b4332" />
        <path d="M16 8 L8 15 L11 15 L11 23 L21 23 L21 15 L24 15 Z" fill="#48bb78"/>
        <text x="40" y="16" fill="#ffffff" font-size="13" font-weight="700">Bayanihan Hub</text>
        <text x="40" y="28" fill="#48bb78" font-size="9" font-weight="700" letter-spacing="0.8">ADMIN PANEL</text>
    </g>
    <line x1="0" y1="64" x2="256" y2="64" stroke="#1e293b" stroke-width="1"/>
    
    <!-- Navigation Items -->
    {items_svg}
    
    <!-- Sidebar Footer -->
    <g transform="translate(0, 870)">
        <line x1="0" y1="0" x2="256" y2="0" stroke="#1e293b" stroke-width="1"/>
        <g transform="translate(16, 16)">
            <text x="24" y="16" fill="#94a3b8" font-size="12" font-weight="500">Back to Main App</text>
            <path d="M14 12 L8 12 M8 12 L11 9 M8 12 L11 15" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
        </g>
        <g transform="translate(16, 52)">
            <text x="24" y="16" fill="#f87171" font-size="12" font-weight="600">Logout (Admin)</text>
            <path d="M8 12 H14 M14 12 L11 9 M14 12 L11 15 M8 7 V5 H3 V19 H8 V17" fill="none" stroke="#f87171" stroke-width="1.5"/>
        </g>
    </g>
    '''

def get_floating_ai():
    return '''
    <!-- Floating AI Assistant Button (Bottom Right) -->
    <g transform="translate(1230, 890)">
        <rect x="0" y="0" width="146" height="46" rx="23" fill="#1e4620" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.15))"/>
        <g transform="translate(16, 15)">
            <rect x="0" y="0" width="16" height="13" rx="3" fill="none" stroke="#ffffff" stroke-width="1.5"/>
            <circle cx="5" cy="6" r="1" fill="#ffffff"/>
            <circle cx="11" cy="6" r="1" fill="#ffffff"/>
            <line x1="8" y1="-3" x2="8" y2="0" stroke="#ffffff" stroke-width="1.5"/>
        </g>
        <text x="44" y="28" fill="#ffffff" font-size="13" font-weight="700">AI Assistant</text>
        <path d="M126 18 L128 22 L132 24 L128 26 L126 30 L124 26 L120 24 L124 22 Z" fill="#a7f3d0"/>
    </g>
    '''

# ==============================================================================
# SCREEN A1: SYSTEM OVERVIEW (/admin)
# ==============================================================================
def get_a1_dashboard():
    return f'''
    <g transform="translate(288, 32)">
        <text x="0" y="26" fill="#0f172a" font-size="28" font-weight="800">System Overview</text>
        <text x="0" y="48" fill="#64748b" font-size="13" font-weight="400">Bayanihan Hub live operational community stats, reports, and moderation queue.</text>
        
        <!-- 5 Metric Cards -->
        <g transform="translate(0, 72)">
            <!-- Total Users -->
            <g transform="translate(0, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="18" y="30" fill="#64748b" font-size="12" font-weight="700">Total Users</text>
                <text x="18" y="68" fill="#0f172a" font-size="26" font-weight="800">2</text>
            </g>
            <!-- Total Posts -->
            <g transform="translate(226, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="18" y="30" fill="#64748b" font-size="12" font-weight="700">Total Posts</text>
                <text x="18" y="68" fill="#0f172a" font-size="26" font-weight="800">10</text>
            </g>
            <!-- Active Requests -->
            <g transform="translate(452, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="18" y="30" fill="#64748b" font-size="12" font-weight="700">Active Requests</text>
                <text x="18" y="68" fill="#0f172a" font-size="26" font-weight="800">3</text>
            </g>
            <!-- Pending Approvals (Yellow Border & Highlight) -->
            <g transform="translate(678, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#fefce8" stroke="#fde68a" stroke-width="1.5"/>
                <text x="18" y="30" fill="#92400e" font-size="12" font-weight="700">Pending Approvals</text>
                <text x="18" y="68" fill="#d97706" font-size="26" font-weight="800">0</text>
            </g>
            <!-- Completed Exchanges -->
            <g transform="translate(904, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="18" y="30" fill="#64748b" font-size="12" font-weight="700">Completed Exchanges</text>
                <text x="18" y="68" fill="#16a34a" font-size="26" font-weight="800">3</text>
            </g>
        </g>
        
        <!-- Two Column Section -->
        <g transform="translate(0, 194)">
            <!-- Left Card: Reports & Moderation -->
            <g transform="translate(0, 0)">
                <rect x="0" y="0" width="544" height="256" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                
                <text x="24" y="38" fill="#0f172a" font-size="16" font-weight="800">Reports &amp; Moderation</text>
                <text x="24" y="58" fill="#64748b" font-size="12">Live moderation status and disciplinary queue</text>
                
                <!-- Review Reports Button -->
                <rect x="396" y="20" width="124" height="34" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="458" y="42" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">Review Reports →</text>
                
                <!-- 4 Stat Boxes Grid -->
                <g transform="translate(24, 84)">
                    <!-- Pending -->
                    <rect x="0" y="0" width="116" height="74" rx="8" fill="#fefce8" stroke="#fef08a" stroke-width="1"/>
                    <text x="58" y="24" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">Pending</text>
                    <text x="58" y="54" fill="#d97706" font-size="22" font-weight="800" text-anchor="middle">0</text>
                    
                    <!-- Under Review -->
                    <rect x="126" y="0" width="116" height="74" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
                    <text x="184" y="24" fill="#1e40af" font-size="11" font-weight="700" text-anchor="middle">Under Review</text>
                    <text x="184" y="54" fill="#3b82f6" font-size="22" font-weight="800" text-anchor="middle">0</text>
                    
                    <!-- Resolved -->
                    <rect x="252" y="0" width="116" height="74" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
                    <text x="310" y="24" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">Resolved</text>
                    <text x="310" y="54" fill="#16a34a" font-size="22" font-weight="800" text-anchor="middle">0</text>
                    
                    <!-- High Priority -->
                    <rect x="378" y="0" width="116" height="74" rx="8" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
                    <text x="436" y="24" fill="#991b1b" font-size="11" font-weight="700" text-anchor="middle">High Priority</text>
                    <text x="436" y="54" fill="#ef4444" font-size="22" font-weight="800" text-anchor="middle">0</text>
                </g>
                
                <line x1="24" y1="184" x2="520" y2="184" stroke="#f1f5f9" stroke-width="1"/>
                
                <!-- Footer link -->
                <text x="24" y="222" fill="#64748b" font-size="12">0 dismissed reports archived</text>
                <text x="520" y="222" fill="#27692a" font-size="12" font-weight="700" text-anchor="end">Open Full Moderation Console →</text>
            </g>
            
            <!-- Right Card: Recent Moderation & Activity -->
            <g transform="translate(572, 0)">
                <rect x="0" y="0" width="544" height="256" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="24" y="38" fill="#0f172a" font-size="16" font-weight="800">Recent Moderation &amp; Activity</text>
                
                <!-- Activity 1 -->
                <g transform="translate(24, 66)">
                    <rect x="0" y="0" width="496" height="44" rx="8" fill="#f8faf9"/>
                    <text x="14" y="27" fill="#334155" font-size="12" font-weight="500">Moderation report resolved by administrator</text>
                    <text x="482" y="27" fill="#94a3b8" font-size="11" text-anchor="end">Today</text>
                </g>
                
                <!-- Activity 2 -->
                <g transform="translate(24, 122)">
                    <rect x="0" y="0" width="496" height="44" rx="8" fill="#f8faf9"/>
                    <text x="14" y="27" fill="#334155" font-size="12" font-weight="500">User identity verification approved: Carlo M.</text>
                    <text x="482" y="27" fill="#94a3b8" font-size="11" text-anchor="end">1 hour ago</text>
                </g>
                
                <!-- Activity 3 -->
                <g transform="translate(24, 178)">
                    <rect x="0" y="0" width="496" height="44" rx="8" fill="#f8faf9"/>
                    <text x="14" y="27" fill="#334155" font-size="12" font-weight="500">Exchange marked completed (#exc-3)</text>
                    <text x="482" y="27" fill="#94a3b8" font-size="11" text-anchor="end">2 hours ago</text>
                </g>
            </g>
        </g>
    </g>
    {get_floating_ai()}
    '''

# ==============================================================================
# SCREEN A1b: BETA NOTICE MODAL (EXACT FROM LIVE APP)
# ==============================================================================
def get_a1_beta_modal():
    return f'''
    <!-- Backdrop blur -->
    <rect width="1440" height="960" fill="#0f172a" opacity="0.72"/>
    
    <!-- Modal Container -->
    <g transform="translate(432, 140)">
        <rect x="0" y="0" width="576" height="680" rx="20" fill="#18181b" stroke="rgba(139, 92, 246, 0.35)" stroke-width="1" filter="drop-shadow(0 25px 50px rgba(0,0,0,0.7))"/>
        
        <!-- Top Gradient Bar -->
        <rect x="0" y="0" width="576" height="6" rx="3" fill="url(#modalGradient)"/>
        
        <!-- Header -->
        <g transform="translate(28, 30)">
            <rect x="0" y="0" width="40" height="40" rx="10" fill="#7c3aed" opacity="0.9"/>
            <path d="M20 12 L22 17 L27 19 L22 21 L20 26 L18 21 L13 19 L18 17 Z" fill="#ffffff"/>
            
            <rect x="54" y="0" width="94" height="20" rx="10" fill="rgba(139, 92, 246, 0.2)"/>
            <text x="101" y="14" fill="#c084fc" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="0.5">BETA RELEASE</text>
            
            <text x="54" y="38" fill="#ffffff" font-size="20" font-weight="800">BayanihanHub Beta Testing</text>
            
            <!-- Close Button (X) -->
            <g transform="translate(480, 4)">
                <circle cx="16" cy="16" r="16" fill="rgba(255,255,255,0.08)"/>
                <path d="M11 11 L21 21 M21 11 L11 21" stroke="#94a3b8" stroke-width="1.5"/>
            </g>
        </g>
        
        <!-- Callout 1: Beta Notice Info Box -->
        <g transform="translate(28, 96)">
            <rect x="0" y="0" width="520" height="110" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(139, 92, 246, 0.25)" stroke-width="1"/>
            <circle cx="28" cy="30" r="10" fill="none" stroke="#a78bfa" stroke-width="1.5"/>
            <text x="28" y="34" fill="#a78bfa" font-size="12" font-weight="700" text-anchor="middle">i</text>
            
            <text x="50" y="34" fill="#ffffff" font-size="14" font-weight="700">This deployment of BayanihanHub is currently for beta testing.</text>
            <text x="20" y="66" fill="#cbd5e1" font-size="13">You may encounter bugs, errors, unexpected behavior, or features that still</text>
            <text x="20" y="86" fill="#cbd5e1" font-size="13">need improvement while using the platform.</text>
        </g>
        
        <!-- Callout 2: Development Team Contact Box -->
        <g transform="translate(28, 222)">
            <rect x="0" y="0" width="520" height="150" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(139, 92, 246, 0.25)" stroke-width="1"/>
            <circle cx="28" cy="28" r="8" fill="none" stroke="#a78bfa" stroke-width="1.5"/>
            <text x="48" y="32" fill="#ffffff" font-size="13" font-weight="600">If you encounter any bug or error, please report it to any member of the development team:</text>
            
            <!-- Team Pills -->
            <g transform="translate(18, 52)">
                <rect x="0" y="0" width="70" height="26" rx="6" fill="#4c1d95" opacity="0.7"/>
                <text x="35" y="17" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Jehosue</text>
                
                <rect x="78" y="0" width="88" height="26" rx="6" fill="#4c1d95" opacity="0.7"/>
                <text x="122" y="17" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Christopher</text>
                
                <rect x="174" y="0" width="68" height="26" rx="6" fill="#4c1d95" opacity="0.7"/>
                <text x="208" y="17" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Laurice</text>
                
                <rect x="250" y="0" width="60" height="26" rx="6" fill="#4c1d95" opacity="0.7"/>
                <text x="280" y="17" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Trisha</text>
                
                <rect x="318" y="0" width="54" height="26" rx="6" fill="#4c1d95" opacity="0.7"/>
                <text x="345" y="17" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Leah</text>
            </g>
            
            <g transform="translate(18, 98)">
                <rect x="0" y="0" width="16" height="12" rx="2" fill="none" stroke="#a78bfa" stroke-width="1.2"/>
                <path d="M0 0 L8 6 L16 0" stroke="#a78bfa" stroke-width="1.2" fill="none"/>
                <text x="24" y="11" fill="#cbd5e1" font-size="12">You may also report the problem through the designated team email:</text>
                <text x="0" y="32" fill="#c084fc" font-size="13" font-weight="600">jbiscarra24113423@student.dmmmsu.edu.ph</text>
            </g>
        </g>
        
        <!-- Checklist Section -->
        <g transform="translate(28, 390)">
            <text x="0" y="16" fill="#ffffff" font-size="13" font-weight="700">When reporting a problem, please feel free to attach:</text>
            
            <!-- 4 Grid Items -->
            <g transform="translate(0, 30)">
                <rect x="0" y="0" width="252" height="38" rx="8" fill="rgba(255,255,255,0.05)"/>
                <text x="38" y="24" fill="#cbd5e1" font-size="12">A video recording of the problem</text>
                
                <rect x="268" y="0" width="252" height="38" rx="8" fill="rgba(255,255,255,0.05)"/>
                <text x="306" y="24" fill="#cbd5e1" font-size="12">A screenshot or photo</text>
                
                <rect x="0" y="46" width="252" height="52" rx="8" fill="rgba(255,255,255,0.05)"/>
                <text x="38" y="24" fill="#cbd5e1" font-size="12">Detailed information about what</text>
                <text x="38" y="40" fill="#cbd5e1" font-size="12">happened</text>
                
                <rect x="268" y="46" width="252" height="52" rx="8" fill="rgba(255,255,255,0.05)"/>
                <text x="306" y="24" fill="#cbd5e1" font-size="12">The steps you took before the</text>
                <text x="306" y="40" fill="#cbd5e1" font-size="12">problem occurred</text>
            </g>
        </g>
        
        <!-- Footer Button -->
        <g transform="translate(28, 596)">
            <text x="0" y="24" fill="#94a3b8" font-size="11">Your feedback will help us identify problems, improve BayanihanHub, and prepare</text>
            <text x="0" y="40" fill="#94a3b8" font-size="11">the platform for its full release.</text>
            
            <rect x="380" y="10" width="140" height="42" rx="8" fill="url(#btnGradient)"/>
            <text x="450" y="36" fill="#ffffff" font-size="14" font-weight="700" text-anchor="middle">Okay</text>
        </g>
    </g>
    '''

# ==============================================================================
# SCREEN A2: IDENTITY APPROVALS (/admin/approvals - Identity Verifications Tab)
# ==============================================================================
def get_a2_identity():
    return f'''
    <g transform="translate(288, 32)">
        <text x="0" y="26" fill="#0f172a" font-size="28" font-weight="800">Approvals &amp; Identity Verifications</text>
        <text x="0" y="48" fill="#64748b" font-size="13" font-weight="400">Review valid Philippine IDs, facial biometric comparisons, and profile photos to maintain community trust.</text>
        
        <!-- Segmented Tab Switcher (Identity vs Photo) -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="370" height="46" rx="8" fill="#e2e8f0" opacity="0.6"/>
            
            <!-- Active Tab: Identity Verifications -->
            <rect x="4" y="4" width="190" height="38" rx="6" fill="#ffffff" stroke="#27692a" stroke-width="1.5"/>
            <path d="M26 15 L32 17.5 V21 C32 24.5 26 27 26 27 C26 27 20 24.5 20 21 V17.5 Z" fill="none" stroke="#27692a" stroke-width="1.5"/>
            <path d="M23.5 21 L25 22.5 L28.5 19" fill="none" stroke="#27692a" stroke-width="1.5"/>
            <text x="42" y="28" fill="#27692a" font-size="13" font-weight="700">Identity Verifications</text>
            
            <!-- Inactive Tab: Photo Approvals -->
            <g transform="translate(202, 10)">
                <rect x="6" y="6" width="16" height="12" rx="2" fill="none" stroke="#64748b" stroke-width="1.5"/>
                <circle cx="14" cy="12" r="3" fill="none" stroke="#64748b" stroke-width="1.5"/>
                <text x="30" y="18" fill="#64748b" font-size="13" font-weight="600">Photo Approvals</text>
            </g>
        </g>
        
        <!-- 3 Stat Cards Row -->
        <g transform="translate(0, 138)">
            <!-- Pending Identity Review -->
            <g transform="translate(0, 0)">
                <rect x="0" y="0" width="360" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="42" cy="46" r="22" fill="#fffbeb"/>
                <circle cx="42" cy="46" r="10" fill="none" stroke="#d97706" stroke-width="1.5"/>
                <polyline points="42,40 42,46 46,46" stroke="#d97706" stroke-width="1.5" fill="none"/>
                
                <text x="78" y="36" fill="#64748b" font-size="12" font-weight="700">Pending Identity Review</text>
                <text x="78" y="68" fill="#d97706" font-size="26" font-weight="800">0</text>
            </g>
            
            <!-- Verified Identities -->
            <g transform="translate(380, 0)">
                <rect x="0" y="0" width="360" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="42" cy="46" r="22" fill="#f0fdf4"/>
                <circle cx="42" cy="46" r="10" fill="none" stroke="#16a34a" stroke-width="1.5"/>
                <path d="M38 46 L41 49 L47 43" stroke="#16a34a" stroke-width="1.5" fill="none"/>
                
                <text x="78" y="36" fill="#64748b" font-size="12" font-weight="700">Verified Identities</text>
                <text x="78" y="68" fill="#16a34a" font-size="26" font-weight="800">0</text>
            </g>
            
            <!-- Rejected / Retry Required -->
            <g transform="translate(760, 0)">
                <rect x="0" y="0" width="360" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="42" cy="46" r="22" fill="#fef2f2"/>
                <circle cx="42" cy="46" r="10" fill="none" stroke="#dc2626" stroke-width="1.5"/>
                <path d="M38 42 L46 50 M46 42 L38 50" stroke="#dc2626" stroke-width="1.5"/>
                
                <text x="78" y="36" fill="#64748b" font-size="12" font-weight="700">Rejected / Retry Required</text>
                <text x="78" y="68" fill="#dc2626" font-size="26" font-weight="800">0</text>
            </g>
        </g>
        
        <!-- Filter Tabs & Search Bar -->
        <g transform="translate(0, 252)">
            <rect x="0" y="0" width="560" height="42" rx="8" fill="#f1f5f9"/>
            
            <!-- Active Tab: Pending (0) -->
            <rect x="4" y="4" width="102" height="34" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))"/>
            <text x="55" y="25" fill="#0f172a" font-size="12" font-weight="700" text-anchor="middle">Pending (0)</text>
            
            <text x="160" y="25" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Approved (0)</text>
            <text x="280" y="25" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Retry Required (0)</text>
            <text x="400" y="25" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Rejected (0)</text>
            <text x="495" y="25" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">All (0)</text>
            
            <!-- Search Bar -->
            <g transform="translate(740, 0)">
                <rect x="0" y="0" width="380" height="42" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="20" cy="21" r="5" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
                <line x1="24" y1="25" x2="28" y2="29" stroke="#94a3b8" stroke-width="1.5"/>
                <text x="38" y="26" fill="#94a3b8" font-size="12">Search by name, email, or ID...</text>
            </g>
        </g>
        
        <!-- Large Empty State Card -->
        <g transform="translate(0, 314)">
            <rect x="0" y="0" width="1120" height="340" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <g transform="translate(560, 130)">
                <path d="M0 -30 L18 -22 V-10 C18 6 0 16 0 16 C0 16 -18 6 -18 -10 V-22 Z" fill="none" stroke="#cbd5e1" stroke-width="3"/>
                <text x="0" y="54" fill="#0f172a" font-size="16" font-weight="800" text-anchor="middle">No identity verifications found</text>
                <text x="0" y="78" fill="#64748b" font-size="13" text-anchor="middle">There are no identity verification submissions matching the selected filters.</text>
            </g>
        </g>
    </g>
    {get_floating_ai()}
    '''

# ==============================================================================
# SCREEN A2b: PHOTO APPROVALS (/admin/approvals - Photo Approvals Tab)
# ==============================================================================
def get_a2_photos():
    return f'''
    <g transform="translate(288, 32)">
        <text x="0" y="26" fill="#0f172a" font-size="28" font-weight="800">Approvals &amp; Identity Verifications</text>
        <text x="0" y="48" fill="#64748b" font-size="13" font-weight="400">Review valid Philippine IDs, facial biometric comparisons, and profile photos to maintain community trust.</text>
        
        <!-- Segmented Tab Switcher (Photo Active) -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="370" height="46" rx="8" fill="#e2e8f0" opacity="0.6"/>
            
            <g transform="translate(16, 12)">
                <path d="M7 1 L13 3.5 V7 C13 10.5 7 13 7 13 C7 13 1 10.5 1 7 V3.5 Z" fill="none" stroke="#64748b" stroke-width="1.5"/>
                <text x="24" y="16" fill="#64748b" font-size="13" font-weight="600">Identity Verifications</text>
            </g>
            
            <!-- Active Tab: Photo Approvals -->
            <rect x="190" y="4" width="176" height="38" rx="6" fill="#ffffff" stroke="#27692a" stroke-width="1.5"/>
            <g transform="translate(204, 12)">
                <rect x="6" y="6" width="16" height="12" rx="2" fill="none" stroke="#27692a" stroke-width="1.5"/>
                <circle cx="14" cy="12" r="3" fill="none" stroke="#27692a" stroke-width="1.5"/>
                <text x="30" y="17" fill="#27692a" font-size="13" font-weight="700">Photo Approvals</text>
            </g>
        </g>
        
        <!-- 3 Stat Cards Row -->
        <g transform="translate(0, 138)">
            <!-- Pending Review -->
            <g transform="translate(0, 0)">
                <rect x="0" y="0" width="360" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="42" cy="46" r="22" fill="#fffbeb"/>
                <circle cx="42" cy="46" r="10" fill="none" stroke="#d97706" stroke-width="1.5"/>
                <polyline points="42,40 42,46 46,46" stroke="#d97706" stroke-width="1.5" fill="none"/>
                
                <text x="78" y="36" fill="#64748b" font-size="12" font-weight="700">Pending Review</text>
                <text x="78" y="68" fill="#d97706" font-size="26" font-weight="800">0</text>
            </g>
            
            <!-- Approved Photos -->
            <g transform="translate(380, 0)">
                <rect x="0" y="0" width="360" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="42" cy="46" r="22" fill="#f0fdf4"/>
                <circle cx="42" cy="46" r="10" fill="none" stroke="#16a34a" stroke-width="1.5"/>
                <path d="M38 46 L41 49 L47 43" stroke="#16a34a" stroke-width="1.5" fill="none"/>
                
                <text x="78" y="36" fill="#64748b" font-size="12" font-weight="700">Approved Photos</text>
                <text x="78" y="68" fill="#16a34a" font-size="26" font-weight="800">0</text>
            </g>
            
            <!-- Declined Photos -->
            <g transform="translate(760, 0)">
                <rect x="0" y="0" width="360" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="42" cy="46" r="22" fill="#fef2f2"/>
                <circle cx="42" cy="46" r="10" fill="none" stroke="#dc2626" stroke-width="1.5"/>
                <path d="M38 42 L46 50 M46 42 L38 50" stroke="#dc2626" stroke-width="1.5"/>
                
                <text x="78" y="36" fill="#64748b" font-size="12" font-weight="700">Declined Photos</text>
                <text x="78" y="68" fill="#dc2626" font-size="26" font-weight="800">0</text>
            </g>
        </g>
        
        <!-- Filter Tabs & Search Bar -->
        <g transform="translate(0, 252)">
            <rect x="0" y="0" width="450" height="42" rx="8" fill="#f1f5f9"/>
            
            <rect x="4" y="4" width="102" height="34" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))"/>
            <text x="55" y="25" fill="#0f172a" font-size="12" font-weight="700" text-anchor="middle">Pending (0)</text>
            
            <text x="160" y="25" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Approved (0)</text>
            <text x="270" y="25" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Rejected (0)</text>
            <text x="380" y="25" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">All (0)</text>
            
            <g transform="translate(740, 0)">
                <rect x="0" y="0" width="380" height="42" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <circle cx="20" cy="21" r="5" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
                <line x1="24" y1="25" x2="28" y2="29" stroke="#94a3b8" stroke-width="1.5"/>
                <text x="38" y="26" fill="#94a3b8" font-size="12">Search user by name or email...</text>
            </g>
        </g>
        
        <!-- Empty State Card -->
        <g transform="translate(0, 314)">
            <rect x="0" y="0" width="1120" height="340" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <g transform="translate(560, 130)">
                <rect x="-24" y="-20" width="48" height="36" rx="6" fill="none" stroke="#cbd5e1" stroke-width="3"/>
                <circle cx="0" cy="-2" r="8" fill="none" stroke="#cbd5e1" stroke-width="3"/>
                <text x="0" y="54" fill="#0f172a" font-size="16" font-weight="800" text-anchor="middle">No photo submissions found</text>
                <text x="0" y="78" fill="#64748b" font-size="13" text-anchor="middle">There are no profile picture submissions matching your selected filter.</text>
            </g>
        </g>
    </g>
    {get_floating_ai()}
    '''

# ==============================================================================
# SCREEN A3: MANAGE USERS DIRECTORY (/admin/users)
# ==============================================================================
def get_a3_users():
    return f'''
    <g transform="translate(288, 32)">
        <text x="0" y="26" fill="#0f172a" font-size="28" font-weight="800">Manage Registered Users</text>
        <text x="0" y="48" fill="#64748b" font-size="13" font-weight="400">View and moderate all registered accounts in MySQL across all verification and moderation states</text>
        
        <!-- Refresh Button -->
        <g transform="translate(994, 10)">
            <rect x="0" y="0" width="126" height="36" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
            <text x="63" y="22" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">↻ Refresh Users</text>
        </g>
        
        <!-- Filter Tabs & Search -->
        <g transform="translate(0, 72)">
            <!-- All Users (2) Active Pill -->
            <rect x="0" y="0" width="112" height="34" rx="17" fill="#0f172a"/>
            <text x="56" y="21" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">All Users (2)</text>
            
            <!-- Pending (0) -->
            <rect x="122" y="0" width="102" height="34" rx="17" fill="#fef3c7"/>
            <text x="173" y="21" fill="#92400e" font-size="12" font-weight="600" text-anchor="middle">Pending (0)</text>
            
            <!-- Approved (2) -->
            <rect x="234" y="0" width="112" height="34" rx="17" fill="#dcfce7"/>
            <text x="290" y="21" fill="#166534" font-size="12" font-weight="600" text-anchor="middle">Approved (2)</text>
            
            <!-- Suspended (0) -->
            <rect x="356" y="0" width="116" height="34" rx="17" fill="#fee2e2"/>
            <text x="414" y="21" fill="#991b1b" font-size="12" font-weight="600" text-anchor="middle">Suspended (0)</text>
            
            <!-- Rejected (0) -->
            <rect x="482" y="0" width="106" height="34" rx="17" fill="#f1f5f9"/>
            <text x="535" y="21" fill="#475569" font-size="12" font-weight="600" text-anchor="middle">Rejected (0)</text>
        </g>
        
        <!-- Search Input -->
        <g transform="translate(0, 122)">
            <rect x="0" y="0" width="1120" height="42" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <circle cx="20" cy="21" r="5" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
            <line x1="24" y1="25" x2="28" y2="29" stroke="#94a3b8" stroke-width="1.5"/>
            <text x="38" y="26" fill="#94a3b8" font-size="12">Search users by name, email, municipality, or role...</text>
        </g>
        
        <!-- Table Card -->
        <g transform="translate(0, 180)">
            <rect x="0" y="0" width="1120" height="230" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Table Header -->
            <rect x="0" y="0" width="1120" height="42" rx="10" fill="#f8fafc"/>
            <text x="24" y="26" fill="#64748b" font-size="11" font-weight="700">USER</text>
            <text x="260" y="26" fill="#64748b" font-size="11" font-weight="700">LOCATION</text>
            <text x="490" y="26" fill="#64748b" font-size="11" font-weight="700">ROLE</text>
            <text x="590" y="26" fill="#64748b" font-size="11" font-weight="700">ACCOUNT STATUS</text>
            <text x="750" y="26" fill="#64748b" font-size="11" font-weight="700">MODERATION / DETAILS</text>
            <text x="1000" y="26" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            <line x1="0" y1="42" x2="1120" y2="42" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Row 1: Jehosue Biscarra -->
            <g transform="translate(0, 42)">
                <circle cx="44" cy="46" r="18" fill="#06b6d4"/>
                <text x="44" y="51" fill="#ffffff" font-size="12" font-weight="800" text-anchor="middle">JB</text>
                
                <text x="74" y="38" fill="#0f172a" font-size="13" font-weight="700">Jehosue Biscarra</text>
                <circle cx="188" cy="34" r="5" fill="#16a34a"/>
                <path d="M186 34 L187.5 35.5 L190.5 32.5" fill="none" stroke="#fff" stroke-width="1"/>
                <text x="74" y="54" fill="#64748b" font-size="11">jehosuebiscarra@gmail.com</text>
                <text x="74" y="68" fill="#94a3b8" font-size="11">+639923314755</text>
                
                <!-- Location -->
                <text x="260" y="42" fill="#334155" font-size="12" font-weight="500">Poblacion, San Fernando</text>
                <text x="260" y="58" fill="#64748b" font-size="11">La Union</text>
                
                <!-- Role -->
                <rect x="490" y="34" width="46" height="22" rx="4" fill="#f1f5f9"/>
                <text x="513" y="49" fill="#475569" font-size="10" font-weight="700" text-anchor="middle">USER</text>
                
                <!-- Account Status -->
                <rect x="590" y="34" width="86" height="22" rx="11" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
                <text x="633" y="49" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">APPROVED</text>
                
                <!-- Details -->
                <text x="750" y="48" fill="#64748b" font-size="12">Good standing</text>
                
                <!-- Action Button -->
                <rect x="956" y="30" width="120" height="32" rx="6" fill="#dc2626"/>
                <circle cx="978" cy="46" r="6" fill="none" stroke="#ffffff" stroke-width="1.2"/>
                <line x1="974" y1="42" x2="982" y2="50" stroke="#ffffff" stroke-width="1.2"/>
                <text x="1022" y="51" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">Suspend</text>
            </g>
            
            <line x1="0" y1="134" x2="1120" y2="134" stroke="#f1f5f9" stroke-width="1"/>
            
            <!-- Row 2: Admin User -->
            <g transform="translate(0, 134)">
                <circle cx="44" cy="46" r="18" fill="#ea580c"/>
                <text x="44" y="51" fill="#ffffff" font-size="12" font-weight="800" text-anchor="middle">AU</text>
                
                <text x="74" y="38" fill="#0f172a" font-size="13" font-weight="700">Admin User</text>
                <circle cx="152" cy="34" r="5" fill="#16a34a"/>
                <path d="M150 34 L151.5 35.5 L154.5 32.5" fill="none" stroke="#fff" stroke-width="1"/>
                <text x="74" y="54" fill="#64748b" font-size="11">admin@bayanihanhub.com</text>
                <text x="74" y="68" fill="#94a3b8" font-size="11">09170000000</text>
                
                <!-- Location -->
                <text x="260" y="42" fill="#334155" font-size="12" font-weight="500">Poblacion, San Fernando</text>
                <text x="260" y="58" fill="#64748b" font-size="11">La Union</text>
                
                <!-- Role -->
                <rect x="490" y="34" width="50" height="22" rx="4" fill="#e0e7ff"/>
                <text x="515" y="49" fill="#4338ca" font-size="10" font-weight="700" text-anchor="middle">ADMIN</text>
                
                <!-- Account Status -->
                <rect x="590" y="34" width="86" height="22" rx="11" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
                <text x="633" y="49" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">APPROVED</text>
                
                <!-- Details -->
                <text x="750" y="48" fill="#64748b" font-size="12">Good standing</text>
                
                <!-- Action Button -->
                <rect x="956" y="30" width="120" height="32" rx="6" fill="#dc2626"/>
                <circle cx="978" cy="46" r="6" fill="none" stroke="#ffffff" stroke-width="1.2"/>
                <line x1="974" y1="42" x2="982" y2="50" stroke="#ffffff" stroke-width="1.2"/>
                <text x="1022" y="51" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">Suspend</text>
            </g>
        </g>
    </g>
    {get_floating_ai()}
    '''

# ==============================================================================
# SCREEN A4: MANAGE POSTS & ITEM LISTINGS (/admin/posts)
# ==============================================================================
def get_a4_posts():
    items = [
        ("Elementary School Supplies Pack", "School & Office Supplies • ID: Item-24", "Donation", "Brand New", "#ecfdf5", "#047857"),
        ("College Algebra & General Science Used Textbooks", "Books & Learning Material • ID: Item-25", "Donation", "Good Condition", "#ecfdf5", "#047857"),
        ("Men's Clean Office & Casual Polo Shirts", "Clothing & Apparel • ID: Item-26", "Donation", "Like New", "#ecfdf5", "#047857"),
        ("Stainless Steel Cooking Utensils & Frying Pan Set", "Home Appliances • ID: Item-27", "Donation", "Good Condition", "#ecfdf5", "#047857"),
        ("Durable Water-Resistant School Backpack", "School & Office Supplies • ID: Item-28", "Exchange", "Good Condition", "#f0fdfa", "#0d9488"),
        ("Toddler & Children's Clothing (Ages 3-5)", "Clothing & Apparel • ID: Item-29", "Exchange", "Good Condition", "#f0fdfa", "#0d9488"),
        ("Pantry Relief Essentials & Rice Sack", "Food & Pantry Essentials • ID: Item-30", "Exchange", "Brand New", "#f0fdfa", "#0d9488"),
        ("Senior High Engineering Math Reviewer for Grade 10 Science Books", "Books & Learning Material • ID: Item-31", "Exchange", "Like New", "#f0fdfa", "#0d9488"),
    ]
    
    rows_svg = ""
    y = 42
    for title, subtitle, p_type, condition, type_bg, type_color in items:
        rows_svg += f'''
        <g transform="translate(0, {y})">
            <!-- Box icon -->
            <rect x="20" y="16" width="34" height="34" rx="6" fill="#f1f5f9"/>
            <path d="M37 25 L45 29 V37 L37 41 L29 37 V29 Z" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
            
            <!-- Details -->
            <text x="64" y="30" fill="#0f172a" font-size="13" font-weight="700">{esc(title)}</text>
            <text x="64" y="46" fill="#64748b" font-size="11">{esc(subtitle)}</text>
            
            <!-- Owner -->
            <text x="440" y="32" fill="#334155" font-size="12" font-weight="500">Community Member</text>
            <text x="440" y="46" fill="#94a3b8" font-size="11">N/A</text>
            
            <!-- Type -->
            <rect x="570" y="24" width="76" height="22" rx="11" fill="{type_bg}" stroke="{type_color}" stroke-width="1"/>
            <text x="608" y="39" fill="{type_color}" font-size="10" font-weight="700" text-anchor="middle">{esc(p_type)}</text>
            
            <!-- Condition -->
            <text x="690" y="38" fill="#334155" font-size="12">{esc(condition)}</text>
            
            <!-- Status -->
            <rect x="790" y="24" width="86" height="22" rx="11" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
            <text x="833" y="39" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">AVAILABLE</text>
            
            <!-- Actions -->
            <rect x="946" y="20" width="130" height="32" rx="6" fill="#dc2626"/>
            <path d="M966 31 H976 M969 31 V28 H973 V31 M967 33 L968 41 H974 L975 33" fill="none" stroke="#ffffff" stroke-width="1.2"/>
            <text x="1018" y="41" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">Remove Post</text>
        </g>
        <line x1="0" y1="{y+66}" x2="1120" y2="{y+66}" stroke="#f1f5f9" stroke-width="1"/>
        '''
        y += 66

    return f'''
    <g transform="translate(288, 32)">
        <text x="0" y="26" fill="#0f172a" font-size="28" font-weight="800">Manage Posts &amp; Item Listings</text>
        <text x="0" y="48" fill="#64748b" font-size="13" font-weight="400">Review, moderate, and manage community item listings with notification dispatches</text>
        
        <!-- Refresh Button -->
        <g transform="translate(994, 10)">
            <rect x="0" y="0" width="126" height="36" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
            <text x="63" y="22" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">↻ Refresh Posts</text>
        </g>
        
        <!-- Filter Pills -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="124" height="34" rx="17" fill="#0f172a"/>
            <text x="62" y="21" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">All Listings (10)</text>
            
            <rect x="134" y="0" width="168" height="34" rx="17" fill="#dcfce7"/>
            <text x="218" y="21" fill="#166534" font-size="12" font-weight="600" text-anchor="middle">Active &amp; Available (10)</text>
            
            <rect x="312" y="0" width="112" height="34" rx="17" fill="#fee2e2"/>
            <text x="368" y="21" fill="#991b1b" font-size="12" font-weight="600" text-anchor="middle">Removed (0)</text>
        </g>
        
        <!-- Search Bar -->
        <g transform="translate(0, 122)">
            <rect x="0" y="0" width="1120" height="42" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <circle cx="20" cy="21" r="5" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
            <line x1="24" y1="25" x2="28" y2="29" stroke="#94a3b8" stroke-width="1.5"/>
            <text x="38" y="26" fill="#94a3b8" font-size="12">Search posts by title, category, or owner name...</text>
        </g>
        
        <!-- Table Card -->
        <g transform="translate(0, 180)">
            <rect x="0" y="0" width="1120" height="600" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Table Header -->
            <rect x="0" y="0" width="1120" height="42" rx="10" fill="#f8fafc"/>
            <text x="24" y="26" fill="#64748b" font-size="11" font-weight="700">ITEM DETAILS</text>
            <text x="440" y="26" fill="#64748b" font-size="11" font-weight="700">OWNER</text>
            <text x="570" y="26" fill="#64748b" font-size="11" font-weight="700">TYPE</text>
            <text x="690" y="26" fill="#64748b" font-size="11" font-weight="700">CONDITION</text>
            <text x="790" y="26" fill="#64748b" font-size="11" font-weight="700">STATUS</text>
            <text x="980" y="26" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            <line x1="0" y1="42" x2="1120" y2="42" stroke="#e2e8f0" stroke-width="1"/>
            
            {rows_svg}
        </g>
    </g>
    {get_floating_ai()}
    '''

# ==============================================================================
# SCREEN A5: MANAGE COMMUNITY REQUESTS (/admin/requests)
# ==============================================================================
def get_a5_requests():
    requests = [
        ("Durable Water-Resistant School Backpack", "General • ID: req-12", "HIGH", "#fef3c7", "#d97706", "2026-09-25"),
        ("Toddler & Children's Clothing (Ages 3-5)", "General • ID: req-13", "MEDIUM", "#f1f5f9", "#475569", "2026-10-02"),
        ("Pantry Relief Essentials & Rice Sack", "General • ID: req-14", "CRITICAL", "#fee2e2", "#dc2626", "2026-09-18")
    ]
    
    rows_svg = ""
    y = 42
    for title, subtitle, urgency, urg_bg, urg_color, date_str in requests:
        rows_svg += f'''
        <g transform="translate(0, {y})">
            <!-- Request Title & ID -->
            <text x="24" y="30" fill="#0f172a" font-size="13" font-weight="700">{esc(title)}</text>
            <text x="24" y="46" fill="#64748b" font-size="11">{esc(subtitle)}</text>
            
            <!-- Requester -->
            <text x="360" y="30" fill="#334155" font-size="12" font-weight="500">Community Member</text>
            <text x="360" y="46" fill="#94a3b8" font-size="11">N/A</text>
            
            <!-- Urgency Pill -->
            <rect x="520" y="24" width="76" height="22" rx="11" fill="{urg_bg}" stroke="{urg_color}" stroke-width="1"/>
            <text x="558" y="39" fill="{urg_color}" font-size="10" font-weight="700" text-anchor="middle">{esc(urgency)}</text>
            
            <!-- Needed Before -->
            <text x="650" y="38" fill="#334155" font-size="12">{esc(date_str)}</text>
            
            <!-- Status -->
            <rect x="760" y="24" width="76" height="22" rx="11" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
            <text x="798" y="39" fill="#166534" font-size="10" font-weight="700" text-anchor="middle">ACTIVE</text>
            
            <!-- Action Button -->
            <rect x="946" y="20" width="136" height="32" rx="6" fill="#dc2626"/>
            <path d="M966 31 H976 M969 31 V28 H973 V31 M967 33 L968 41 H974 L975 33" fill="none" stroke="#ffffff" stroke-width="1.2"/>
            <text x="1022" y="41" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">Remove Request</text>
        </g>
        <line x1="0" y1="{y+66}" x2="1120" y2="{y+66}" stroke="#f1f5f9" stroke-width="1"/>
        '''
        y += 66

    return f'''
    <g transform="translate(288, 32)">
        <text x="0" y="26" fill="#0f172a" font-size="28" font-weight="800">Manage Community Requests</text>
        <text x="0" y="48" fill="#64748b" font-size="13" font-weight="400">Review urgent neighbor requests, remove invalid listings, and dispatch notices</text>
        
        <!-- Refresh Button -->
        <g transform="translate(976, 10)">
            <rect x="0" y="0" width="144" height="36" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
            <text x="72" y="22" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">↻ Refresh Requests</text>
        </g>
        
        <!-- Filter Pills -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="130" height="34" rx="17" fill="#0f172a"/>
            <text x="65" y="21" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">All Requests (3)</text>
            
            <rect x="140" y="0" width="144" height="34" rx="17" fill="#dcfce7"/>
            <text x="212" y="21" fill="#166534" font-size="12" font-weight="600" text-anchor="middle">Active &amp; Open (3)</text>
            
            <rect x="294" y="0" width="180" height="34" rx="17" fill="#fee2e2"/>
            <text x="384" y="21" fill="#991b1b" font-size="12" font-weight="600" text-anchor="middle">Removed / Cancelled (0)</text>
        </g>
        
        <!-- Search Bar -->
        <g transform="translate(0, 122)">
            <rect x="0" y="0" width="1120" height="42" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <circle cx="20" cy="21" r="5" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
            <line x1="24" y1="25" x2="28" y2="29" stroke="#94a3b8" stroke-width="1.5"/>
            <text x="38" y="26" fill="#94a3b8" font-size="12">Search requests by title, category, or requester...</text>
        </g>
        
        <!-- Table Card -->
        <g transform="translate(0, 180)">
            <rect x="0" y="0" width="1120" height="260" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Table Header -->
            <rect x="0" y="0" width="1120" height="42" rx="10" fill="#f8fafc"/>
            <text x="24" y="26" fill="#64748b" font-size="11" font-weight="700">REQUEST TITLE</text>
            <text x="360" y="26" fill="#64748b" font-size="11" font-weight="700">REQUESTER</text>
            <text x="520" y="26" fill="#64748b" font-size="11" font-weight="700">URGENCY</text>
            <text x="650" y="26" fill="#64748b" font-size="11" font-weight="700">NEEDED BEFORE</text>
            <text x="760" y="26" fill="#64748b" font-size="11" font-weight="700">STATUS</text>
            <text x="980" y="26" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            <line x1="0" y1="42" x2="1120" y2="42" stroke="#e2e8f0" stroke-width="1"/>
            
            {rows_svg}
        </g>
    </g>
    {get_floating_ai()}
    '''

# ==============================================================================
# SCREEN A6: COMMUNITY MODERATION & REPORTS (/admin/reports)
# ==============================================================================
def get_a6_reports():
    return f'''
    <g transform="translate(288, 32)">
        <text x="0" y="26" fill="#0f172a" font-size="28" font-weight="800">Community Moderation &amp; Reports Center</text>
        <text x="0" y="48" fill="#64748b" font-size="13" font-weight="400">Review flagged items, investigate user behavior, and apply impartial disciplinary actions.</text>
        
        <!-- Refresh Button -->
        <g transform="translate(1004, 10)">
            <rect x="0" y="0" width="116" height="36" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
            <text x="58" y="22" fill="#334155" font-size="12" font-weight="600" text-anchor="middle">↻ Refresh Data</text>
        </g>
        
        <!-- 5 KPI Summary Cards -->
        <g transform="translate(0, 72)">
            <!-- Total Reports -->
            <g transform="translate(0, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="106" y="30" fill="#64748b" font-size="11" font-weight="700" text-anchor="middle">TOTAL REPORTS</text>
                <text x="106" y="68" fill="#0f172a" font-size="26" font-weight="800" text-anchor="middle">0</text>
            </g>
            <!-- Pending -->
            <g transform="translate(226, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#fefce8" stroke="#fef08a" stroke-width="1"/>
                <text x="106" y="30" fill="#92400e" font-size="11" font-weight="700" text-anchor="middle">PENDING</text>
                <text x="106" y="68" fill="#d97706" font-size="26" font-weight="800" text-anchor="middle">0</text>
            </g>
            <!-- Under Review -->
            <g transform="translate(452, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
                <text x="106" y="30" fill="#1e40af" font-size="11" font-weight="700" text-anchor="middle">UNDER REVIEW</text>
                <text x="106" y="68" fill="#3b82f6" font-size="26" font-weight="800" text-anchor="middle">0</text>
            </g>
            <!-- Resolved -->
            <g transform="translate(678, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
                <text x="106" y="30" fill="#166534" font-size="11" font-weight="700" text-anchor="middle">RESOLVED</text>
                <text x="106" y="68" fill="#16a34a" font-size="26" font-weight="800" text-anchor="middle">0</text>
            </g>
            <!-- High Priority -->
            <g transform="translate(904, 0)">
                <rect x="0" y="0" width="212" height="92" rx="10" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
                <text x="106" y="30" fill="#991b1b" font-size="11" font-weight="700" text-anchor="middle">HIGH PRIORITY</text>
                <text x="106" y="68" fill="#ef4444" font-size="26" font-weight="800" text-anchor="middle">0</text>
            </g>
        </g>
        
        <!-- Filter Tabs -->
        <g transform="translate(0, 180)">
            <rect x="0" y="0" width="112" height="34" rx="17" fill="#0f172a"/>
            <text x="56" y="21" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">All Reports (0)</text>
            
            <text x="170" y="21" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Pending (0)</text>
            <text x="280" y="21" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Under Review (0)</text>
            <text x="390" y="21" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Resolved (0)</text>
            <text x="495" y="21" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">Dismissed (0)</text>
        </g>
        
        <!-- Search & 3 Dropdowns Bar -->
        <g transform="translate(0, 230)">
            <!-- Search Input -->
            <rect x="0" y="0" width="290" height="40" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <circle cx="20" cy="20" r="5" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
            <text x="36" y="25" fill="#94a3b8" font-size="12">Search reports by ID, reason, re...</text>
            
            <!-- Target Types Dropdown -->
            <g transform="translate(306, 0)">
                <rect x="0" y="0" width="256" height="40" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="16" y="25" fill="#334155" font-size="12">All Target Types</text>
                <path d="M236 18 L240 22 L244 18" fill="none" stroke="#64748b" stroke-width="1.5"/>
            </g>
            
            <!-- Severities Dropdown -->
            <g transform="translate(578, 0)">
                <rect x="0" y="0" width="256" height="40" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="16" y="25" fill="#334155" font-size="12">All Severities</text>
                <path d="M236 18 L240 22 L244 18" fill="none" stroke="#64748b" stroke-width="1.5"/>
            </g>
            
            <!-- Sort Dropdown -->
            <g transform="translate(850, 0)">
                <rect x="0" y="0" width="270" height="40" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
                <text x="16" y="25" fill="#334155" font-size="12">Newest First</text>
                <path d="M250 18 L254 22 L258 18" fill="none" stroke="#64748b" stroke-width="1.5"/>
            </g>
        </g>
        
        <!-- Table Card with Empty State -->
        <g transform="translate(0, 286)">
            <rect x="0" y="0" width="1120" height="300" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Table Header -->
            <rect x="0" y="0" width="1120" height="42" rx="10" fill="#f8fafc"/>
            <text x="24" y="26" fill="#64748b" font-size="11" font-weight="700">TARGET ENTITY</text>
            <text x="180" y="26" fill="#64748b" font-size="11" font-weight="700">REPORT REASON &amp; SEVERITY</text>
            <text x="440" y="26" fill="#64748b" font-size="11" font-weight="700">REPORTED PARTY</text>
            <text x="640" y="26" fill="#64748b" font-size="11" font-weight="700">CONFIDENTIAL REPORTER</text>
            <text x="840" y="26" fill="#64748b" font-size="11" font-weight="700">STATUS</text>
            <text x="940" y="26" fill="#64748b" font-size="11" font-weight="700">DATE</text>
            <text x="1030" y="26" fill="#64748b" font-size="11" font-weight="700">ACTIONS</text>
            <line x1="0" y1="42" x2="1120" y2="42" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Empty State Center -->
            <g transform="translate(560, 160)">
                <path d="M0 -24 L14 -18 V-8 C14 5 0 13 0 13 C0 13 -14 5 -14 -8 V-18 Z" fill="none" stroke="#cbd5e1" stroke-width="2.5"/>
                <path d="M-4 -7 L-1 -4 L5 -10" fill="none" stroke="#cbd5e1" stroke-width="2"/>
                <text x="0" y="40" fill="#0f172a" font-size="15" font-weight="800" text-anchor="middle">No moderation reports found</text>
                <text x="0" y="62" fill="#64748b" font-size="13" text-anchor="middle">All community flagged content is resolved.</text>
            </g>
        </g>
    </g>
    {get_floating_ai()}
    '''

# ==============================================================================
# SCREEN A7: MANAGE ITEM CATEGORIES (/admin/categories)
# ==============================================================================
def get_a7_categories():
    categories = [
        ("Clothing", "clothing", "12 items"),
        ("Electronics", "electronics", "12 items"),
        ("Books", "books", "12 items"),
        ("Furniture", "furniture", "12 items"),
        ("School Supplies", "school-supplies", "12 items"),
        ("Food", "food", "12 items"),
        ("Toys & Games", "toys", "12 items"),
        ("Appliances", "appliances", "12 items"),
        ("Sports", "sports", "12 items"),
        ("Baby & Kids", "baby-kids", "12 items"),
        ("Health & Medical", "health", "12 items"),
        ("Others", "others", "12 items")
    ]
    
    rows_svg = ""
    y = 42
    for name, slug, count in categories[:9]: # first 9 to fit standard frame
        rows_svg += f'''
        <g transform="translate(0, {y})">
            <text x="24" y="32" fill="#0f172a" font-size="13" font-weight="700">{esc(name)}</text>
            <text x="360" y="32" fill="#64748b" font-size="12" font-family="monospace">{esc(slug)}</text>
            <text x="620" y="32" fill="#334155" font-size="12">{esc(count)}</text>
        </g>
        <line x1="0" y1="{y+50}" x2="800" y2="{y+50}" stroke="#f1f5f9" stroke-width="1"/>
        '''
        y += 50

    return f'''
    <g transform="translate(288, 32)">
        <text x="0" y="26" fill="#0f172a" font-size="28" font-weight="800">Manage Item Categories</text>
        <text x="0" y="48" fill="#64748b" font-size="13" font-weight="400">Create and update item classification categories</text>
        
        <!-- Add Category Card -->
        <g transform="translate(0, 72)">
            <rect x="0" y="0" width="800" height="96" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            <text x="24" y="30" fill="#0f172a" font-size="12" font-weight="700">New Category Name <tspan fill="#dc2626">*</tspan></text>
            
            <!-- Input -->
            <rect x="24" y="42" width="600" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
            <text x="38" y="66" fill="#94a3b8" font-size="13">e.g. Sports &amp; Fitness</text>
            
            <!-- Add Button -->
            <rect x="638" y="42" width="138" height="38" rx="6" fill="#1e4620"/>
            <text x="707" y="66" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">Add Category</text>
        </g>
        
        <!-- Table Card -->
        <g transform="translate(0, 188)">
            <rect x="0" y="0" width="800" height="520" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
            
            <!-- Header -->
            <rect x="0" y="0" width="800" height="42" rx="10" fill="#f8fafc"/>
            <text x="24" y="26" fill="#64748b" font-size="11" font-weight="700">CATEGORY NAME</text>
            <text x="360" y="26" fill="#64748b" font-size="11" font-weight="700">SLUG ID</text>
            <text x="620" y="26" fill="#64748b" font-size="11" font-weight="700">ACTIVE ITEMS</text>
            <line x1="0" y1="42" x2="800" y2="42" stroke="#e2e8f0" stroke-width="1"/>
            
            {rows_svg}
        </g>
    </g>
    {get_floating_ai()}
    '''

# ==============================================================================
# GENERATE ALL ARTBOARDS (1440x960 each)
# ==============================================================================
defs_svg = '''
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&amp;display=swap');
            text { font-family: 'Poppins', sans-serif; }
        </style>
        <linearGradient id="modalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#7c3aed"/>
            <stop offset="50%" stop-color="#6366f1"/>
            <stop offset="100%" stop-color="#10b981"/>
        </linearGradient>
        <linearGradient id="btnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#8b5cf6"/>
            <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
    </defs>
'''

screens = [
    ("A1_Admin_Dashboard_Live.svg", 0, get_a1_dashboard(), "A1_Admin_Dashboard"),
    ("A1b_Beta_Notice_Modal_Live.svg", 0, get_a1_dashboard() + get_a1_beta_modal(), "A1b_Beta_Notice_Modal"),
    ("A2_Identity_Approvals_Live.svg", 1, get_a2_identity(), "A2_Identity_Approvals"),
    ("A2b_Photo_Approvals_Live.svg", 1, get_a2_photos(), "A2b_Photo_Approvals"),
    ("A3_Manage_Users_Live.svg", 2, get_a3_users(), "A3_Manage_Users"),
    ("A4_Manage_Posts_Live.svg", 3, get_a4_posts(), "A4_Manage_Posts"),
    ("A5_Manage_Requests_Live.svg", 4, get_a5_requests(), "A5_Manage_Requests"),
    ("A6_Manage_Reports_Live.svg", 5, get_a6_reports(), "A6_Manage_Reports"),
    ("A7_Manage_Categories_Live.svg", 6, get_a7_categories(), "A7_Manage_Categories"),
]

for filename, active_idx, content_svg, _ in screens:
    svg_code = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960">
    {defs_svg}
    <rect width="1440" height="960" fill="#f1f5f3" />
    {get_exact_sidebar(active_idx)}
    {content_svg}
</svg>'''
    with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as f:
        f.write(svg_code)
    print(f"Generated artboard: {filename}")

# ==============================================================================
# GENERATE COMBINED CANVAS (3x3 Grid of all 9 screens)
# ==============================================================================
grid_coords = [
    (0, 0),        # 1. A1 Dashboard
    (1520, 0),     # 2. A1b Beta Modal
    (3040, 0),     # 3. A2 Identity
    (0, 1040),     # 4. A2b Photos
    (1520, 1040),  # 5. A3 Users
    (3040, 1040),  # 6. A4 Posts
    (0, 2080),     # 7. A5 Requests
    (1520, 2080),  # 8. A6 Reports
    (3040, 2080),  # 9. A7 Categories
]

combined_groups = []
for idx, (filename, active_idx, content_svg, group_id) in enumerate(screens):
    x, y = grid_coords[idx]
    title = group_id.replace("_", " ")
    combined_groups.append(f'''
    <!-- {group_id} -->
    <g id="{group_id}" transform="translate({x}, {y})">
        <text x="0" y="-18" fill="#0f172a" font-size="20" font-weight="800">{title}</text>
        <rect width="1440" height="960" fill="#f1f5f3" rx="12"/>
        {get_exact_sidebar(active_idx)}
        {content_svg}
    </g>
    ''')

combined_canvas_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 4640 3160" width="4640" height="3160">
    {defs_svg}
    <rect x="-40" y="-40" width="4640" height="3160" fill="#e2e8f0" opacity="0.3"/>
    {''.join(combined_groups)}
</svg>'''

combined_canvas_path = os.path.join(output_dir, "ALL_9_ADMIN_PANELS_LIVE_CANVAS.svg")
with open(combined_canvas_path, "w", encoding="utf-8") as f:
    f.write(combined_canvas_svg)

print(f"ALL_9_ADMIN_PANELS_LIVE_CANVAS.svg created successfully! Size: {len(combined_canvas_svg)} bytes")
