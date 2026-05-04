import { Toast } from "./Toast";
export const ToastHost = ({ toasts, onClose }) => (<div className="toast-host" aria-live="polite" aria-atomic="false">
    {toasts.map((toast) => (<Toast key={toast.id} toast={toast} onClose={onClose}/>))}
  </div>);
