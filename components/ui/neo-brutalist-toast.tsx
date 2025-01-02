import { toast } from "sonner";
import { CheckCircle, AlertTriangle, Info, X, CircleX } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
}

const getToastStyles = (type: ToastType) => {
  const baseStyles =
    "relative overflow-hidden border-4 border-black p-4 font-black uppercase transition-all duration-300";

  const typeStyles = {
    success:
      "bg-[#14F195] text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    error:
      "bg-[#FF007F] text-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    warning:
      "bg-[#FFE600] text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
    info: "bg-[#00F0FF] text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
  };

  return `${baseStyles} ${typeStyles[type]}`;
};

const getIcon = (type: ToastType) => {
  const iconProps = {
    size: 24,
    className: "mr-2 inline-block",
    color: type === "error" ? "white" : "black",
  };

  switch (type) {
    case "success":
      return <CheckCircle {...iconProps} />;
    case "error":
      return <CircleX {...iconProps} />;
    case "warning":
      return <AlertTriangle {...iconProps} />;
    case "info":
      return <Info {...iconProps} />;
  }
};

const ToastContent = ({
  message,
  type = "success",
}: {
  message: string;
  type: ToastType;
}) => (
  <div className={getToastStyles(type)}>
    {/* Geometric decorative elements */}
    <div className="geometric-triangle w-8 h-8 top-[-10px] right-[-10px] bg-black opacity-10" />
    <div className="geometric-circle w-6 h-6 bottom-[-10px] left-[-10px] bg-black opacity-10" />

    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {getIcon(type)}
        <p className="text-lg">{message}</p>
      </div>
    </div>
  </div>
);

export const showNeoBrutalistToast = ({
  message,
  type = "success",
  duration = 5000,
}: ToastProps) => {
  toast.custom((t) => <ToastContent message={message} type={type} />, {
    duration,
  });
};

// Convenience methods
export const showNeoBrutalistSuccessToast = (
  message: string,
  duration?: number
) => showNeoBrutalistToast({ message, type: "success", duration });

export const showNeoBrutalistErrorToast = (
  message: string,
  duration?: number
) => showNeoBrutalistToast({ message, type: "error", duration });

export const showNeoBrutalistWarningToast = (
  message: string,
  duration?: number
) => showNeoBrutalistToast({ message, type: "warning", duration });

export const showNeoBrutalistInfoToast = (message: string, duration?: number) =>
  showNeoBrutalistToast({ message, type: "info", duration });
