import Image from "next/image";
import { permMarker } from "../lib/fonts";
import type { employee } from "../lib/interface";
import { client, urlFor } from "../lib/sanity";

export const revalidate = 300;

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
      {data.map((post) => (
        <div className="col col-4 textCenter" key={post.title}>
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
