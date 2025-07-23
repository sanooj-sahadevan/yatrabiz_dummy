import React from 'react';
import { SidebarOpenIcon, SidebarCloseIcon, UserIcon } from '@/constants/icons';

const IconTypes = {
  SIDEBAR_OPEN: 'sidebar-open',
  SIDEBAR_CLOSE: 'sidebar-close',
  USER: 'user',
};

const Icon = ({ type, className = '', ...props }) => {
  switch (type) {
    case IconTypes.SIDEBAR_OPEN:
      return <SidebarOpenIcon className={className} {...props} />;
    case IconTypes.SIDEBAR_CLOSE:
      return <SidebarCloseIcon className={className} {...props} />;
    case IconTypes.USER:
      return <UserIcon className={className} {...props} />;
    default:
      return null;
  }
};

export { Icon, IconTypes };
