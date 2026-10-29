import { initialsFor } from '../lib/chat';

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
};

export function Avatar({ name, size = 'md', online = false }: AvatarProps) {
  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {initialsFor(name)}
      {online && <i className="avatar__status" />}
    </span>
  );
}
