'use client';

import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const testimonials = [
  {
    name: 'Kamelia Diana',
    rating: 4.9,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80',
  },
  {
    name: 'Haikal Adam',
    rating: 4.8,
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80',
  },
  {
    name: 'Joe Zatharo',
    rating: 4.9,
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80',
  },
];

export default function MemoriesSection({ onBook }: { onBook: () => void }) {
  const { t } = useLanguage();

  const features = [
    { num: '01', title: t.memories.feature1Title, desc: t.memories.feature1Desc },
    { num: '02', title: t.memories.feature2Title, desc: t.memories.feature2Desc },
    { num: '03', title: t.memories.feature3Title, desc: t.memories.feature3Desc },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-3">
            {t.memories.title}
          </h2>
          <p className="font-inter text-gray-500 text-base">{t.memories.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Features */}
          <div className="space-y-8">
            {features.map((feature, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-10 h-10 bg-ocean-700 text-white rounded-xl flex items-center justify-center font-poppins font-bold text-sm flex-shrink-0">
                  {feature.num}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-gray-900 text-lg mb-2">{feature.title}</h3>
                  <p className="font-inter text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}

            <button
              onClick={onBook}
              className="inline-flex items-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white font-poppins font-semibold text-sm px-7 py-3.5 rounded-xl transition-all hover:shadow-lg mt-2"
            >
              {t.memories.startExplore}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Image with testimonials */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden h-96 lg:h-[480px] relative shadow-card-hover">
              <Image
                src="/images/hero/hero-diani.jpg"
                alt="Diani beach Kenya"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {testimonials.map((review, i) => (
              <div
                key={i}
                className={`absolute bg-white rounded-2xl shadow-card-hover px-4 py-3 flex items-center gap-3 min-w-[160px] z-10 ${
                  i === 0 ? 'top-8 -left-4 sm:-left-8' :
                  i === 1 ? 'top-1/2 -right-4 sm:-right-6 -translate-y-1/2' :
                  'bottom-12 -left-4 sm:-left-6'
                }`}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden relative flex-shrink-0 border-2 border-sand-100">
                  <Image src={review.avatar} alt={review.name} fill className="object-cover" sizes="40px" />
                </div>
                <div>
                  <div className="font-poppins font-semibold text-gray-900 text-xs leading-none mb-1">{review.name}</div>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-inter text-xs text-gray-600 font-medium">{review.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
