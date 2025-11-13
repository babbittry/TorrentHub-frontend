import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ActorAvatarProps {
  profilePath: string | null;
  name: string;
  character: string;
}

const ActorAvatar = ({ profilePath, name, character }: ActorAvatarProps) => {
  const t = useTranslations('torrentDetail');
  const imageUrl = profilePath
    ? `https://image.tmdb.org/t/p/w185${profilePath}`
    : '/default-avatar.svg';

  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="rounded-full object-cover shadow-md"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <h3 className="mt-2 font-semibold text-sm text-foreground">{name}</h3>
      <p className="text-xs text-muted-foreground">{t('asCharacter', { characterName: character })}</p>
    </div>
  );
};

export default ActorAvatar;