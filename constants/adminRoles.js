export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  STAFF: "staff",
  SUPPLIER: "supplier",
  VIEWER: "viewer",
};

export const VALID_ADMIN_ROLES = [
  ADMIN_ROLES.SUPER_ADMIN,
  ADMIN_ROLES.STAFF,
  ADMIN_ROLES.SUPPLIER,
  ADMIN_ROLES.VIEWER,
];

export const ADMIN_ROLE_LABELS = {
  [ADMIN_ROLES.SUPER_ADMIN]: "Super Admin",
  [ADMIN_ROLES.STAFF]: "Staff",
  [ADMIN_ROLES.SUPPLIER]: "Supplier",
  [ADMIN_ROLES.VIEWER]: "Viewer",
};

export const ADMIN_ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: [
    "manage_users",
    "manage_tickets",
    "manage_bookings",
    "manage_admins",
  ],
  [ADMIN_ROLES.STAFF]: ["manage_tickets", "manage_bookings"],
  [ADMIN_ROLES.SUPPLIER]: ["manage_tickets", "manage_bookings"],
  [ADMIN_ROLES.VIEWER]: ["manage_bookings"],
};
