import os
import re

dir_path = r"c:\Users\Jeho\Downloads\BayanihanHubAfter\figma-admin-wireframes"

files_layout = [
    ("A1_Admin_Dashboard_Overview.svg", 0, 0, "A1_Admin_Dashboard_Overview"),
    ("A2_Identity_Approvals_Queue.svg", 1520, 0, "A2_Identity_Approvals_Queue"),
    ("A3_Manage_Users_Directory.svg", 3040, 0, "A3_Manage_Users_Directory"),
    ("A4_Post_Listing_Moderation.svg", 0, 1040, "A4_Post_Listing_Moderation"),
    ("A5_Community_Requests_Moderation.svg", 1520, 1040, "A5_Community_Requests_Moderation"),
    ("A6_Reports_And_Audit_Logs.svg", 3040, 1040, "A6_Reports_And_Audit_Logs"),
]

groups = []

for filename, x, y, group_id in files_layout:
    filepath = os.path.join(dir_path, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Strip <svg ...> and </svg>
    inner = re.sub(r'<\?xml.*?\?>', '', content)
    inner = re.sub(r'<svg[^>]*>', '', inner)
    inner = inner.replace('</svg>', '').strip()
    
    groups.append(f'''
    <!-- ========================================== -->
    <!-- {group_id} -->
    <!-- ========================================== -->
    <g id="{group_id}" transform="translate({x}, {y})">
        {inner}
    </g>
    ''')

combined_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4560 2080" width="4560" height="2080">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap');
            text {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }}
        </style>
    </defs>
    {''.join(groups)}
</svg>'''

output_file = os.path.join(dir_path, "ALL_6_ADMIN_SCREENS_COMBINED.svg")
with open(output_file, "w", encoding="utf-8") as f:
    f.write(combined_svg)

print("Generated combined SVG successfully! Size:", len(combined_svg))
