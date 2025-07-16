export default function StatusAlert({ message }: { message: string }) {
  return (
    <div className="mb-4 w-full text-center bg-purple-100 text-purple-800 py-2 rounded shadow">
      {message}
    </div>
  );
}