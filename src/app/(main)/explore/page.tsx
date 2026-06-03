import { Categories } from "@/types"
import Link from "next/link"
import { Badge } from "@/components/ui"

export default function ExplorePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-text-primary mb-4">Explore</h1>
      <p className="text-text-secondary mb-12">Browse artworks by category</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Categories.map(category => (
          <Link key={category} href={`/search?category=${encodeURIComponent(category)}`}>
            <div className="group relative h-48 rounded-2xl overflow-hidden bg-bg-tertiary border border-border hover:border-accent transition-colors cursor-pointer flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-bg-primary/50 to-bg-primary/90 z-10 group-hover:opacity-80 transition-opacity" />
              <h2 className="relative z-20 text-2xl font-semibold text-text-primary group-hover:scale-110 transition-transform">
                {category}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
