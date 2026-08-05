'use client';

import Image from 'next/image';
import { Headphones, Car, BadgeCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Headphones className="w-5 h-5 text-safari-500" />,
      title: t.services.item1Title,
      desc: t.services.item1Desc,
    },
    {
      icon: <Car className="w-5 h-5 text-safari-500" />,
      title: t.services.item2Title,
      desc: t.services.item2Desc,
    },
    {
      icon: <BadgeCheck className="w-5 h-5 text-safari-500" />,
      title: t.services.item3Title,
      desc: t.services.item3Desc,
    },
  ];

  return (
    <section id="services" className="py-20 lg:py-28 bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-right mb-10">
          <span className="font-inter text-safari-500 font-semibold text-sm tracking-widest uppercase block mb-2">
            {t.services.label}
          </span>
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900">
            {t.services.title}{' '}
            <span className="text-safari-500">{t.services.titleHighlight}</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden h-72 sm:h-96 relative shadow-card-hover">
              <Image
                src="https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Safari jeep in Masai Mara"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <a
              href="#tours"
              className="absolute bottom-6 right-6 bg-safari-500 hover:bg-safari-600 text-white font-inter font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg"
            >
              {t.services.seeAll}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Services list */}
          <div>
            {services.map((svc, i) => (
              <div
                key={i}
                className={`flex gap-4 p-6 rounded-2xl transition-all hover:bg-white hover:shadow-card cursor-default ${
                  i < services.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="w-10 h-10 bg-safari-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  {svc.icon}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-gray-900 text-base mb-1.5">{svc.title}</h3>
                  <p className="font-inter text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
