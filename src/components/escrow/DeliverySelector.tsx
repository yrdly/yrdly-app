"use client";

import React, { useState } from 'react';
import { DeliveryOption, DeliveryDetails } from '@/types/escrow';

interface DeliverySelectorProps {
  selectedOption: DeliveryOption;
  onOptionChange: (option: DeliveryOption) => void;
  deliveryDetails: DeliveryDetails;
  onDetailsChange: (details: Partial<DeliveryDetails>) => void;
}

export function DeliverySelector({
  selectedOption,
  onOptionChange,
  deliveryDetails,
  onDetailsChange
}: DeliverySelectorProps) {
  const deliveryOptions = [
    {
      value: DeliveryOption.FACE_TO_FACE,
      label: 'Face-to-Face Meetup',
      description: 'Arrange a meeting point with the seller',
      icon: '🤝',
    },
    {
      value: DeliveryOption.SELLER_DELIVERY,
      label: 'Seller Delivery',
      description: 'Seller will arrange delivery (discuss details in chat)',
      icon: '🚚',
    }
  ];

  const handleOptionChange = (option: DeliveryOption) => {
    onOptionChange(option);
    // Reset details when changing option
    onDetailsChange({
      option,
      notes: ''
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Delivery Method</h3>

      <div className="space-y-3">
        {deliveryOptions.map((option) => (
          <div
            key={option.value}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedOption === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => handleOptionChange(option.value)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{option.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">{option.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedOption === option.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selectedOption === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notes field */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={deliveryDetails.notes || ''}
          onChange={(e) => onDetailsChange({ notes: e.target.value })}
          placeholder="Any special instructions or notes"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Info message */}
      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 dark:text-blue-400 text-sm">💬</div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Important:</strong> Discuss delivery details with the seller via chat after payment. 
            The app only records your preferred method - actual coordination happens between you and the seller.
          </p>
        </div>
      </div>
    </div>
  );
}
