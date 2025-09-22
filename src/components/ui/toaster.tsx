import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, toast: showToast } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            {variant === 'destructive' && description && (
              <ToastAction
                altText="Скопировать ошибку"
                onClick={() => {
                  if (typeof description === 'string') {
                    navigator.clipboard.writeText(description);
                    showToast({ variant: 'success', title: 'Скопировано!', description: 'Текст ошибки скопирован в буфер обмена.' });
                  }
                }}
              >
                Копировать
              </ToastAction>
            )}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
