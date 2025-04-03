import {cn} from "@/lib/utils";
import {Poppins} from "next/font/google";
import Image from "next/image";
import Link from "next/link";
const font = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export default function Logo() {
  return (
    <Link href={"/"}>
      <div className="flex items-center gap-x-4 hover:opacity-75 transition">
        <div>
          <Image
            src={"/LOGO.svg"}
            alt="game-hub"
            height={"32"}
            width={"32"}
          />
        </div>
        <div className={cn(font.className, "hidden lg:block")}>
  <p className="text-lg font-semibold">
    SPECTRA
    <span className="text-sky-500">HUB</span>
  </p>
</div>

      </div>
    </Link>
  );
}
