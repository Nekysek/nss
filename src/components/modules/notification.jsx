import { useEffect } from 'react';

function Notification({ message, isVisible, onClose }) {
    useEffect(() => {
        const handleClickOutside = (event) => {
            const NotificationElement = document.getElementById('Notification');
            if (NotificationElement && !NotificationElement.contains(event.target)) {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div id="Notification" className="fixed top-10 right-10 bg-white text-black border shadow-lg p-4 rounded-md z-50">
            <div className="flex justify-between items-center">
                <span>{message}</span>
                <button onClick={onClose} className="text-black">✖</button>
            </div>
        </div>
    );
}

export default Notification;