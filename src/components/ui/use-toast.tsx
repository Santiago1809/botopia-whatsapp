// Simple toast mock
export function toast({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  alert(`${title}: ${description}`);
}
