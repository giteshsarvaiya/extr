import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SectionList,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, X, RotateCcw, Check, DollarSign, TrendingUp } from 'lucide-react-native';

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate?: string;
  popular: boolean;
  region: string;
}

interface CurrencySelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedValue: string;
  onSelect: (value: string, symbol: string) => void;
}

interface SectionData {
  title: string;
  data: CurrencyOption[];
}

// Popular currencies list
const POPULAR_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'
];

// Comprehensive currency database
const ALL_CURRENCIES: CurrencyOption[] = [
  // Major Currencies
  { code: 'USD', name: 'United States Dollar', symbol: '$', flag: '🇺🇸', exchangeRate: '1.00', popular: true, region: 'North America' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', exchangeRate: '0.85', popular: true, region: 'Europe' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£', flag: '🇬🇧', exchangeRate: '0.73', popular: true, region: 'Europe' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', exchangeRate: '110.25', popular: true, region: 'Asia' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', exchangeRate: '1.25', popular: true, region: 'North America' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', exchangeRate: '1.35', popular: true, region: 'Oceania' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', exchangeRate: '0.92', popular: true, region: 'Europe' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', exchangeRate: '6.45', popular: true, region: 'Asia' },
  
  // Asia Pacific
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', exchangeRate: '74.50', popular: false, region: 'Asia' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', exchangeRate: '1180.00', popular: false, region: 'Asia' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', exchangeRate: '1.35', popular: false, region: 'Asia' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', exchangeRate: '7.80', popular: false, region: 'Asia' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', exchangeRate: '33.15', popular: false, region: 'Asia' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', exchangeRate: '4.15', popular: false, region: 'Asia' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', exchangeRate: '14250.00', popular: false, region: 'Asia' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', exchangeRate: '50.75', popular: false, region: 'Asia' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', exchangeRate: '23050.00', popular: false, region: 'Asia' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼', exchangeRate: '27.85', popular: false, region: 'Asia' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', exchangeRate: '175.00', popular: false, region: 'Asia' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩', exchangeRate: '85.50', popular: false, region: 'Asia' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', flag: '🇱🇰', exchangeRate: '200.00', popular: false, region: 'Asia' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', flag: '🇳🇵', exchangeRate: '119.20', popular: false, region: 'Asia' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲', exchangeRate: '1850.00', popular: false, region: 'Asia' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: '🇰🇭', exchangeRate: '4080.00', popular: false, region: 'Asia' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: '🇱🇦', exchangeRate: '10500.00', popular: false, region: 'Asia' },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', flag: '🇧🇳', exchangeRate: '1.35', popular: false, region: 'Asia' },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', flag: '🇲🇴', exchangeRate: '8.05', popular: false, region: 'Asia' },
  
  // Europe
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', exchangeRate: '8.60', popular: false, region: 'Europe' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', exchangeRate: '8.75', popular: false, region: 'Europe' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', exchangeRate: '6.35', popular: false, region: 'Europe' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', exchangeRate: '3.85', popular: false, region: 'Europe' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', exchangeRate: '21.50', popular: false, region: 'Europe' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', exchangeRate: '295.00', popular: false, region: 'Europe' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', exchangeRate: '73.50', popular: false, region: 'Europe' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦', exchangeRate: '27.50', popular: false, region: 'Europe' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴', exchangeRate: '4.25', popular: false, region: 'Europe' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬', exchangeRate: '1.66', popular: false, region: 'Europe' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷', exchangeRate: '6.40', popular: false, region: 'Europe' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', flag: '🇷🇸', exchangeRate: '100.00', popular: false, region: 'Europe' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', flag: '🇮🇸', exchangeRate: '125.00', popular: false, region: 'Europe' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', exchangeRate: '8.45', popular: false, region: 'Europe' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', flag: '🇧🇦', exchangeRate: '1.66', popular: false, region: 'Europe' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', flag: '🇲🇰', exchangeRate: '52.50', popular: false, region: 'Europe' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', flag: '🇦🇱', exchangeRate: '103.00', popular: false, region: 'Europe' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', flag: '🇲🇩', exchangeRate: '17.80', popular: false, region: 'Europe' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', flag: '🇧🇾', exchangeRate: '2.55', popular: false, region: 'Europe' },
  
  // North America
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', exchangeRate: '20.15', popular: false, region: 'North America' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', flag: '🇬🇹', exchangeRate: '7.75', popular: false, region: 'North America' },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', flag: '🇧🇿', exchangeRate: '2.00', popular: false, region: 'North America' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', flag: '🇨🇷', exchangeRate: '630.00', popular: false, region: 'North America' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', flag: '🇭🇳', exchangeRate: '24.50', popular: false, region: 'North America' },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', flag: '🇳🇮', exchangeRate: '35.50', popular: false, region: 'North America' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', flag: '🇵🇦', exchangeRate: '1.00', popular: false, region: 'North America' },
  { code: 'SVC', name: 'Salvadoran Colón', symbol: '₡', flag: '🇸🇻', exchangeRate: '8.75', popular: false, region: 'North America' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', flag: '🇯🇲', exchangeRate: '150.00', popular: false, region: 'North America' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$', flag: '🇹🇹', exchangeRate: '6.80', popular: false, region: 'North America' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', flag: '🇧🇧', exchangeRate: '2.00', popular: false, region: 'North America' },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', flag: '🇧🇸', exchangeRate: '1.00', popular: false, region: 'North America' },
  { code: 'BMD', name: 'Bermudian Dollar', symbol: 'BD$', flag: '🇧🇲', exchangeRate: '1.00', popular: false, region: 'North America' },
  { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$', flag: '🇰🇾', exchangeRate: '0.83', popular: false, region: 'North America' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', flag: '🏴', exchangeRate: '2.70', popular: false, region: 'North America' },
  
  // South America
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', exchangeRate: '5.20', popular: false, region: 'South America' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷', exchangeRate: '98.50', popular: false, region: 'South America' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱', exchangeRate: '795.00', popular: false, region: 'South America' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴', exchangeRate: '3850.00', popular: false, region: 'South America' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪', exchangeRate: '3.65', popular: false, region: 'South America' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', flag: '🇺🇾', exchangeRate: '43.50', popular: false, region: 'South America' },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', flag: '🇵🇾', exchangeRate: '6950.00', popular: false, region: 'South America' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', flag: '🇧🇴', exchangeRate: '6.90', popular: false, region: 'South America' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S', flag: '🇻🇪', exchangeRate: '4200000.00', popular: false, region: 'South America' },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: 'GY$', flag: '🇬🇾', exchangeRate: '209.00', popular: false, region: 'South America' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: 'Sr$', flag: '🇸🇷', exchangeRate: '14.25', popular: false, region: 'South America' },
  { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£', flag: '🇫🇰', exchangeRate: '0.73', popular: false, region: 'South America' },
  
  // Africa
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', exchangeRate: '14.75', popular: false, region: 'Africa' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', flag: '🇪🇬', exchangeRate: '15.70', popular: false, region: 'Africa' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', exchangeRate: '411.00', popular: false, region: 'Africa' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪', exchangeRate: '108.50', popular: false, region: 'Africa' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭', exchangeRate: '6.15', popular: false, region: 'Africa' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD', flag: '🇲🇦', exchangeRate: '9.05', popular: false, region: 'Africa' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', flag: '🇹🇳', exchangeRate: '2.80', popular: false, region: 'Africa' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', flag: '🇩🇿', exchangeRate: '135.00', popular: false, region: 'Africa' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', flag: '🇱🇾', exchangeRate: '4.50', popular: false, region: 'Africa' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹', exchangeRate: '47.50', popular: false, region: 'Africa' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬', exchangeRate: '3550.00', popular: false, region: 'Africa' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿', exchangeRate: '2310.00', popular: false, region: 'Africa' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼', exchangeRate: '1025.00', popular: false, region: 'Africa' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', flag: '🇧🇮', exchangeRate: '1980.00', popular: false, region: 'Africa' },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', flag: '🇩🇯', exchangeRate: '178.00', popular: false, region: 'Africa' },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', flag: '🇪🇷', exchangeRate: '15.00', popular: false, region: 'Africa' },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh.So.', flag: '🇸🇴', exchangeRate: '580.00', popular: false, region: 'Africa' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: '£', flag: '🇸🇩', exchangeRate: '445.00', popular: false, region: 'Africa' },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', flag: '🇸🇸', exchangeRate: '130.00', popular: false, region: 'Africa' },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', flag: '🇨🇩', exchangeRate: '2000.00', popular: false, region: 'Africa' },
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', flag: '🇦🇴', exchangeRate: '650.00', popular: false, region: 'Africa' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲', exchangeRate: '17.50', popular: false, region: 'Africa' },
  { code: 'BWP', name: 'Botswanan Pula', symbol: 'P', flag: '🇧🇼', exchangeRate: '11.25', popular: false, region: 'Africa' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', flag: '🇳🇦', exchangeRate: '14.75', popular: false, region: 'Africa' },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L', flag: '🇸🇿', exchangeRate: '14.75', popular: false, region: 'Africa' },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', flag: '🇱🇸', exchangeRate: '14.75', popular: false, region: 'Africa' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', flag: '🇲🇼', exchangeRate: '815.00', popular: false, region: 'Africa' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿', exchangeRate: '63.50', popular: false, region: 'Africa' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', flag: '🇲🇬', exchangeRate: '4050.00', popular: false, region: 'Africa' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', flag: '🇲🇺', exchangeRate: '43.50', popular: false, region: 'Africa' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', flag: '🇸🇨', exchangeRate: '13.50', popular: false, region: 'Africa' },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', flag: '🇰🇲', exchangeRate: '418.00', popular: false, region: 'Africa' },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$', flag: '🇨🇻', exchangeRate: '93.50', popular: false, region: 'Africa' },
  { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db', flag: '🇸🇹', exchangeRate: '20.80', popular: false, region: 'Africa' },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', flag: '🇬🇲', exchangeRate: '52.50', popular: false, region: 'Africa' },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', flag: '🇬🇳', exchangeRate: '8650.00', popular: false, region: 'Africa' },
  { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le', flag: '🇸🇱', exchangeRate: '11500.00', popular: false, region: 'Africa' },
  { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', flag: '🇱🇷', exchangeRate: '153.00', popular: false, region: 'Africa' },
  { code: 'CIV', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇨🇮', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'BFA', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇧🇫', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'MLI', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇲🇱', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'NER', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇳🇪', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'SEN', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇸🇳', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'TGO', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇹🇬', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'BEN', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇧🇯', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'GNB', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇬🇼', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'CMR', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇲', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'CAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇫', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'TCD', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇹🇩', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'COG', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇬', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'GNQ', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇬🇶', exchangeRate: '558.00', popular: false, region: 'Africa' },
  { code: 'GAB', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇬🇦', exchangeRate: '558.00', popular: false, region: 'Africa' },
  
  // Middle East
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', exchangeRate: '3.67', popular: false, region: 'Middle East' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', exchangeRate: '3.75', popular: false, region: 'Middle East' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦', exchangeRate: '3.64', popular: false, region: 'Middle East' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', exchangeRate: '0.30', popular: false, region: 'Middle East' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭', exchangeRate: '0.38', popular: false, region: 'Middle East' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', flag: '🇴🇲', exchangeRate: '0.38', popular: false, region: 'Middle East' },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱', exchangeRate: '3.25', popular: false, region: 'Middle East' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', flag: '🇯🇴', exchangeRate: '0.71', popular: false, region: 'Middle East' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: '£', flag: '🇱🇧', exchangeRate: '1515.00', popular: false, region: 'Middle East' },
  { code: 'SYP', name: 'Syrian Pound', symbol: '£', flag: '🇸🇾', exchangeRate: '2512.00', popular: false, region: 'Middle East' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', flag: '🇮🇶', exchangeRate: '1460.00', popular: false, region: 'Middle East' },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', flag: '🇮🇷', exchangeRate: '42000.00', popular: false, region: 'Middle East' },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', flag: '🇦🇫', exchangeRate: '88.50', popular: false, region: 'Middle East' },
  { code: 'YER', name: 'Yemeni Rial', symbol: '﷼', flag: '🇾🇪', exchangeRate: '250.00', popular: false, region: 'Middle East' },
  
  // Oceania
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', exchangeRate: '1.42', popular: false, region: 'Oceania' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', flag: '🇫🇯', exchangeRate: '2.10', popular: false, region: 'Oceania' },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', flag: '🇵🇬', exchangeRate: '3.52', popular: false, region: 'Oceania' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', flag: '🇸🇧', exchangeRate: '8.05', popular: false, region: 'Oceania' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', flag: '🇻🇺', exchangeRate: '112.00', popular: false, region: 'Oceania' },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', flag: '🇼🇸', exchangeRate: '2.58', popular: false, region: 'Oceania' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', flag: '🇹🇴', exchangeRate: '2.28', popular: false, region: 'Oceania' },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣', flag: '🇵🇫', exchangeRate: '101.50', popular: false, region: 'Oceania' },
  
  // Special/Crypto
  { code: 'XAU', name: 'Gold (troy ounce)', symbol: 'Au', flag: '🥇', exchangeRate: '1800.00', popular: false, region: 'Commodities' },
  { code: 'XAG', name: 'Silver (troy ounce)', symbol: 'Ag', flag: '🥈', exchangeRate: '24.50', popular: false, region: 'Commodities' },
  { code: 'XPT', name: 'Platinum (troy ounce)', symbol: 'Pt', flag: '⚪', exchangeRate: '950.00', popular: false, region: 'Commodities' },
  { code: 'XPD', name: 'Palladium (troy ounce)', symbol: 'Pd', flag: '⚫', exchangeRate: '2100.00', popular: false, region: 'Commodities' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '₿', exchangeRate: '45000.00', popular: false, region: 'Cryptocurrency' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: 'Ξ', exchangeRate: '3200.00', popular: false, region: 'Cryptocurrency' },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function CurrencySelector({ 
  visible, 
  onClose, 
  selectedValue, 
  onSelect 
}: CurrencySelectorProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update exchange rates (simulated - in real app, fetch from API)
  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [visible]);

  // Filter and group currencies
  const sectionData = useMemo((): SectionData[] => {
    let filteredCurrencies = ALL_CURRENCIES;
    
    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filteredCurrencies = ALL_CURRENCIES.filter(currency => 
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query) ||
        currency.symbol.toLowerCase().includes(query) ||
        currency.region.toLowerCase().includes(query)
      );
    }

    // Group by popular and region
    const popular = filteredCurrencies.filter(c => c.popular);
    const byRegion: { [key: string]: CurrencyOption[] } = {};
    
    filteredCurrencies.filter(c => !c.popular).forEach(currency => {
      if (!byRegion[currency.region]) {
        byRegion[currency.region] = [];
      }
      byRegion[currency.region].push(currency);
    });

    // Sort regions alphabetically
    const sortedRegions = Object.keys(byRegion).sort();

    // Build sections
    const sections: SectionData[] = [];
    
    if (popular.length > 0) {
      sections.push({
        title: 'MOST USED',
        data: popular
      });
    }

    sortedRegions.forEach(region => {
      if (byRegion[region].length > 0) {
        sections.push({
          title: region.toUpperCase(),
          data: byRegion[region].sort((a, b) => a.name.localeCompare(b.name))
        });
      }
    });

    return sections;
  }, [debouncedSearchQuery]);

  const handleSelect = useCallback((code: string, symbol: string) => {
    onSelect(code, symbol);
    onClose();
  }, [onSelect, onClose]);

  const handleReset = useCallback(() => {
    onSelect('USD', '$');
    onClose();
  }, [onSelect, onClose]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const renderCurrencyItem = useCallback(({ item }: { item: CurrencyOption }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        { borderBottomColor: colors.border },
        selectedValue === item.code && { backgroundColor: colors.primary + '10' }
      ]}
      onPress={() => handleSelect(item.code, item.symbol)}
      activeOpacity={0.7}
    >
      <View style={styles.currencyContent}>
        <View style={styles.currencyMain}>
          <Text style={styles.currencyFlag}>{item.flag}</Text>
          <View style={styles.currencyInfo}>
            <View style={styles.currencyHeader}>
              <Text style={[styles.currencyCode, { color: colors.text }]}>
                {item.code}
              </Text>
              <Text style={[styles.currencySymbol, { color: colors.primary }]}>
                {item.symbol}
              </Text>
            </View>
            <Text style={[styles.currencyName, { color: colors.textSecondary }]}>
              {item.name}
            </Text>
          </View>
        </View>
      </View>
      {selectedValue === item.code && (
        <Check size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  ), [colors, selectedValue, handleSelect]);

  const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
      <Text style={[styles.groupHeader, { color: colors.textSecondary }]}>
        {section.title}
      </Text>
    </View>
  ), [colors]);

  const keyExtractor = useCallback((item: CurrencyOption) => item.code, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 80, // Height of each item
    offset: 80 * index,
    index,
  }), []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <View style={styles.modalOverlay}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <DollarSign size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Select Currency</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={handleReset} 
                style={styles.resetButton}
                activeOpacity={0.7}
              >
                <RotateCcw size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search currency or country"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={clearSearch} 
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading currencies...
              </Text>
            </View>
          )}

          {/* Currency List */}
          {!isLoading && (
            <SectionList
              sections={sectionData}
              renderItem={renderCurrencyItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              stickySectionHeadersEnabled={true}
              style={styles.listContainer}
              contentContainerStyle={styles.listContent}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              removeClippedSubviews={true}
            />
          )}

        
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 50 : 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    minHeight: 24,
  },
  clearButton: {
    padding: 4,
    borderRadius: 4,
    minWidth: 24,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 16,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  groupHeader: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 1.2,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
    minHeight: 80,
  },
  currencyContent: {
    flex: 1,
  },
  currencyMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  currencyName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  exchangeRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exchangeRate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});