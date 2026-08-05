'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Plus, Minus, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { useLanguage } from '@/contexts/LanguageContext';
import { safaris } from '@/lib/tours-data';
import { prefersReducedMotion } from '@/lib/video-config';

interface BookingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onBook: (data: BookingData) => void;
}

interface BookingData {
  destination: string;
  adults: number;
  children: number;
  childrenAges: number[];
  arrivalDate: string;
  departureDate: string;
}

interface Child {
  id: string;
  age: number;
}

const destinations = [
  { value: 'maasai-mara', label: 'Maasai Mara Safari' },
  { value: 'amboseli', label: 'Amboseli Safari' },
  { value: 'tsavo', label: 'Tsavo Safari' },
  { value: 'samburu', label: 'Samburu Safari' },
  { value: 'wildlife', label: 'Wildlife Experience' },
  { value: 'beach-safari', label: 'Beach & Safari' },
  { value: 'lodge', label: 'Luxury Lodge Stay' },
  { value: 'custom', label: 'Custom Safari' },
];

const childAges = Array.from({ length: 16 }, (_, i) => i + 1); // 1-16 years

export default function BookingOverlay({
  isOpen,
  onClose,
  onBook,
}: BookingOverlayProps) {
  const { t } = useLanguage();
  const overlayRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [destination, setDestination] = useState('');
  const [showDestinationMenu, setShowDestinationMenu] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (!formRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  // Handle children count change
  useEffect(() => {
    const newList = childrenList.slice(0, children);
    while (newList.length < children) {
      newList.push({
        id: `child-${Date.now()}-${newList.length}`,
        age: 5,
      });
    }
    setChildrenList(newList);
  }, [children]);

  const handleAddChild = () => {
    setChildren(c => c + 1);
  };

  const handleRemoveChild = () => {
    if (children > 0) {
      setChildren(c => c - 1);
    }
  };

  const updateChildAge = (id: string, age: number) => {
    setChildrenList(list =>
      list.map(child =>
        child.id === id ? { ...child, age } : child
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!destination || !arrivalDate || !departureDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const bookingData: BookingData = {
      destination,
      adults,
      children,
      childrenAges: childrenList.map(c => c.age),
      arrivalDate,
      departureDate,
    };

    // Call onBook
    onBook(bookingData);

    // Close after brief delay
    setTimeout(() => {
      onClose();
      setIsSubmitting(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={formRef}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-sand-100 px-6 sm:px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-gray-900">
              Plan Your Safari
            </h2>
            <p className="font-inter text-sm text-gray-600 mt-1">
              Tell us about your dream African adventure
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sand-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Where? */}
          <div>
            <label className="block font-poppins font-bold text-lg text-gray-900 mb-2">
              WHERE
            </label>
            <p className="font-inter text-sm text-gray-600 mb-4">
              Choose your destination or experience
            </p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDestinationMenu(!showDestinationMenu)}
                className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl font-inter text-gray-800 font-medium flex items-center justify-between hover:border-safari-400 transition-colors"
              >
                <span>{destination || 'Select destination'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDestinationMenu ? 'rotate-180' : ''}`} />
              </button>

              {showDestinationMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-sand-200 rounded-xl shadow-lg overflow-y-auto max-h-64 z-10">
                  {destinations.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => {
                        setDestination(d.label);
                        setShowDestinationMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-sand-50 font-inter text-gray-800 transition-colors border-b border-sand-100 last:border-0"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* How many people & Kids */}
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Adults & Children */}
            <div>
              <label className="block font-poppins font-bold text-lg text-gray-900 mb-2">
                HOW MANY PEOPLE
              </label>
              <p className="font-inter text-sm text-gray-600 mb-4">
                Number of participants
              </p>
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between bg-sand-50 rounded-xl p-4 border border-sand-200">
                  <span className="font-inter font-medium text-gray-800">Adults</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(a => Math.max(1, a - 1))}
                      className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-inter font-bold text-lg text-gray-900 w-8 text-center">
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdults(a => a + 1)}
                      className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between bg-sand-50 rounded-xl p-4 border border-sand-200">
                  <span className="font-inter font-medium text-gray-800">Children</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRemoveChild}
                      className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="font-inter font-bold text-lg text-gray-900 w-8 text-center">
                      {children}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddChild}
                      className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Kids Ages */}
            {children > 0 && (
              <div>
                <label className="block font-poppins font-bold text-lg text-gray-900 mb-2">
                  KIDS
                </label>
                <p className="font-inter text-sm text-gray-600 mb-4">
                  Ages of children
                </p>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {childrenList.map((child, idx) => (
                    <div key={child.id} className="flex items-center gap-3">
                      <span className="font-inter text-sm font-medium text-gray-700 w-16">
                        Child {idx + 1}:
                      </span>
                      <select
                        value={child.age}
                        onChange={e =>
                          updateChildAge(child.id, parseInt(e.target.value))
                        }
                        className="flex-1 px-3 py-2 bg-sand-50 border border-sand-200 rounded-lg font-inter text-sm text-gray-800 focus:border-safari-400 focus:outline-none"
                      >
                        {childAges.map(age => (
                          <option key={age} value={age}>
                            {age} year{age !== 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <label className="block font-poppins font-bold text-lg text-gray-900 mb-2">
                WHEN
              </label>
              <p className="font-inter text-sm text-gray-600 mb-4">
                Arrival date
              </p>
              <div className="relative">
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={e => setArrivalDate(e.target.value)}
                  className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl font-inter text-gray-800 font-medium focus:border-safari-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-poppins font-bold text-lg text-gray-900 mb-2">
                DEPARTURE
              </label>
              <p className="font-inter text-sm text-gray-600 mb-4">
                Departure date
              </p>
              <div className="relative">
                <input
                  type="date"
                  value={departureDate}
                  onChange={e => setDepartureDate(e.target.value)}
                  className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl font-inter text-gray-800 font-medium focus:border-safari-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-sand-100 hover:bg-sand-200 text-gray-900 font-poppins font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-safari-500 hover:bg-safari-600 disabled:opacity-75 text-white font-poppins font-bold rounded-xl transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'INQUIRE NOW'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
