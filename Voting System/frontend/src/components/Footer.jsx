import { Link } from "react-router-dom";
import { Github, Twitter, Mail, Heart } from "lucide-react";

const Footer = ({ theme }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`w-full border-t transition-all duration-300 ${
        theme === "dark"
          ? "bg-gray-900/80 border-gray-800 text-gray-300"
          : "bg-white/80 border-gray-200 text-gray-600"
      } backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                }`}
              >
                V
              </div>
              <span
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                VoyeByte
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              A secure, transparent, and user-friendly online voting platform that ensures democracy in the digital age.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className={`text-sm hover:underline transition-colors ${
                    theme === "dark"
                      ? "hover:text-green-400"
                      : "hover:text-blue-600"
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/elections"
                  className={`text-sm hover:underline transition-colors ${
                    theme === "dark"
                      ? "hover:text-green-400"
                      : "hover:text-blue-600"
                  }`}
                >
                  Elections
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className={`text-sm hover:underline transition-colors ${
                    theme === "dark"
                      ? "hover:text-green-400"
                      : "hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className={`text-sm hover:underline transition-colors ${
                    theme === "dark"
                      ? "hover:text-green-400"
                      : "hover:text-blue-600"
                  }`}
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3
              className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@voyebyte.com"
                  className={`text-sm hover:underline transition-colors ${
                    theme === "dark"
                      ? "hover:text-green-400"
                      : "hover:text-blue-600"
                  }`}
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-sm hover:underline transition-colors ${
                    theme === "dark"
                      ? "hover:text-green-400"
                      : "hover:text-blue-600"
                  }`}
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-sm hover:underline transition-colors ${
                    theme === "dark"
                      ? "hover:text-green-400"
                      : "hover:text-blue-600"
                  }`}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-sm hover:underline transition-colors ${
                    theme === "dark"
                      ? "hover:text-green-400"
                      : "hover:text-blue-600"
                  }`}
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-1 text-sm">
              <span>© {currentYear} VoyeByte. Made with</span>
              <Heart
                className={`w-4 h-4 ${
                  theme === "dark" ? "text-red-400" : "text-red-500"
                }`}
                fill="currentColor"
              />
              <span>for democracy.</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className={`transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-green-400"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className={`transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-green-400"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@voyebyte.com"
                className={`transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-green-400"
                    : "text-gray-500 hover:text-blue-600"
                }`}
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
