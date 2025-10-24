/**
 * Navigation utilities for role-based access control
 */

export type UserRole = 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN';

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
  roles: UserRole[];
}

/**
 * Navigation items with role-based access
 */
export const navigationItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    roles: ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'],
  },
  {
    href: '/dashboard/parcours',
    label: 'Mon Parcours',
    roles: ['BENEFICIARY'],
  },
  {
    href: '/dashboard/tests',
    label: 'Tests',
    roles: ['BENEFICIARY'],
  },
  {
    href: '/dashboard/recommendations',
    label: 'Recommandations',
    roles: ['BENEFICIARY'],
  },
  {
    href: '/dashboard/documents',
    label: 'Documents',
    roles: ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'],
  },
  {
    href: '/dashboard/messages',
    label: 'Messages',
    roles: ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'],
  },
  {
    href: '/dashboard/consultant',
    label: 'Espace Consultant',
    roles: ['CONSULTANT', 'ORG_ADMIN'],
  },
  {
    href: '/dashboard/admin',
    label: 'Administration',
    roles: ['ORG_ADMIN'],
  },
  {
    href: '/dashboard/settings',
    label: 'Paramètres',
    roles: ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'],
  },
];

/**
 * Filter navigation items based on user role
 */
export function getNavigationForRole(role: UserRole): NavItem[] {
  return navigationItems.filter(item => item.roles.includes(role));
}

/**
 * Check if user has access to a specific route
 */
export function hasAccessToRoute(role: UserRole, href: string): boolean {
  const item = navigationItems.find(item => item.href === href);
  return item ? item.roles.includes(role) : false;
}

