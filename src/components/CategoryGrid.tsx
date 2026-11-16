import React from 'react';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
}

export default function CategoryGrid({ categories, onSelectCategory }: CategoryGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
          <p className="text-xs text-gray-600 mt-1">Explore our wide selection across 9 curated departments</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-100 cursor-pointer flex flex-col"
          >
            <div className="relative h-36 sm:h-40 overflow-hidden bg-purple-50">
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <span className="absolute bottom-3 left-3 right-3 text-white font-bold text-sm sm:text-base truncate">
                {cat.name}
              </span>
            </div>
            <div className="p-3 bg-white flex-1 flex flex-col justify-between">
              <p className="text-[11px] text-gray-600 line-clamp-2">{cat.description}</p>
              <span className="text-[11px] font-bold text-purple-700 mt-2 group-hover:underline">
                Explore →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
