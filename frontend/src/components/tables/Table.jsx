export default function Table({ columns, children }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.08]">
            {columns.map((col) => (
              <th
                key={col}
                className="px-5 py-3 font-body text-xs uppercase tracking-wide text-text-tertiary"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}