import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-gray-200">
      <div className="h-16 px-6 flex items-center justify-end  border-b border-gray-200">
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50 transition"
            aria-haspopup="true"
            aria-expanded={isProfileOpen}
            type="button"
          >
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
              AU
            </div>

            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-[11px] text-gray-500">System Administrator</p>
            </div>

            <ChevronDown size={16} className="text-gray-700" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <button
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50"
                onClick={() => navigate("/")}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
