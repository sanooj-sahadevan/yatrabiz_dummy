import { Icon, IconTypes } from "@/components/common/icon/icon";

const UserDropdown = ({ userEmail, onLogout, dropdownRef, isOpen, onToggle }) => (
  <div className="relative" ref={dropdownRef}>
    <div
      className="flex items-center gap-3 cursor-pointer select-none"
      onClick={onToggle}
    >
      <Icon type={IconTypes.USER} className="text-gray-300 w-6 h-6" />
      <span className="w-[140px] truncate inline-block align-middle text-sm text-gray-300">{(userEmail || "A").toUpperCase()}</span>
    </div>

    {isOpen && (
      <div className="absolute right-0 mt-2 w-36 bg-white rounded shadow-md py-1 z-50 border border-gray-200">
        <button
          onClick={onLogout}
          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Logout
        </button>
      </div>
    )}
  </div>
);

export default UserDropdown; 