

import React from 'react';
import { Link } from 'react-router-dom';

export const renderMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
        if (index % 2 === 1) { 
            return (
                <Link key={index} to={`/users/${part}`} className="text-primary font-bold hover:underline">
                    @{part}
                </Link>
            );
        } else { // Normal metin
            return part;
        }
    });
};