import { useEffect, useState } from "react";

export const useModalBehavior = (initialState = false) => {
    const [isOpen, setIsOpen] = useState(initialState);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                close();
            }
        };

        document.body.style.overflow = "hidden";

        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);

    return {
        isOpen,
        open,
        close,
    };
};
