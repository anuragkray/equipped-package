import React, { createContext, useContext, useEffect, useState } from 'react';

// Define themes with color palettes (from user spec)
export const themePalette = {
  'Ivory Elegance': {
    primary: '191, 149, 127',
    surfaceTopNav: '#FDF7F1',
    surfaceStickyNav: '#FDF7F1',
    surfaceLeftNav: '#F8F0E7',
    surfaceNavStoke: '#EBD2C3',
    surfaceButtonSecondary: '#EBD2C3',
    surfaceNavSelected1: '#C9A896',
    surfaceNavSelected2: '#936851',
    surfaceControlSelected: '#EBD2C3',
    surfaceControlHeader: '#FDF7F1',
    darkSurfaceControlHeader: '#070708',
    surfaceKanbanCard: '#FFFDF9',
    darkSurfaceKanbanCard: '#171819',
    surfaceButtonTertiary: '#EBD2C3',
    surfaceButtonPrimary: '#C9A896',
    surfaceKpiCard1: '#C9A896',
    surfaceKpiCard2: '#EBD2C3',
    textBrandSecondary: '#6A4A3A',
    textBrandPrimary: '#231913',
    surfaceCardStroke: '#F7E3D6',
    surfaceLeftNavSelectedStoke: '#8E654E',
    colors: ['#4B3529', '#6C4D3C', '#8E654E', '#BF957F', '#D1B4A4', '#F3ECE8'],
    chartColors: ['#6A4A3A','#936851','#BF957F','#C9A896','#EBD2C3','#D1B4A4','#A47F6D','#7C5D4B'],
    secondary: '#F24C4C',
    background: '#FCE5E5',
  },
  'Azure Clarity': {
    primary: '48, 139, 224',
    surfaceTopNav: '#F7F7F7',
    surfaceStickyNav: '#DCDCDC',
    surfaceLeftNav: '#F2F2F2',
    surfaceNavStoke: '#C1C2C3',
    surfaceButtonSecondary: '#AFD2F3',
    surfaceNavSelected1: '#AFD2F3',
    surfaceNavSelected2: '#308BE0',
    surfaceControlSelected: '#DEEDFC',
    surfaceControlHeader: '#F2F9FF',
    darkSurfaceControlHeader: '#01172C',
    surfaceKanbanCard: '#FCFCFC',
    darkSurfaceKanbanCard: '#171819',
    surfaceButtonTertiary: '#AFD2F3',
    surfaceButtonPrimary: '#AFD2F3',
    surfaceKpiCard1: '#DEEDFC',
    surfaceKpiCard2: '#87BBEC',
    surfaceCardStroke: '#DEEDFC',
    textBrandSecondary: '#033E75',
    textBrandPrimary: '#01172C',
    surfaceLeftNavSelectedStoke: '#0661B6',
    colors: ['#022749', '#033E75', '#0661B6', '#308BE0', '#5AA2E6', '#AFD2F3'],
    chartColors: ['#0661B6','#308BE0','#5AA2E6','#87BBEC','#AFD2F3','#033E75','#022749','#6EB1F0'],
    secondary: '#F3F3F3',
    background: '#FFFFFF',
  },
  'Dynamic Spectrum': {
    primary: '0, 188, 209',
    surfaceTopNav: '#F7F7F7',
    surfaceStickyNav: '#DCDCDC',
    surfaceLeftNav: '#F2F2F2',
    surfaceNavStoke: '#C1C2C3',
    surfaceButtonSecondary: '#80E5EE',
    surfaceNavSelected1: '#BDF0F5',
    surfaceNavSelected2: '#00A3B7',
    surfaceControlSelected: '#80E5EE',
    surfaceControlHeader: '#BDF0F5',
    darkSurfaceControlHeader: '#001E21',
    surfaceCardStroke: '#BDF0F5',
    surfaceKanbanCard: '#FCFCFC',
    darkSurfaceKanbanCard: '#171819',
    surfaceButtonTertiary: '#80E5EE',
    surfaceButtonPrimary: '#BDF0F5',
    surfaceKpiCard1: '#00CCE2',
    surfaceKpiCard2: '#80E5EE',
    textBrandSecondary: '#00434A',
    textBrandPrimary: '#001E21',
    surfaceLeftNavSelectedStoke: '#008796',
    colors: ['#00434A', '#005E69', '#008796', '#00BCD1', '#00CCE2', '#BDF0F5'],
    chartColors: ['#008796','#00BCD1','#00CCE2','#80E5EE','#BDF0F5','#00434A','#005E69','#00E5F0'],
    secondary: '#F3F3F3',
    background: '#FFFFFF',
  },
  'Granite Precision': {
    primary: '162, 163, 165',
    surfaceTopNav: '#F7F7F7',
    surfaceStickyNav: '#DCDCDC',
    surfaceLeftNav: '#F2F2F2',
    surfaceNavStoke: '#C1C2C3',
    surfaceButtonSecondary: '#EDEDED',
    surfaceNavSelected1: '#C1C2C3',
    surfaceNavSelected2: '#A2A3A5',
    surfaceControlSelected: '#EDEDED',
    surfaceControlHeader: '#F2F2F2',
    darkSurfaceControlHeader: '#2E3033',
    surfaceKanbanCard: '#FCFCFC',
    darkSurfaceKanbanCard: '#171819',
    surfaceButtonTertiary: '#EDEDED',
    surfaceButtonPrimary: '#C1C2C3',
    surfaceKpiCard1: '#C1C2C3',
    surfaceKpiCard2: '#EDEDED',
    surfaceCardStroke: '#EDEDED',
    textBrandSecondary: '#45484C',
    textBrandPrimary: '#222426',
    surfaceLeftNavSelectedStoke: '#64666A',
    colors: ['#2E3033', '#45484C', '#64666A', '#A2A3A5', '#C1C2C3', '#EDEDED'],
    chartColors: ['#4A4A4A','#707070','#A0A0A0','#BF978A','#8F9B7A','#608D93','#30505A','#9B8D8F'],
    secondary: '#F3F3F3',
    background: '#FFFFFF',
  },
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'Ivory Elegance');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme = themePalette[theme];
    if (!selectedTheme) return;

    // Always set brand/accent and provided variables
    root.style.setProperty('--primaryDark-color', selectedTheme.colors[0]);
    root.style.setProperty('--primary-color', `rgb(${selectedTheme.primary})`);
    root.style.setProperty('--primary-color-rgb', selectedTheme.primary);
    root.style.setProperty('--primary-color-dark', selectedTheme.colors[0]);
    root.style.setProperty('--secondary-color', selectedTheme.secondary);
    root.style.setProperty('--surface-sticky-nav-color', selectedTheme.surfaceStickyNav);
    root.style.setProperty('--surface-top-nav-color', selectedTheme.surfaceTopNav);
    root.style.setProperty('--surface-left-nav-color', selectedTheme.surfaceLeftNav);
    root.style.setProperty('--surface-nav-stoke-color', selectedTheme.surfaceNavStoke);
    root.style.setProperty('--surface-button-secondary-color', selectedTheme.surfaceButtonSecondary);
    root.style.setProperty('--surface-button-primary-color', selectedTheme.surfaceButtonPrimary);
    root.style.setProperty('--surface-nav-selected1-color', selectedTheme.surfaceNavSelected1);
    root.style.setProperty('--surface-nav-selected2-color', selectedTheme.surfaceNavSelected2);
    root.style.setProperty('--surface-left-nav-selected-stroke-color', selectedTheme.surfaceLeftNavSelectedStoke);
    root.style.setProperty('--surface-control-selected-color', selectedTheme.surfaceControlSelected);
    root.style.setProperty('--surface-control-heading-color', selectedTheme.surfaceControlHeader);
    root.style.setProperty('--surface-dark-control-heading-color', selectedTheme.darkSurfaceControlHeader);
    root.style.setProperty('--surface-kanban-card-color', selectedTheme.surfaceKanbanCard);
    root.style.setProperty('--surface-dark-kanban-card-color', selectedTheme.darkSurfaceKanbanCard);
    root.style.setProperty('--surface-kpi-card1-color', selectedTheme.surfaceKpiCard1);
    root.style.setProperty('--surface-kpi-card2-color', selectedTheme.surfaceKpiCard2);
    root.style.setProperty('--surface-kpi-card-stoke-color', selectedTheme.surfaceCardStroke);
    root.style.setProperty('--surface-card-stroke-color', selectedTheme.surfaceCardStroke);
    root.style.setProperty('--text-brand-primary-color', selectedTheme.textBrandPrimary);
    root.style.setProperty('--text-primary-color', selectedTheme.textBrandSecondary);
    root.style.setProperty('--text-brand-secondary-color', selectedTheme.textBrandSecondary);
    // Set table header bg for facility details (used by bg-tableHeaderBg)
    root.style.setProperty('--table-header-bg', selectedTheme.surfaceKpiCard2 || selectedTheme.surfaceNavSelected1 || `rgb(${selectedTheme.primary})`);

    // Map to existing CSS variables used by the app
    root.style.setProperty('--brand', `rgb(${selectedTheme.primary})`);
    root.style.setProperty('--accent', selectedTheme.surfaceNavSelected2);

    if (darkMode) {
      // App dark palette - improved contrast and consistency
      root.style.setProperty('--bg', '#121418');
      root.style.setProperty('--bg-2', '#21262d');
      root.style.setProperty('--panel', '#1e2228');
      root.style.setProperty('--panel-2', selectedTheme.darkSurfaceControlHeader || '#2d333b');
      root.style.setProperty('--text', '#e6edf3');
      root.style.setProperty('--muted', '#8b949e');
      root.style.setProperty('--brand', `rgb(${selectedTheme.primary})`);
      // Sidebar-specific - improved dark mode
      root.style.setProperty('--sidebar-bg', '#1e2228');
      root.style.setProperty('--sidebar-selected-bg', '#21262d');
      root.style.setProperty('--sidebar-stroke', '#30363d');
      // Topbar-specific dark mode
      root.style.setProperty('--topbar-bg', '#161b22');
      root.style.setProperty('--topbar-border', '#30363d');
      root.style.setProperty('--topbar-input-border', '#30363d');
      root.style.setProperty('--avatar-text', '#ffffff');
      // StatCard-specific (dark) - use theme colors
      root.style.setProperty('--stat-card-bg', selectedTheme.surfaceKpiCard1 ? selectedTheme.surfaceKpiCard1 : selectedTheme.surfaceTopNav);
      root.style.setProperty('--stat-card-border', selectedTheme.surfaceCardStroke || selectedTheme.surfaceNavStoke);
      root.style.setProperty('--stat-icon-bg', `rgb(${selectedTheme.primary})`);
      root.style.setProperty('--stat-icon-text', '#ffffff');
      root.style.setProperty('--stat-card-glow-start', 'rgba(255,255,255,0.15)');
      root.style.setProperty('--stat-card-glow-end', 'rgba(255,255,255,0)');
      // Stat text colors in dark mode: force black text inside stat cards
      root.style.setProperty('--stat-text', '#111111');
      root.style.setProperty('--stat-muted', '#111111');
      // AssetTable (dark) - improved contrast
      root.style.setProperty('--table-header-bg', `rgb(${selectedTheme.primary})`);
      root.style.setProperty('--table-header-text', '#0d1117');
      root.style.setProperty('--table-head-bg', '#21262d');
      root.style.setProperty('--table-row-odd', '#1e2228');
      root.style.setProperty('--table-row-total', '#21262d');
      root.style.setProperty('--table-border', '#30363d');
      // Generic panel border - consistent dark borders
      root.style.setProperty('--panel-border', '#30363d');
      // Dropdown menu (dark) - improved visibility
      root.style.setProperty('--dropdown-bg', '#1e2228');
      root.style.setProperty('--dropdown-border', '#30363d');
      root.style.setProperty('--dropdown-divider', '#30363d');
      root.style.setProperty('--dropdown-hover', '#21262d');
    } else {
      // App light palette from theme
      // Use theme's background color, or if it's white, use the lightest theme color for a subtle tint
      const bgColor =  '#FFFFFF';
      root.style.setProperty('--bg', bgColor);
      root.style.setProperty('--bg-2', selectedTheme.surfaceLeftNav);
      root.style.setProperty('--panel', selectedTheme.surfaceTopNav);
      root.style.setProperty('--panel-2', selectedTheme.surfaceControlHeader);
      root.style.setProperty('--text', '#111111');
      root.style.setProperty('--muted', '#6b7280');
      // Sidebar-specific from theme tokens
      root.style.setProperty('--sidebar-bg', selectedTheme.surfaceLeftNav);
      root.style.setProperty('--sidebar-selected-bg', selectedTheme.surfaceNavSelected1);
      root.style.setProperty('--sidebar-stroke', selectedTheme.surfaceNavStoke);
      // Topbar-specific light mode from theme
      root.style.setProperty('--topbar-bg', selectedTheme.surfaceTopNav);
      root.style.setProperty('--topbar-border', selectedTheme.surfaceNavStoke);
      root.style.setProperty('--topbar-input-border', selectedTheme.surfaceNavStoke);
      root.style.setProperty('--avatar-text', '#ffffff');
      // StatCard-specific (light)
      root.style.setProperty('--stat-card-bg', selectedTheme.surfaceKpiCard1 ? selectedTheme.surfaceKpiCard1 : selectedTheme.surfaceTopNav);
      root.style.setProperty('--stat-card-border', selectedTheme.surfaceCardStroke || selectedTheme.surfaceNavStoke);
      root.style.setProperty('--stat-icon-bg', `rgb(${selectedTheme.primary})`);
      root.style.setProperty('--stat-icon-text', '#ffffff');
      root.style.setProperty('--stat-card-glow-start', 'rgba(255,255,255,0.25)');
      root.style.setProperty('--stat-card-glow-end', 'rgba(255,255,255,0)');
      // Stat text colors in light mode: keep black and muted
      root.style.setProperty('--stat-text', '#111111');
      root.style.setProperty('--stat-muted', '#6b7280');
      // AssetTable (light)
      root.style.setProperty('--table-header-bg', selectedTheme.surfaceKpiCard2 || selectedTheme.surfaceNavSelected1 || `rgb(${selectedTheme.primary})`);
      root.style.setProperty('--table-header-text', '#111111');
      root.style.setProperty('--table-head-bg', selectedTheme.surfaceControlHeader);
      root.style.setProperty('--table-row-odd', '#f8f9fb');
      root.style.setProperty('--table-row-total', '#eef2f7');
      root.style.setProperty('--table-border', selectedTheme.surfaceCardStroke || selectedTheme.surfaceNavStoke);
      // Generic panel border - use theme's nav stroke for more visible borders in main content
      root.style.setProperty('--panel-border', selectedTheme.surfaceNavStoke || selectedTheme.surfaceCardStroke || '#e0e0e0');
      // Dropdown menu (light)
      root.style.setProperty('--dropdown-bg', '#ffffff');
      root.style.setProperty('--dropdown-border', '#e3e6ec');
      root.style.setProperty('--dropdown-divider', '#eef1f5');
      root.style.setProperty('--dropdown-hover', '#f4f6f9');
    }

    // Persist and toggle class for any external styles relying on it
    localStorage.setItem('theme', theme);
    localStorage.setItem('darkMode', darkMode);
    root.classList.toggle('dark', darkMode);
  }, [theme, darkMode]);

  const changeTheme = (themeName) => {
    if (themePalette[themeName]) setTheme(themeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

