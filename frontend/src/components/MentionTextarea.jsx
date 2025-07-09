

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MentionTextarea = ({ value, onChange, placeholder }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [mentionQuery, setMentionQuery] = useState('');

    useEffect(() => {
        
        const currentText = value || '';
        const lastWord = currentText.split(' ').pop();

        if (lastWord.startsWith('@') && lastWord.length > 1) {
            setMentionQuery(lastWord.substring(1));
        } else {
            setSuggestions([]);
        }
    }, [value]);

    useEffect(() => {
        if (mentionQuery) {
            const fetchUsers = async () => {
                try {
                    
                    const response = await axios.get(`http://localhost:4000/api/v1/users/search?q=${mentionQuery}`, { withCredentials: true });
                    setSuggestions(response.data.data);
                } catch (error) {
                    console.error("Kullanıcılar aranırken hata oluştu:", error);
                    setSuggestions([]); 
                }
            };
            
            const debounceTimeout = setTimeout(() => {
                fetchUsers();
            }, 300);

            return () => clearTimeout(debounceTimeout);
        } else {
            setSuggestions([]);
        }
    }, [mentionQuery]);

    const handleSuggestionClick = (username) => {
        const words = (value || '').split(' ');
        words.pop(); // Yazılmakta olan @mention'ı kaldır
        const newValue = (words.join(' ') + ` @${username} `).trim() + ' ';
        onChange(newValue);
        setSuggestions([]);
        setMentionQuery('');
    };

    return (
        <div className="relative">
            <textarea
                value={value || ''} // value tanımsızsa boş string kullan
                onChange={(e) => onChange(e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder={placeholder}
            />
            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-base-200 border border-base-300 rounded-box shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {suggestions.map(user => (
                        <li key={user._id} onMouseDown={() => handleSuggestionClick(user.username)}
                            className="p-2 hover:bg-primary hover:text-primary-content cursor-pointer flex items-center gap-2"
                        >
                            <div className="avatar">
                                <div className="w-8 rounded-full">
                                    <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.username}`} alt={user.username} />
                                </div>
                            </div>
                            <span>{user.username}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MentionTextarea;