export function categoryOf(code) {
  const n = Number(code);
  if (n >= 100 && n < 200) return "1xx";
  if (n >= 200 && n < 300) return "2xx";
  if (n >= 300 && n < 400) return "3xx";
  if (n >= 400 && n < 500) return "4xx";
  return "5xx";
}

export default function StatusChip({ code, name }) {
  const cat = categoryOf(code);
  return (
    <span className={`status-chip c-${cat}`}>
      <span className="dot" />
      {code}
      {name ? ` ${name}` : ""}
    </span>
  );
}
