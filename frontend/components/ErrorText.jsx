export default function ErrorText({ className = "", children }) {
  return (
    <p role="alert" className={`text-sm text-red-700 ${className}`}>
      {children}
    </p>
  );
}
