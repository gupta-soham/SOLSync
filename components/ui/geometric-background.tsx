export function GeometricBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      <div className="geometric-circle w-64 h-64 top-20 left-20 bg-[#FF007F]" />
      <div className="geometric-circle w-48 h-48 top-40 right-20 bg-[#00F0FF]" />
      <div className="geometric-triangle w-96 h-96 bottom-20 left-40 bg-[#FFE600]" />
      <div className="geometric-circle w-32 h-32 bottom-40 right-40 bg-[#14F195]" />
    </div>
  )
}