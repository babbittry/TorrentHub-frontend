export default function Home() {
  return (
    <div className="container mx-auto p-4">
      {/* 公告/轮播图占位符 */}
      <section className="bg-gray-700 h-48 rounded-lg flex items-center justify-center text-white text-2xl mb-8">
        最新公告 / 热门种子轮播
      </section>

      {/* 搜索框 */}
      <div className="mb-8 flex justify-center">
        <input
          type="text"
          placeholder="搜索种子..."
          className="w-full max-w-md p-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
        />
        <button className="ml-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200">
          搜索
        </button>
      </div>

      {/* 最新种子列表占位符 */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">最新种子</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 种子卡片占位符 */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-pink-400 mb-2">种子名称 {item}</h3>
              <p className="text-gray-300">分类: 动漫</p>
              <p className="text-gray-300">大小: 1.5 GB</p>
              <p className="text-gray-300">上传者: User{item}</p>
              <p className="text-gray-300">发布时间: 2023-01-0{item}</p>
              <p className="text-gray-300">做种/下载: 100 / 50</p>
              <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full mt-2">免费</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
