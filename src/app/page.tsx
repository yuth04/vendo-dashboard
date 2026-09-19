import {notFound, redirect} from "next/navigation";

export default function RootPage() {
    redirect("/admin");
    notFound();
}