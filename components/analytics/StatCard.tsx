type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
};

export default function StatCard({
  title,
  value,
  change,
  icon,
  color,
}: StatCardProps) {
  return (
    <div
      className="
      bg-white
      rounded-2xl
      shadow-sm
      border
      p-5
      transition-all
      duration-300
      hover:-translate-y-2
      hover:shadow-xl
      cursor-pointer
    "
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>

          <h2 className="text-4xl font-bold mt-2 text-[#0b2f24]">
            {value}
          </h2>

          <p className="text-green-600 text-sm mt-2">
            ↑ {change}
          </p>
        </div>

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: "70%",
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}