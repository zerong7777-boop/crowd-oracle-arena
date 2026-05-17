export function getPathRoomCode(pathname: string): string | undefined {
  const parts = pathname.split("/").filter(Boolean);
  return parts[1]?.toUpperCase();
}
