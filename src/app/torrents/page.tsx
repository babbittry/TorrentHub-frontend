
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TorrentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 每页显示数量

  // 占位数据
  const torrents = [
    {
      id: 1,
      name: '[动漫] 某某动漫 第一季',
      category: '动漫',
      size: '1.5 GB',
      uploader: 'UserA',
      seeders: 120,
      leechers: 30,
      completed: 500,
      date: '2023-08-01',
      status: 'free',
      thumbnail: '/next.svg', // 占位图
      tags: ['1080p', 'HEVC', '中文字幕', 'TOP'],
      imdb: '7.8',
    },
    {
      id: 2,
      name: '[电影] 某某电影 4K REMUX',
      category: '电影',
      size: '50 GB',
      uploader: 'UserB',
      seeders: 80,
      leechers: 10,
      completed: 200,
      date: '2023-07-28',
      status: 'normal',
      thumbnail: '/vercel.svg', // 占位图
      tags: ['4K', 'REMUX', '杜比视界', 'HDR10+'],
      imdb: '8.5',
    },
    {
      id: 3,
      name: '[剧集] 某某剧集 全集',
      category: '剧集',
      size: '20 GB',
      uploader: 'UserC',
      seeders: 200,
      leechers: 50,
      completed: 800,
      date: '2023-08-05',
      status: '2x',
      thumbnail: '/file.svg', // 占位图
      tags: ['1080p', 'H.264', '英文字幕'],
      imdb: '7.2',
    },
    {
      id: 4,
      name: '[音乐] 某某专辑 FLAC',
      category: '音乐',
      size: '500 MB',
      uploader: 'UserD',
      seeders: 50,
      leechers: 5,
      completed: 100,
      date: '2023-07-20',
      status: 'normal',
      thumbnail: '/globe.svg', // 占位图
      tags: ['FLAC', '无损', '24bit'],
      imdb: null,
    },
    {
      id: 5,
      name: '[游戏] 某某游戏 PC版',
      category: '游戏',
      size: '30 GB',
      uploader: 'UserE',
      seeders: 90,
      leechers: 20,
      completed: 300,
      date: '2023-08-03',
      status: 'free',
      thumbnail: '/window.svg', // 占位图
      tags: ['PC', '破解版', '中文'],
      imdb: '9.0',
    },
    {
      id: 6,
      name: '[动漫] 某某动漫 第二季',
      category: '动漫',
      size: '1.8 GB',
      uploader: 'UserF',
      seeders: 150,
      leechers: 40,
      completed: 600,
      date: '2023-08-02',
      status: 'normal',
      thumbnail: '/next.svg', // 占位图
      tags: ['720p', 'AVC', '日文字幕'],
      imdb: '7.5',
    },
    {
      id: 7,
      name: '[电影] 某某电影 1080p',
      category: '电影',
      size: '10 GB',
      uploader: 'UserG',
      seeders: 70,
      leechers: 15,
      completed: 250,
      date: '2023-07-25',
      status: 'free',
      thumbnail: '/vercel.svg', // 占位图
      tags: ['1080p', 'H.264', '中文字幕'],
      imdb: '8.0',
    },
    {
      id: 8,
      name: '[剧集] 某某剧集 第二季',
      category: '剧集',
      size: '25 GB',
      uploader: 'UserH',
      seeders: 180,
      leechers: 45,
      completed: 750,
      date: '2023-08-04',
      status: 'normal',
      thumbnail: '/file.svg', // 占位图
      tags: ['1080p', 'X265', '英文字幕'],
      imdb: '7.0',
    },
    {
      id: 9,
      name: '[音乐] 某某单曲 MP3',
      category: '音乐',
      size: '10 MB',
      uploader: 'UserI',
      seeders: 40,
      leechers: 2,
      completed: 80,
      date: '2023-07-18',
      status: 'normal',
      thumbnail: '/globe.svg', // 占位图
      tags: ['MP3', '320kbps'],
      imdb: null,
    },
    {
      id: 10,
      name: '[游戏] 某某游戏 PS5版',
      category: '游戏',
      size: '80 GB',
      uploader: 'UserJ',
      seeders: 100,
      leechers: 25,
      completed: 400,
      date: '2023-08-01',
      status: '2x',
      thumbnail: '/window.svg', // 占位图
      tags: ['PS5', '数字版', '中文'],
      imdb: '9.2',
    },
  ];

  // 过滤和排序逻辑
  const filteredTorrents = torrents.filter(torrent => {
    return torrent.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (category === 'all' || torrent.category === category);
  }).sort((a, b) => {
    let valA: any, valB: any;
    switch (sortBy) {
      case 'date':
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
        break;
      case 'size':
        valA = parseFloat(a.size);
        valB = parseFloat(b.size);
        break;
      case 'seeders':
        valA = a.seeders;
        valB = b.seeders;
        break;
      case 'leechers':
        valA = a.leechers;
        valB = b.leechers;
        break;
      case 'completed':
        valA = a.completed;
        valB = b.completed;
        break;
      default:
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
    }
    if (sortOrder === 'asc') {
      return valA - valB;
    } else {
      return valB - valA;
    }
  });

  // 分页逻辑
  const totalPages = Math.ceil(filteredTorrents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTorrents = filteredTorrents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-white mb-8">种子列表</h1>

      {/* 筛选和排序 */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          placeholder="搜索种子名称..."
          className="flex-grow p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:border-pink-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">所有分类</option>
          <option value="动漫">动漫</option>
          <option value="电影">电影</option>
          <option value="剧集">剧集</option>
          <option value="音乐">音乐</option>
          <option value="游戏">游戏</option>
          {/* 更多分类 */}
        </select>

        <select
          className="p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:border-pink-500"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">发布日期</option>
          <option value="size">大小</option>
          <option value="seeders">做种</option>
          <option value="leechers">下载</option>
          <option value="completed">完成</option>
        </select>

        <button
          className="p-3 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors duration-200"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          排序: {sortOrder === 'asc' ? '升序' : '降序'}
        </button>
      </div>

      {/* 种子表格 */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">分类</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">大小</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">上传者</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">做种</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">下载</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">完成</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">发布日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">状态</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {torrents.map((torrent) => (
              <tr key={torrent.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-400">{torrent.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{torrent.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{torrent.size}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{torrent.uploader}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{torrent.seeders}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">{torrent.leechers}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">{torrent.completed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{torrent.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {torrent.status === 'free' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500 text-white">
                      免费
                    </span>
                  )}
                  {torrent.status === '2x' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500 text-white">
                      2X
                    </span>
                  )}
                  {torrent.status === 'normal' && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-500 text-white">
                      普通
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
