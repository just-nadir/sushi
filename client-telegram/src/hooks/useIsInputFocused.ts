import { useState, useEffect } from 'react';

export function useIsInputFocused() {
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                setIsFocused(true);
            }
        };

        const handleBlur = () => {
            // Delay slightly to check if moved to another input
            setTimeout(() => {
                const active = document.activeElement as HTMLElement;
                if (active?.tagName !== 'INPUT' && active?.tagName !== 'TEXTAREA') {
                    setIsFocused(false);
                }
            }, 50);
        };

        window.addEventListener('focusin', handleFocus);
        window.addEventListener('focusout', handleBlur);

        return () => {
            window.removeEventListener('focusin', handleFocus);
            window.removeEventListener('focusout', handleBlur);
        };
    }, []);

    return isFocused;
}
