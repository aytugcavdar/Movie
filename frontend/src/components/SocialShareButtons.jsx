
import React from 'react';
import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon
} from 'react-share'; // Bu kütüphaneyi projenize eklemeniz gerekecek.

const SocialShareButtons = ({ shareUrl, title }) => {


    return (
        <div className="flex items-center gap-2">
            <span className="font-semibold text-sm mr-2">Paylaş:</span>
            <FacebookShareButton url={shareUrl} quote={title}>
                <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl} title={title}>
                <TwitterIcon size={32} round />
            </TwitterShareButton>
            <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
                <WhatsappIcon size={32} round />
            </WhatsappShareButton>
        </div>
    );
};

export default SocialShareButtons;