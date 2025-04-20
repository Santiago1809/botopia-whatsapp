interface HeaderProps {
  title: string;
  logoSrc: string;
}

export const Header = ({ title, logoSrc }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={logoSrc}
            alt={`${title} logo`}
            width={100}
            height={30}
            className="mr-2"
          />
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex space-x-5">
            <a
              href="/products"
              className="text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              Products
            </a>
            <a
              href="/members"
              className="text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              Members and roles
            </a>
            <a
              href="/usage"
              className="text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              Usage
            </a>
            <a
              href="/api-keys"
              className="text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              API keys
            </a>
            <a
              href="/webhooks"
              className="text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              Webhooks / automations
            </a>
          </nav>
        </div>

        <div className="flex items-center">
          <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
          <button className="ml-4 md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
