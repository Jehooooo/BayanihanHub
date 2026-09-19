// =========================================================================
// BayanihanHub Figma Plugin: Exact Codebase Admin Panel Generator
// Matches src/features/admin/pages and src/components/layout/AdminLayout.tsx
// =========================================================================

async function main() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255,
    };
  }

  function solidFill(hex, opacity = 1) {
    return [{ type: 'SOLID', color: hexToRgb(hex), opacity }];
  }

  function createText(text, size = 14, style = "Regular", hex = "#0F172A") {
    const node = figma.createText();
    node.fontName = { family: "Inter", style };
    node.characters = text;
    node.fontSize = size;
    node.fills = solidFill(hex);
    return node;
  }

  function createBadge(text, bgHex, textHex) {
    const badge = figma.createFrame();
    badge.name = `Badge: ${text}`;
    badge.layoutMode = "HORIZONTAL";
    badge.paddingLeft = 8;
    badge.paddingRight = 8;
    badge.paddingTop = 4;
    badge.paddingBottom = 4;
    badge.cornerRadius = 12;
    badge.fills = solidFill(bgHex);
    badge.primaryAxisSizingMode = "AUTO";
    badge.counterAxisSizingMode = "AUTO";
    badge.appendChild(createText(text, 10, "Bold", textHex));
    return badge;
  }

  function createButton(text, bgHex, textHex, strokeHex = null) {
    const btn = figma.createFrame();
    btn.name = `Button: ${text}`;
    btn.layoutMode = "HORIZONTAL";
    btn.paddingLeft = 14;
    btn.paddingRight = 14;
    btn.paddingTop = 8;
    btn.paddingBottom = 8;
    btn.cornerRadius = 6;
    btn.fills = solidFill(bgHex);
    if (strokeHex) {
      btn.strokes = solidFill(strokeHex);
      btn.strokeWeight = 1;
    }
    btn.primaryAxisSizingMode = "AUTO";
    btn.counterAxisSizingMode = "AUTO";
    btn.primaryAxisAlignItems = "CENTER";
    btn.counterAxisAlignItems = "CENTER";
    btn.appendChild(createText(text, 12, "Bold", textHex));
    return btn;
  }

  function createExactSidebar(activeIdx = 0) {
    const sidebar = figma.createFrame();
    sidebar.name = "Exact Desktop Sidebar";
    sidebar.resize(256, 960);
    sidebar.layoutMode = "VERTICAL";
    sidebar.paddingLeft = 16;
    sidebar.paddingRight = 16;
    sidebar.paddingTop = 20;
    sidebar.paddingBottom = 20;
    sidebar.itemSpacing = 6;
    sidebar.fills = solidFill("#0F172A");

    // Brand Header
    const brand = figma.createFrame();
    brand.name = "Brand Header";
    brand.layoutMode = "VERTICAL";
    brand.itemSpacing = 2;
    brand.fills = [];
    brand.appendChild(createText("Bayanihan Hub", 15, "Bold", "#FFFFFF"));
    brand.appendChild(createText("ADMIN PANEL", 10, "Bold", "#66BB6A"));
    sidebar.appendChild(brand);

    const divider = figma.createLine();
    divider.resize(224, 0);
    divider.strokes = solidFill("#1E293B");
    sidebar.appendChild(divider);

    const navItems = [
      { label: "Dashboard", badge: null },
      { label: "Identity & Approvals", badge: "14" },
      { label: "Users", badge: null },
      { label: "Posts", badge: null },
      { label: "Requests", badge: null },
      { label: "Reports", badge: "3" },
      { label: "Categories", badge: null },
      { label: "Ratings", badge: null },
      { label: "Settings", badge: null },
    ];

    navItems.forEach((it, idx) => {
      const navItem = figma.createFrame();
      navItem.name = `Nav: ${it.label}`;
      navItem.layoutMode = "HORIZONTAL";
      navItem.resize(224, 38);
      navItem.paddingLeft = 12;
      navItem.paddingRight = 12;
      navItem.cornerRadius = 8;
      navItem.primaryAxisAlignItems = "SPACE_BETWEEN";
      navItem.counterAxisAlignItems = "CENTER";

      const isActive = idx === activeIdx;
      navItem.fills = isActive ? solidFill("#27692A") : [];

      const label = createText(it.label, 12, isActive ? "Bold" : "Medium", isActive ? "#FFFFFF" : "#94A3B8");
      navItem.appendChild(label);

      if (it.badge) {
        navItem.appendChild(createBadge(it.badge, idx === 1 ? "#D97706" : "#EF4444", "#FFFFFF"));
      }
      sidebar.appendChild(navItem);
    });

    const footerBox = figma.createFrame();
    footerBox.name = "Sidebar Footer";
    footerBox.layoutMode = "VERTICAL";
    footerBox.paddingTop = 180;
    footerBox.itemSpacing = 10;
    footerBox.fills = [];
    footerBox.appendChild(createText("← Back to Main App", 11, "Medium", "#94A3B8"));
    footerBox.appendChild(createText("⎋ Logout (Admin)", 11, "Bold", "#F87171"));
    sidebar.appendChild(footerBox);

    return sidebar;
  }

  const generatedFrames = [];

  // =========================================================================
  // Screen A1: Exact System Overview
  // =========================================================================
  const a1 = figma.createFrame();
  a1.name = "Desktop / A1 - Exact Admin Dashboard";
  a1.resize(1440, 960);
  a1.fills = solidFill("#F1F5F3");
  a1.x = 0;
  a1.y = 0;
  a1.appendChild(createExactSidebar(0));

  const a1Content = figma.createFrame();
  a1Content.x = 288;
  a1Content.y = 36;
  a1Content.resize(1120, 880);
  a1Content.layoutMode = "VERTICAL";
  a1Content.itemSpacing = 20;
  a1Content.fills = [];

  // Title
  const titleBox = figma.createFrame();
  titleBox.layoutMode = "VERTICAL";
  titleBox.itemSpacing = 4;
  titleBox.fills = [];
  titleBox.appendChild(createText("System Overview", 28, "Bold", "#0F172A"));
  titleBox.appendChild(createText("Bayanihan Hub live operational community stats, reports, and moderation queue.", 14, "Regular", "#64748B"));
  a1Content.appendChild(titleBox);

  // Urgent Banner
  const alertBanner = figma.createFrame();
  alertBanner.resize(1120, 56);
  alertBanner.layoutMode = "HORIZONTAL";
  alertBanner.paddingLeft = 16;
  alertBanner.paddingRight = 16;
  alertBanner.cornerRadius = 8;
  alertBanner.fills = solidFill("#FFFBEB");
  alertBanner.strokes = solidFill("#FDE68A");
  alertBanner.primaryAxisAlignItems = "SPACE_BETWEEN";
  alertBanner.counterAxisAlignItems = "CENTER";
  alertBanner.appendChild(createText("🛡️ Action Required: Moderation Reports Awaiting Review (3 pending)", 13, "Bold", "#92400E"));
  alertBanner.appendChild(createButton("Review Reports Queue →", "#27692A", "#FFFFFF"));
  a1Content.appendChild(alertBanner);

  // 5 Quick Stats Cards Row
  const statsRow = figma.createFrame();
  statsRow.layoutMode = "HORIZONTAL";
  statsRow.itemSpacing = 14;
  statsRow.fills = [];

  const stats = [
    { label: "Total Users", val: "1,248", bg: "#FFFFFF", valHex: "#0F172A" },
    { label: "Total Posts", val: "342", bg: "#FFFFFF", valHex: "#0F172A" },
    { label: "Active Requests", val: "28", bg: "#FFFFFF", valHex: "#0F172A" },
    { label: "Pending Approvals", val: "14", bg: "#FFFBEB", stroke: "#FDE68A", valHex: "#D97706", lHex: "#92400E" },
    { label: "Completed Exchanges", val: "189", bg: "#FFFFFF", valHex: "#27692A" },
  ];

  stats.forEach(s => {
    const card = figma.createFrame();
    card.resize(212, 84);
    card.layoutMode = "VERTICAL";
    card.paddingLeft = 16;
    card.paddingRight = 16;
    card.paddingTop = 14;
    card.itemSpacing = 6;
    card.cornerRadius = 8;
    card.fills = solidFill(s.bg);
    card.strokes = solidFill(s.stroke || "#E2E8F0");
    card.appendChild(createText(s.label, 12, "Bold", s.lHex || "#94A3B8"));
    card.appendChild(createText(s.val, 24, "Bold", s.valHex));
    statsRow.appendChild(card);
  });
  a1Content.appendChild(statsRow);

  // 2 Large Split Cards
  const splitRow = figma.createFrame();
  splitRow.layoutMode = "HORIZONTAL";
  splitRow.itemSpacing = 20;
  splitRow.fills = [];

  // Left Card: Reports & Moderation
  const repCard = figma.createFrame();
  repCard.resize(550, 420);
  repCard.layoutMode = "VERTICAL";
  repCard.paddingLeft = 24;
  repCard.paddingRight = 24;
  repCard.paddingTop = 20;
  repCard.paddingBottom = 20;
  repCard.itemSpacing = 16;
  repCard.cornerRadius = 10;
  repCard.fills = solidFill("#FFFFFF");
  repCard.strokes = solidFill("#E2E8F0");
  repCard.appendChild(createText("Reports & Moderation", 17, "Bold", "#0F172A"));
  repCard.appendChild(createText("Live moderation status and disciplinary queue", 12, "Regular", "#64748B"));

  // 4 colored status boxes
  const statusBoxes = figma.createFrame();
  statusBoxes.layoutMode = "HORIZONTAL";
  statusBoxes.itemSpacing = 10;
  statusBoxes.fills = [];
  statusBoxes.appendChild(createBadge("Pending: 3", "#FFFBEB", "#92400E"));
  statusBoxes.appendChild(createBadge("Under Review: 2", "#EEF2FF", "#4338CA"));
  statusBoxes.appendChild(createBadge("Resolved: 41", "#F0FDF4", "#047857"));
  statusBoxes.appendChild(createBadge("High Priority: 1", "#FEF2F2", "#B91C1C"));
  repCard.appendChild(statusBoxes);
  repCard.appendChild(createButton("Open Full Moderation Console →", "#FFFFFF", "#27692A", "#E2E8F0"));
  splitRow.appendChild(repCard);

  // Right Card: Recent Activity
  const actCard = figma.createFrame();
  actCard.resize(550, 420);
  actCard.layoutMode = "VERTICAL";
  actCard.paddingLeft = 24;
  actCard.paddingRight = 24;
  actCard.paddingTop = 20;
  actCard.paddingBottom = 20;
  actCard.itemSpacing = 14;
  actCard.cornerRadius = 10;
  actCard.fills = solidFill("#FFFFFF");
  actCard.strokes = solidFill("#E2E8F0");
  actCard.appendChild(createText("Recent Moderation & Activity", 17, "Bold", "#0F172A"));

  ["Moderation report resolved by administrator (Today)", "User identity verification approved: Carlo M. (1h ago)", "Exchange marked completed (#exc-3) (2h ago)"].forEach(t => {
    const it = figma.createFrame();
    it.resize(502, 48);
    it.layoutMode = "HORIZONTAL";
    it.paddingLeft = 14;
    it.paddingRight = 14;
    it.cornerRadius = 8;
    it.fills = solidFill("#F8FAF9");
    it.counterAxisAlignItems = "CENTER";
    it.appendChild(createText(t, 12, "Medium", "#334155"));
    actCard.appendChild(it);
  });
  splitRow.appendChild(actCard);

  a1Content.appendChild(splitRow);
  a1.appendChild(a1Content);
  generatedFrames.push(a1);

  figma.viewport.scrollAndZoomIntoView(generatedFrames);
  figma.closePlugin("✅ Generated Exact Live Codebase Admin Wireframes!");
}

main();
