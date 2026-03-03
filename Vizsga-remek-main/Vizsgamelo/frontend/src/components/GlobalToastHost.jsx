import React from "react";
import SuccessToast from "./SuccessToast";
import { onToast } from "./ToastBus";

export default function GlobalToastHost() {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState({
    title: "Siker",
    message: "Kész.",
    duration: 2200,
  });

  React.useEffect(() => {
    return onToast((payload) => {
      if (!payload) return;
      setData({
        title: payload.title ?? "Siker",
        message: payload.message ?? "Kész.",
        duration: payload.duration ?? 2200,
      });
      setOpen(true);
    });
  }, []);

  return (
    <SuccessToast
      open={open}
      onClose={() => setOpen(false)}
      title={data.title}
      message={data.message}
      duration={data.duration}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    />
  );
}