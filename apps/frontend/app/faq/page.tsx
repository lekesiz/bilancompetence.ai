'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const FaqPage = () => {
  const t = useTranslations('faq');
  const locale = useLocale();
  const localePrefix = locale === 'fr' ? '' : `/${locale}`;

  // Build FAQ data from translations
  const faqData: FAQItem[] = useMemo(() => {
    const categories = ['generalites', 'deroulement', 'financement', 'resultats', 'pratique'] as const;
    const categoryNames: Record<string, string> = {
      generalites: t('categories.generalites'),
      deroulement: t('categories.deroulement'),
      financement: t('categories.financement'),
      resultats: t('categories.resultats'),
      pratique: t('categories.pratique'),
    };

    const allItems: FAQItem[] = [];
    categories.forEach((categoryKey) => {
      const questions = t.raw(`questions.${categoryKey}`) as Array<{ question: string; answer: string }>;
      if (Array.isArray(questions)) {
        questions.forEach((item) => {
          allItems.push({
            category: categoryNames[categoryKey],
            question: item.question,
            answer: item.answer,
          });
        });
      }
    });
    return allItems;
  }, [t]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const allCategoriesText = t('allCategories');
  const [selectedCategory, setSelectedCategory] = useState<string>(allCategoriesText);

  const categories = useMemo(() => {
    return [allCategoriesText, ...Array.from(new Set(faqData.map(item => item.category)))];
  }, [faqData, allCategoriesText]);
  
  const filteredFAQ = selectedCategory === allCategoriesText 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">{t('title')}</h1>
          <p className="text-xl opacity-90">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-textPrimary hover:bg-gray-50 shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between"
              >
                <div className="flex items-start flex-1">
                  <span className="text-primary font-bold text-xl mr-4">Q</span>
                  <span className="font-semibold text-textPrimary text-lg pr-4">
                    {item.question}
                  </span>
                </div>
                <svg
                  className={`w-6 h-6 text-primary transition-transform flex-shrink-0 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="flex items-start border-t pt-4">
                    <span className="text-success-600 font-bold text-xl mr-4">R</span>
                    <p className="text-textSecondary leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 bg-gradient-to-r from-primary to-blue-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t('stillHaveQuestions')}</h2>
          <p className="text-xl mb-8 opacity-90">
            {t('teamHere')}
          </p>
          <Link 
            href={`${localePrefix}/contact`}
            className="inline-block bg-white dark:bg-gray-800 text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {t('contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;

