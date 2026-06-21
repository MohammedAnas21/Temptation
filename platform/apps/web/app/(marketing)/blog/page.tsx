import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog — Temptations Cafe",
  description: "News, recipes, and stories from Temptations Cafe, Kalaburagi.",
  path: "/blog",
});

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = [];
  try {
    posts = await getBlogPosts({ limit: "20" });
  } catch {
    posts = [];
  }

  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Stories & Updates</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-4xl md:text-5xl">Blog</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16">
        {posts.length === 0 ? (
          <p className="text-center text-brand-green-700/60">No posts yet. Check back soon!</p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl p-6 border border-brand-ivory-200 shadow-sm">
                {post.published_at && (
                  <time className="text-brand-gold-600 text-sm">{new Date(post.published_at).toLocaleDateString()}</time>
                )}
                <h2 className="font-display font-black text-2xl text-brand-green-900 mt-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-brand-gold-600 transition-colors">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && <p className="text-brand-green-700/70 mt-3">{post.excerpt}</p>}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-brand-ivory-100 text-brand-green-700 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
