import { useCallback, useEffect, useRef, useState } from "react";
const DEFAULT_TOAST_DURATION_MS = 3600;
const createToastId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const useToast = () => {
    const [toasts, setToasts] = useState([]);
    const timeoutMapRef = useRef(new Map());
    const removeToast = useCallback((id) => {
        setToasts((previousToasts) => previousToasts.filter((toast) => toast.id !== id));
        const timeoutId = timeoutMapRef.current.get(id);
        if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId);
            timeoutMapRef.current.delete(id);
        }
    }, []);
    const pushToast = useCallback((input) => {
        const id = createToastId();
        const toast = {
            id,
            durationMs: DEFAULT_TOAST_DURATION_MS,
            ...input
        };
        setToasts((previousToasts) => [...previousToasts, toast]);
        const timeoutId = window.setTimeout(() => {
            removeToast(id);
        }, toast.durationMs ?? DEFAULT_TOAST_DURATION_MS);
        timeoutMapRef.current.set(id, timeoutId);
        return id;
    }, [removeToast]);
    useEffect(() => () => {
        timeoutMapRef.current.forEach((timeoutId) => {
            window.clearTimeout(timeoutId);
        });
        timeoutMapRef.current.clear();
    }, []);
    return {
        toasts,
        pushToast,
        removeToast
    };
};
