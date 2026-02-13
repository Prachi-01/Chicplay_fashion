import React, { useState, useEffect, useRef } from 'react';
import { Search, Palette, Plus } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const ColorAutocomplete = ({ value, onChange, onSelect, placeholder = "Type color name..." }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedHex, setSelectedHex] = useState(value || '#000000');
    const dropdownRef = useRef(null);

    // Fetch suggestions when typing
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (inputValue.length < 2) {
                // Show common colors when no input
                try {
                    const response = await api.get('/colors/autocomplete');
                    setSuggestions(response.data);
                } catch (error) {
                    console.error('Failed to fetch common colors:', error);
                }
                return;
            }

            try {
                const response = await api.get(`/colors/autocomplete?q=${inputValue}`);
                setSuggestions(response.data);
            } catch (error) {
                console.error('Autocomplete failed:', error);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 200);
        return () => clearTimeout(debounce);
    }, [inputValue]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectColor = (color) => {
        setInputValue(color.name);
        setSelectedHex(color.hexCode);
        onChange(color.hexCode);
        if (onSelect) {
            onSelect(color); // Pass complete color object
        }
        setShowSuggestions(false);
        toast.success(`Selected ${color.name} (${color.hexCode})`);
    };

    const handleManualHexChange = (hex) => {
        setSelectedHex(hex);
        onChange(hex);
    };

    return (
        <div className="space-y-3" ref={dropdownRef}>
            {/* Color Name Autocomplete */}
            <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                    Color Name
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-medium text-gray-800"
                    />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-100 max-h-80 overflow-y-auto">
                        <div className="p-2 space-y-1">
                            {suggestions.map((color) => (
                                <button
                                    key={color._id}
                                    type="button"
                                    onClick={() => handleSelectColor(color)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-pink-50 transition-all group"
                                >
                                    {/* Color Preview */}
                                    <div
                                        className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm"
                                        style={{ backgroundColor: color.hexCode }}
                                    />

                                    {/* Color Info */}
                                    <div className="flex-1 text-left">
                                        <div className="font-bold text-gray-800 capitalize">
                                            {color.name}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            {color.hexCode}
                                        </div>
                                    </div>

                                    {/* Category Badge */}
                                    <div className="px-2 py-1 bg-gray-100 group-hover:bg-pink-100 rounded-md text-[10px] font-bold text-gray-600 uppercase">
                                        {color.category}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Hex Code Input */}
            <div className="flex gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
                        Or Enter Hex Code
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={selectedHex}
                            onChange={(e) => handleManualHexChange(e.target.value)}
                            className="w-14 h-12 rounded-xl cursor-pointer border-2 border-gray-200 p-1"
                        />
                        <input
                            type="text"
                            value={selectedHex}
                            onChange={(e) => handleManualHexChange(e.target.value)}
                            placeholder="#000000"
                            pattern="^#[0-9A-Fa-f]{6}$"
                            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none font-mono font-bold text-gray-800"
                        />
                    </div>
                </div>
                {inputValue && selectedHex && (
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                const response = await api.post('/colors', {
                                    name: inputValue.trim().toLowerCase(),
                                    hexCode: selectedHex.toUpperCase(),
                                    category: 'other', // Must be a valid enum value from Color model
                                    isCommon: true
                                });
                                toast.success(`Color "${response.data.name}" added to database!`);
                                // Refresh suggestions
                                setSuggestions(prev => [response.data, ...prev]);
                            } catch (error) {
                                console.error('Color creation failed:', error);
                                toast.error(error.response?.data?.message || "Failed to save color");
                            }
                        }}
                        className="px-4 h-12 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition flex items-center gap-2 whitespace-nowrap"
                        title="Save this color to database for future use"
                    >
                        <Plus size={14} />
                        Save Color
                    </button>
                )}
            </div>

            {/* Current Color Preview */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl border-2 border-pink-100">
                <Palette className="w-5 h-5 text-pink-500" />
                <div className="flex-1">
                    <div className="text-[10px] font-black text-gray-400 uppercase">Selected Color</div>
                    <div className="font-bold text-gray-800">{inputValue || 'No color selected'}</div>
                </div>
                <div
                    className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
                    style={{ backgroundColor: selectedHex }}
                />
            </div>
        </div>
    );
};

export default ColorAutocomplete;
