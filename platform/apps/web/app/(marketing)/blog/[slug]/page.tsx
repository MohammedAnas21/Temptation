import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);
    return buildMetadata({
      title: post.title,
      description: post.excerpt ?? `Read ${post.title} on the Temptations Cafe blog.`,
      path: `/blog/${slug}`,
      image: post.featured_image_url,
    });
  } catch {
    return buildMetadata({ title: "Post Not Found", path: `/blog/${slug}` });
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post;
  try {
    post = await getBlogPost(slug);
  } catch {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image_url,
    datePublished: post.published_at,
    author: { "@type": "Organization", name: "Temptations Cafe" },
    publisher: {
      "@type": "Organization",
      name: "Temptations Cafe",
      logo: { "@type": "ImageObject", url: "https://temptationscafe.in/logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://temptationscafe.in/blog/${post.slug}` },
  };

  return (
    <div className="min-h-screen bg-brand-ivory-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="bg-brand-green-900 py-16 text-center">
        <p className="text-brand-gold-400 text-sm tracking-[0.3em] uppercase mb-2">Blog</p>
        <h1 className="text-brand-ivory-50 font-display font-black text-3xl md:text-5xl max-w-3xl mx-auto px-4 leading-tight">
          {post.title}
        </h1>
        {post.published_at && (
          <time className="block mt-4 text-brand-ivory-100/50 text-sm">
            {new Date(post.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        )}
      </div>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {post.featured_image_url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10">
            <Image src={post.featured_image_url} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 bg-brand-ivory-100 text-brand-green-700 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-lg prose-brand max-w-none text-brand-green-900/80 leading-relaxed whitespace-pre-line">
          {post.content}
        </div>

        <div className="mt-16 pt-8 border-t border-brand-ivory-200">
          <Link href="/blog" className="text-brand-gold-600 hover:text-brand-gold-500 font-medium transition-colors">
            &larr; Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
