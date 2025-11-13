import Image from 'next/image';

interface TorrentHeaderProps {
  backdropPath?: string | null;
  altText: string;
}

const TorrentHeader = ({ backdropPath, altText }: TorrentHeaderProps) => {
  // 如果没有背景图，使用一个占位符或者返回 null
  if (!backdropPath) {
    return (
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 z-10 w-full h-16 bg-background"></div>
      </div>
    );
  }

  const backdropUrl = `https://image.tmdb.org/t/p/original${backdropPath}`;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden">
      <Image
        src={backdropUrl}
        alt={altText}
        fill
        className="object-cover object-top"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
      <div className="absolute inset-x-0 bottom-0 z-10 w-full h-16 bg-background"></div>
    </div>
  );
};

export default TorrentHeader;