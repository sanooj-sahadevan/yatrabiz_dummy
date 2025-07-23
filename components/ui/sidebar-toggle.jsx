import { Icon, IconTypes } from "@/components/common/icon/icon";

const SidebarToggle = ({ isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    className="bg-white border border-gray-200 rounded-full p-1 shadow transition-colors hover:bg-gray-100 focus:outline-none focus-visible:outline-none -ml-4"
    aria-label="Toggle Sidebar"
  >
    <Icon type={isOpen ? IconTypes.SIDEBAR_CLOSE : IconTypes.SIDEBAR_OPEN} className="text-gray-900 w-4 h-4" />
  </button>
);

export default SidebarToggle; 