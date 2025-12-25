'use client';

import { useState } from 'react';

interface ContactFormProps {
  productName: string;
  catalogNr: string;
  selectedColor?: string | null;
  selectedSize?: string | null;
}

export default function ContactForm({
  productName,
  catalogNr,
  selectedColor,
  selectedSize
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    quantity: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build the subject with product details and selected variants
    const variantDetails = [];
    if (selectedColor) variantDetails.push(`Kolor: ${selectedColor}`);
    if (selectedSize) variantDetails.push(`Rozmiar: ${selectedSize}`);

    const subject = `Zapytanie o ${productName} (${catalogNr})${
      variantDetails.length > 0 ? ' - ' + variantDetails.join(', ') : ''
    }`;

    // W rzeczywistej aplikacji tutaj byłoby wysłanie danych do API
    console.log('Form submitted:', {
      ...formData,
      subject,
      productName,
      catalogNr,
      selectedColor,
      selectedSize,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        quantity: '',
      });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Dziękujemy za kontakt!
        </h3>
        <p className="text-green-700">
          Wkrótce skontaktujemy się z Tobą w sprawie oferty.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Zapytaj o produkt</h3>
      <p className="text-gray-600 mb-4">
        Wypełnij formularz, a nasz zespół skontaktuje się z Tobą z ofertą.
      </p>

      {/* Display selected product and variants */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="text-sm">
          <div className="font-semibold text-gray-800 mb-1">
            {productName} <span className="text-gray-500">({catalogNr})</span>
          </div>
          {(selectedColor || selectedSize) && (
            <div className="text-gray-700 text-xs">
              {selectedColor && <span>Kolor: <strong>{selectedColor}</strong></span>}
              {selectedColor && selectedSize && <span> • </span>}
              {selectedSize && <span>Rozmiar: <strong>{selectedSize}</strong></span>}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Imię i nazwisko *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium mb-1">
            Ilość (szt.)
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">
            Wiadomość
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder="Dodatkowe informacje o zamówieniu..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          Wyślij zapytanie
        </button>
      </form>
    </div>
  );
}
