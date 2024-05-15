import { Permanent_Marker } from "next/font/google";
import Image from "next/image";
import { client, urlFor } from "../lib/sanity";
import { employee } from "../lib/interface";

const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});

export const revalidate = 300;
export const dynamic = "force-dynamic";

async function getData() {
  const query = `*[_type == 'employee'] | order(_createdAt asc) {
      title,
      role,
      profilePicture,      
    }`;

  const data = await client.fetch(query);
  return data;
}

export default async function EmployeeGrid() {
  const data: employee[] = await getData();
  return (
    <div className="grid">
      {data.map((post, idx) => (
        <div className="col col-4 textCenter" key={idx}>
          <Image
            src={urlFor(post.profilePicture).url()}
            width={300}
            height={300}
            alt={post.title}
          />
          <h4>{post.title}</h4>
          <h5 className={`specialIngress ${permMarker.className}`}>
            {post.role}
          </h5>
        </div>
      ))}
    </div>
  );
}
