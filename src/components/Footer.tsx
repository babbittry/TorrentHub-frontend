
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} Sakura.PT. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="hover:text-pink-400 transition-colors duration-200">隐私政策</a>
          <a href="#" className="hover:text-pink-400 transition-colors duration-200">服务条款</a>
          <a href="#" className="hover:text-pink-400 transition-colors duration-200">联系我们</a>
        </div>
      </div>
    </footer>
  );
}
