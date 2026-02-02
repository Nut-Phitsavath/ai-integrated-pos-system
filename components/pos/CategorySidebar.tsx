'use client';

interface CategorySidebarProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

const categories = [
    { name: 'All', icon: '📦' },
    { name: 'Power Tools', icon: '🔌' },
    { name: 'Hand Tools', icon: '🔨' },
    { name: 'Building Materials', icon: '🧱' },
    { name: 'Electrical', icon: '💡' },
    { name: 'Plumbing', icon: '🚰' },
    { name: 'Paint', icon: '🎨' },
    { name: 'Safety', icon: '🦺' },
    { name: 'Hardware', icon: '🔩' },
];

export default function CategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 sticky top-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Categories</h2>
            <nav className="space-y-1">
                {categories.map((category) => (
                    <button
                        key={category.name}
                        onClick={() => onSelectCategory(category.name)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${selectedCategory === category.name
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
