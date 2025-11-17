export default function SectionHeading(props: { text: string }) {
  return (
    <div className="relative mb-8 flex items-center gap-4">
      <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/5 bg-white/5 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-transparent to-indigo-500/30" />
        <div className="absolute inset-2 rounded-xl border border-white/10" />
      </div>
      <div className="flex flex-col">
        <h1 className="text-3xl font-semibold text-default-text md:text-4xl">
          {props.text ? props.text : ""}
        </h1>
        <div className="mt-2 h-[2px] w-24 bg-gradient-to-r from-cyan-400 to-indigo-400" />
      </div>
    </div>
  );
}
