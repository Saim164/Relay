export default function FormField({ id, label, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
        {...inputProps}
      />
    </div>
  );
}
