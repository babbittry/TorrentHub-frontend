
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-pink-400">
          Sakura.PT
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="hover:text-pink-400 transition-colors duration-200">
              首页
            </Link>
          </li>
          <li>
            <Link href="/torrents" className="hover:text-pink-400 transition-colors duration-200">
              种子
            </Link>
          </li>
          <li>
            <Link href="/forums" className="hover:text-pink-400 transition-colors duration-200">
              论坛
            </Link>
          </li>
          <li>
            <Link href="/requests" className="hover:text-pink-400 transition-colors duration-200">
              请求
            </Link>
          </li>
          <li>
            <Link href="/user" className="hover:text-pink-400 transition-colors duration-200">
              用户中心
            </Link>
          </li>
          <li>
            <Link href="/messages" className="hover:text-pink-400 transition-colors duration-200">
              消息
            </Link>
          </li>
          <li>
            <Link href="/store" className="hover:text-pink-400 transition-colors duration-200">
              商店
            </Link>
          </li>
        </ul>
        <div>
          {/* 用户状态占位符 */}
          <Link href="/login" className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition-colors duration-200">
            登录
          </Link>
        </div>
      </nav>
    </header>
  );
}
