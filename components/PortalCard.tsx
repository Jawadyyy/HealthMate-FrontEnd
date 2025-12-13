import Link from "next/link";


export default function PortalCard({ title, desc, link }: any) {
return (
<Link href={link} className="card text-center">
<h2 className="text-xl font-semibold text-green-700">{title}</h2>
<p className="text-gray-600 mt-2">{desc}</p>
</Link>
);
}