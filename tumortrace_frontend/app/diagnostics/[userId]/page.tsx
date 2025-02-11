// app/posts/[userId]/page.tsx
export default function PostPage({ params }: { params: { userId: string } }) {
  const { userId } = params;

  return (
    <div>
      <h1>Post userId: {userId}</h1>
      {/* Your component logic here */}
    </div>
  );
}