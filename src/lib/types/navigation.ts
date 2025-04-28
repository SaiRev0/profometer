export interface NavItem {
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
    active?: boolean;
    sheet?: boolean;
}

export interface MoreLink {
    label: string;
    href: string;
}

export interface NavigationProps {
    navItems: NavItem[];
    moreLinks?: MoreLink[];
    onSearchClick?: () => void;
    onThemeToggle?: () => void;
    theme?: string;
}
export interface NavLink {
    href: string;
    label: string;
    active: boolean;
}

export interface Professor {
    id: string;
    name: string;
    department: string;
}

export interface Branch {
    id: string;
    name: string;
    professors: number;
}

export interface SearchResults {
    professors: Professor[];
    branches: Branch[];
    popular: string[];
}
