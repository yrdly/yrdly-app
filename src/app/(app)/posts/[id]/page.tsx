import { PostPageClient } from './PostPageClient';

// For Next.js 15 compatibility, params is now async
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    // Await the params for Next.js 15
    const resolvedParams = await params;
    
    return <PostPageClient postId={resolvedParams.id} />;
}
