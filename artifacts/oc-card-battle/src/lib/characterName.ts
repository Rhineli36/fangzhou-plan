export function getCharacterDisplayName(name: string): string {
  return name.replace(/\s*[（(][^）)]*[）)]\s*/g, "").trim() || name;
}

export function getCharacterAlias(name: string): string {
  const match = name.match(/[（(]([^）)]*)[）)]/);
  return match?.[1]?.trim() ?? "";
}
