import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="bg-background text-white px-2 md:px-4 py-2 flex flex-col md:flex-row items-center md:items-center relative min-h-[60px]"
      style={{ minHeight: 0 }}
    >
      <div className="flex items-center justify-center md:justify-start w-full md:w-auto mb-2 md:mb-0">
        <Image
          src="/Logo7.png"
          alt="YatraBiz Logo"
          width={120}
          height={40}
          className="rounded-lg shadow-md"
          style={{ objectFit: "contain", height: "40px", width: "120px" }}
        />
      </div>
      <div className="flex flex-col text-center w-full justify-center items-center md:static md:transform-none md:ml-4">
        <span className="text-xs text-gray-400 leading-tight">
          © Yatrabiz Ltd {year}. All rights reserved
        </span>
      </div>
    </footer>
  );
}
