export default function Skeleton({ className = "", variant = "text", width = "100%", height, style = {}, ...props }) {
  const classes = ["skeleton", variant, className].filter(Boolean).join(" ");

  return <div className={classes} style={{ width, height, ...style }} {...props} />;
}
