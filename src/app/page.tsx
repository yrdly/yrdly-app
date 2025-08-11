import { PostCard } from "@/components/PostCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { posts } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-4">
           <CreatePostDialog />
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
