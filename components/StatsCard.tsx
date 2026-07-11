type Props = {
  title: string;
  value: string;
};

export default function StatsCard({ title, value }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border">
      <p className="text-gray-500">{title}</p>

      <h3 className="text-3xl font-bold text-[#052b1f] mt-3">
        {value}
      </h3>
    </div>
  );
}